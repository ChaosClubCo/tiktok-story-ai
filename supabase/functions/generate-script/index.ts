import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
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
    logStep("User authenticated", { userId: user.id });

    const body = await req.json();
    const { niche, length, tone, topic } = body;
    
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

    // Content filtering - check for inappropriate content
    const inappropriateWords = ['explicit', 'adult', 'nsfw', 'sexual', 'violence', 'hate', 'illegal'];
    const allInputs = [niche, tone, topic || ''].join(' ').toLowerCase();
    if (inappropriateWords.some(word => allInputs.includes(word))) {
      return new Response(
        JSON.stringify({ error: "Request contains inappropriate content" }),
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

    logStep("Generating script", { niche, length, tone, topic });

    const prompt = `Generate a ${length} mini-drama script in the ${niche} niche with a ${tone} tone${topic ? ` about ${topic}` : ''}. 

Requirements:
- Create an engaging title
- Write compelling dialogue and scene descriptions
- Include character development and emotional moments
- Format it as a proper script with scene headers, character names, and dialogue
- Make it suitable for social media or short video content
- Length should be appropriate for ${length} format

Please provide both a title and the full script content.`;

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
            content: 'You are a professional screenwriter who specializes in creating engaging mini-drama scripts for social media and short video content. Your scripts should be emotionally compelling, well-structured, and suitable for the specified niche and tone.' 
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
        title = `${niche} Mini-Drama - ${tone} Tone`;
      }
    }

    logStep("Script generated successfully", { titleLength: title.length, contentLength: content.length });

    return new Response(JSON.stringify({ 
      title,
      content,
      niche,
      length,
      tone,
      topic
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