import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { maskUserInfo, maskSensitiveData, truncateUserId } from "../_shared/piiMasking.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const maskedDetails = details ? maskSensitiveData(details) : undefined;
  const detailsStr = maskedDetails ? ` - ${JSON.stringify(maskedDetails)}` : '';
  console.log(`[GENERATE-SCRIPT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    logStep("User authenticated", { userId: truncateUserId(user.id) });

    const body = await req.json();
    const { niche, length, tone, topic, scriptMode = 'standard', trendId, templateId } = body;
    
    // Enhanced input validation and sanitization
    if (!niche || !length || !tone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: niche, length, tone" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Input length limits and validation
    if (niche.length > 100 || length.length > 50 || tone.length > 50 || (topic && topic.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Input fields exceed maximum length limits" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enhanced content filtering
    const PROHIBITED_CONTENT = {
      selfHarm: ['suicide', 'cutting', 'self-harm', 'kill myself'],
      violence: ['murder', 'assault', 'abuse', 'torture'],
      harassment: ['doxx', 'real name', 'address', 'phone number'],
      illegalActivity: ['drugs', 'trafficking', 'fraud'],
      hateSpeech: ['racial slur', 'homophobic', 'transphobic'],
      explicit: ['explicit', 'adult', 'nsfw', 'sexual']
    };
    
    const allInputs = [niche, tone, topic || ''].join(' ').toLowerCase();
    const safetyFlags = [];
    
    for (const [category, keywords] of Object.entries(PROHIBITED_CONTENT)) {
      if (keywords.some(keyword => allInputs.includes(keyword))) {
        safetyFlags.push(category);
      }
    }
    
    if (safetyFlags.length > 0) {
      return new Response(
        JSON.stringify({ error: "Request contains inappropriate content", categories: safetyFlags }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Rate limiting check - prevent abuse
    const { data: recentScripts, error: rateLimitError } = await supabaseClient
      .from('scripts')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('created_at', { ascending: false });

    if (rateLimitError) {
      logStep("Rate limit check failed", { error: rateLimitError });
    } else if (recentScripts && recentScripts.length >= 10) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before generating more scripts." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logStep("Generating script", { niche, length, tone, topic, scriptMode });

    // Mode-specific prompts
    let prompt = '';
    let systemMessage = 'You are a professional screenwriter who specializes in creating engaging mini-drama scripts for social media and short video content.';
    
    if (scriptMode === 'ai_storytime') {
      systemMessage = 'You are an expert in creating viral AI voiceover storytime scripts. You specialize in chaotic, dramatic, embarrassing stories optimized for TTS delivery.';
      prompt = `Generate a TTS-optimized AI voiceover storytime script for "${topic || niche}" in ${niche} niche.

CRITICAL REQUIREMENTS:
1. Write for AI voiceover pacing - use natural pauses, shorter sentences
2. Include [PAUSE] markers every 3-5 seconds for B-roll cuts
3. Use "chaotic, dramatic, embarrassing" storytelling style
4. Start with a STRONG hook: "So this actually happened to me..."
5. Include emotional peaks: shock, realization, punchline
6. End with a viral callback or question

FORMAT:
[0-3s] HOOK: [opening line]
[PAUSE - show reaction shot]
[4-8s] SETUP: [scene setting]
[PAUSE - show B-roll]
[9-15s] ESCALATION: [conflict builds]
[PAUSE - dramatic moment]
[16-22s] CLIMAX: [peak moment]
[PAUSE - reaction]
[23-30s] PUNCHLINE: [twist or callback]

Tone: ${tone}
Length: ${length}
Optimize for: Podcastle/ElevenLabs TTS

IMPORTANT: This is FICTION ONLY. Do not use real people's names, specific locations, or anything that could be mistaken for real testimony. Add disclaimer at end: "This is a work of fiction."`;

    } else if (scriptMode === 'pov_skit') {
      systemMessage = 'You are an expert in creating viral POV (Point of View) mini-drama scripts with multiple hook variations for A/B testing.';
      prompt = `Generate a POV (Point of View) mini-drama script for "${topic || niche}" in ${niche} niche.

STRUCTURE:
- Opening: "POV: You're [role] and [inciting incident] happens"
- 3-5 scenes showing escalation
- Each scene = 5-8 seconds
- Include stage directions for acting
- Dialogue should be punchy and quotable

FIRST, generate 5 HOOK VARIATIONS (clearly labeled):
HOOK 1: [variation]
HOOK 2: [variation]
HOOK 3: [variation]
HOOK 4: [variation]
HOOK 5: [variation]

THEN, provide the CORE SPINE (main script with timestamps).

Topic: ${topic || niche}
Niche: ${niche}
Tone: ${tone}
Length: ${length}`;

    } else {
      // Standard mode
      prompt = `Generate a ${length} mini-drama script in the ${niche} niche with a ${tone} tone${topic ? ` about ${topic}` : ''}. 

Requirements:
- Create an engaging title
- Write compelling dialogue and scene descriptions
- Include character development and emotional moments
- Format it as a proper script with scene headers, character names, and dialogue
- Make it suitable for social media or short video content
- Length should be appropriate for ${length} format

Please provide both a title and the full script content.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemMessage
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Extract title and content from the generated script
    const lines = generatedContent.split('\n');
    let title = '';
    let content = generatedContent;
    let hookVariations: string[] = [];
    let beatMarkers: any[] = [];
    
    // Extract hook variations for POV mode
    if (scriptMode === 'pov_skit') {
      const hookMatches = generatedContent.matchAll(/HOOK\s*\d+:\s*(.+)/gi);
      hookVariations = Array.from(hookMatches).map(match => match[1].trim());
    }
    
    // Extract beat markers for AI storytime mode
    if (scriptMode === 'ai_storytime') {
      const timestampRegex = /\[(\d+-\d+s)\]\s*([^:]+):\s*([^\[]+)/g;
      let match;
      while ((match = timestampRegex.exec(generatedContent)) !== null) {
        const [, timestamp, label, text] = match;
        const [start, end] = timestamp.replace('s', '').split('-').map(Number);
        beatMarkers.push({ start, end, label: label.trim(), text: text.trim() });
      }
      
      // Extract pause markers
      const pauseMatches = generatedContent.matchAll(/\[PAUSE\s*-\s*([^\]]+)\]/g);
      for (const pauseMatch of pauseMatches) {
        beatMarkers.push({ type: 'pause', action: pauseMatch[1].trim() });
      }
    }
    
    // Try to extract title if it's clearly marked
    const titleMatch = generatedContent.match(/(?:Title:|TITLE:)\s*(.+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      content = generatedContent.replace(/(?:Title:|TITLE:)\s*.+\n?/i, '').trim();
    } else {
      // Use first line as title if it looks like a title
      const firstLine = lines[0].trim();
      if (firstLine.length < 100 && !firstLine.includes(':')) {
        title = firstLine;
        content = lines.slice(1).join('\n').trim();
      } else {
        title = scriptMode === 'ai_storytime' ? 'AI Storytime Script' : 
                scriptMode === 'pov_skit' ? 'POV Skit Script' :
                `${niche} Mini-Drama - ${tone} Tone`;
      }
    }

    logStep("Script generated successfully", { 
      titleLength: title.length, 
      contentLength: content.length,
      hookCount: hookVariations.length,
      beatMarkerCount: beatMarkers.length
    });

    return new Response(JSON.stringify({ 
      title,
      content,
      niche,
      length,
      tone,
      topic,
      scriptMode,
      hookVariations: hookVariations.length > 0 ? hookVariations : undefined,
      beatMarkers: beatMarkers.length > 0 ? beatMarkers : undefined,
      ttsOptimized: scriptMode === 'ai_storytime',
      fictionDisclaimer: scriptMode === 'ai_storytime',
      trendId: trendId || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-script", { message: errorMessage });
    
    // Secure error handling - don't expose internal details
    let publicError = "An unexpected error occurred. Please try again.";
    if (errorMessage.includes("OpenAI API")) {
      publicError = "AI service temporarily unavailable. Please try again later.";
    } else if (errorMessage.includes("rate limit")) {
      publicError = "Too many requests. Please wait before trying again.";
    }
    
    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});