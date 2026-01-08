import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { truncateUserId, maskSensitiveData } from "../_shared/piiMasking.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const maskedDetails = details ? maskSensitiveData(details) : undefined;
  console.log(`[${new Date().toISOString()}] ${step}`, maskedDetails ? JSON.stringify(maskedDetails) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting series generation');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    logStep('User authenticated', { userId: user.id });

    // Parse request body
    const body = await req.json();
    const { premise, niche, tone, episodeCount = 5 } = body;

    if (!premise || !niche) {
      return new Response(
        JSON.stringify({ error: 'Premise and niche are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Input validation to prevent cost amplification and prompt injection
    if (premise.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Premise must be less than 500 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (niche.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Niche must be less than 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tone && tone.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Tone must be less than 50 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs (remove control characters)
    const sanitizedPremise = premise.replace(/[\x00-\x1F\x7F]/g, '').trim();
    const sanitizedNiche = niche.replace(/[\x00-\x1F\x7F]/g, '').trim();
    const sanitizedTone = tone ? tone.replace(/[\x00-\x1F\x7F]/g, '').trim() : '';

    // Detect potential prompt injection attempts
    const prohibitedPhrases = [
      'ignore previous', 'disregard instructions', 'system prompt', 
      'jailbreak', 'bypass', 'override'
    ];
    
    const inputText = `${sanitizedPremise} ${sanitizedNiche} ${sanitizedTone}`.toLowerCase();
    const hasProhibitedContent = prohibitedPhrases.some(phrase => inputText.includes(phrase));
    
    if (hasProhibitedContent) {
      return new Response(
        JSON.stringify({ error: 'Input contains prohibited content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (episodeCount < 3 || episodeCount > 10) {
      return new Response(
        JSON.stringify({ error: 'Episode count must be between 3 and 10' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create series record
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .insert({
        user_id: user.id,
        title: `${sanitizedPremise} - Mini Drama Series`,
        premise: sanitizedPremise,
        niche: sanitizedNiche,
        tone: sanitizedTone,
        total_episodes: episodeCount,
        description: `A ${episodeCount}-part vertical drama series`
      })
      .select()
      .single();

    if (seriesError) throw seriesError;

    logStep('Series created', { seriesId: series.id });

    // Generate series bible using OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    const biblePrompt = `Create a series bible for a ${episodeCount}-episode vertical video mini-drama series.

PREMISE: ${sanitizedPremise}
NICHE: ${sanitizedNiche}
TONE: ${sanitizedTone}

Generate a comprehensive series bible including:
1. Main characters (2-3 characters with names, roles, motivations)
2. Overall story arc (beginning, middle, end)
3. Key conflicts and themes
4. Setting and world details
5. Episode breakdown (brief summary for each episode)

Each episode should be 60-90 seconds long, designed for 9:16 vertical video format.
End each episode with a compelling cliffhanger to drive binge-watching.`;

    const bibleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert screenwriter for viral short-form vertical video content. You specialize in creating binge-worthy mini-drama series.'
          },
          {
            role: 'user',
            content: biblePrompt
          }
        ],
        temperature: 0.8,
      }),
    });

    const bibleData = await bibleResponse.json();
    const bible = bibleData.choices[0].message.content;

    logStep('Series bible generated');

    // Generate individual episodes
    const episodes = [];
    for (let i = 1; i <= episodeCount; i++) {
      const isFirstEpisode = i === 1;
      const isLastEpisode = i === episodeCount;

      const episodePrompt = `Generate Episode ${i} of ${episodeCount} for the mini-drama series.

SERIES BIBLE:
${bible}

EPISODE ${i} REQUIREMENTS:
${isFirstEpisode ? '- Introduce main characters and establish the world\n- Set up the central conflict\n' : ''}
${isLastEpisode ? '- Resolve the main storyline\n- Provide satisfying conclusion\n' : '- Continue the narrative momentum\n- End with a cliffhanger\n'}
- Duration: 60-90 seconds
- Format: Vertical video (9:16)
- Include timestamps for each scene

OUTPUT FORMAT:
Title: [Episode title]
Duration: [60-90s]

[0-15s] OPENING
[Scene description and dialogue]

[16-35s] ESCALATION
[Scene description and dialogue]

[36-60s] CLIMAX
[Scene description and dialogue]

${isLastEpisode ? '' : '[61-75s] CLIFFHANGER\n[Scene description and dialogue]\n\n[Preview for Episode ' + (i + 1) + ']'}

Tone: ${sanitizedTone}
Niche: ${sanitizedNiche}`;

      const episodeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert screenwriter for viral short-form vertical video content.'
            },
            {
              role: 'user',
              content: episodePrompt
            }
          ],
          temperature: 0.8,
        }),
      });

      const episodeData = await episodeResponse.json();
      const episodeContent = episodeData.choices[0].message.content;

      // Extract title from content
      const titleMatch = episodeContent.match(/Title:\s*(.+)/);
      const episodeTitle = titleMatch ? titleMatch[1].trim() : `Episode ${i}`;

      // Save episode to database
      const { data: script, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          user_id: user.id,
          series_id: series.id,
          episode_number: i,
          title: episodeTitle,
          content: episodeContent,
          niche,
          tone,
          length: '60s',
          script_mode: 'mini_drama_series',
          fiction_disclaimer: true
        })
        .select()
        .single();

      if (scriptError) throw scriptError;

      episodes.push(script);
      logStep(`Episode ${i} generated`, { scriptId: script.id });
    }

    logStep('Series generation complete', { episodeCount: episodes.length });

    return new Response(
      JSON.stringify({
        series,
        episodes,
        bible
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Error', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
