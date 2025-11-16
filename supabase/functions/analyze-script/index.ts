import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  viral_score: number;
  engagement_score: number;
  shareability_score: number;
  hook_strength: number;
  emotional_impact: number;
  conflict_clarity: number;
  pacing_quality: number;
  dialogue_quality: number;
  quotability: number;
  relatability: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { scriptId, content, title, niche } = await req.json();

    if (!content) {
      throw new Error('Script content is required');
    }

    console.log('Analyzing script:', { scriptId, title, niche });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Construct analysis prompt
    const systemPrompt = `You are an expert social media content analyst specializing in viral TikTok and Instagram content. 
Your job is to analyze mini-drama scripts and provide detailed viral potential scores.

Analyze the following aspects:
1. Hook Strength (0-100): How compelling is the opening? Does it grab attention in 3 seconds?
2. Emotional Impact (0-100): Does it trigger strong emotions (anger, shock, empathy, humor)?
3. Conflict Clarity (0-100): Is there clear tension/stakes that keep viewers watching?
4. Pacing Quality (0-100): Does the story flow well? Are there unnecessary parts?
5. Dialogue Quality (0-100): Is the dialogue natural, quotable, and memorable?
6. Quotability (0-100): Are there lines people will repeat or comment?
7. Relatability (0-100): Will the target audience see themselves in this story?

Provide scores and specific, actionable recommendations.`;

    const userPrompt = `Analyze this mini-drama script:

TITLE: ${title || 'Untitled'}
NICHE: ${niche || 'Unknown'}

SCRIPT CONTENT:
${content}

Provide a detailed analysis with scores and recommendations.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'provide_viral_analysis',
            description: 'Provide detailed viral potential analysis with scores and recommendations',
            parameters: {
              type: 'object',
              properties: {
                hook_strength: { type: 'number', description: 'Score 0-100 for hook quality' },
                emotional_impact: { type: 'number', description: 'Score 0-100 for emotional triggers' },
                conflict_clarity: { type: 'number', description: 'Score 0-100 for conflict/tension' },
                pacing_quality: { type: 'number', description: 'Score 0-100 for story pacing' },
                dialogue_quality: { type: 'number', description: 'Score 0-100 for dialogue' },
                quotability: { type: 'number', description: 'Score 0-100 for memorable lines' },
                relatability: { type: 'number', description: 'Score 0-100 for audience connection' },
                strengths: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'List of 2-4 specific strengths'
                },
                weaknesses: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'List of 2-4 specific weaknesses'
                },
                recommendations: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'List of 3-5 actionable improvement recommendations'
                }
              },
              required: [
                'hook_strength', 'emotional_impact', 'conflict_clarity',
                'pacing_quality', 'dialogue_quality', 'quotability', 'relatability',
                'strengths', 'weaknesses', 'recommendations'
              ],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_viral_analysis' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to your workspace.');
      }
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No analysis result from AI');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    // Calculate composite scores
    const viral_score = Math.round(
      (analysis.hook_strength * 0.3) +
      (analysis.emotional_impact * 0.25) +
      (analysis.conflict_clarity * 0.2) +
      (analysis.quotability * 0.15) +
      (analysis.relatability * 0.1)
    );

    const engagement_score = Math.round(
      (analysis.pacing_quality * 0.5) +
      (analysis.dialogue_quality * 0.3) +
      (analysis.conflict_clarity * 0.2)
    );

    const shareability_score = Math.round(
      (analysis.quotability * 0.4) +
      (analysis.relatability * 0.35) +
      (analysis.emotional_impact * 0.25)
    );

    const result: AnalysisResult = {
      viral_score,
      engagement_score,
      shareability_score,
      hook_strength: analysis.hook_strength,
      emotional_impact: analysis.emotional_impact,
      conflict_clarity: analysis.conflict_clarity,
      pacing_quality: analysis.pacing_quality,
      dialogue_quality: analysis.dialogue_quality,
      quotability: analysis.quotability,
      relatability: analysis.relatability,
      recommendations: analysis.recommendations,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses
    };

    console.log('Analysis complete:', { viral_score, engagement_score, shareability_score });

    // Save prediction to history
    try {
      const { error: historyError } = await supabase
        .from('predictions_history')
        .insert({
          user_id: user.id,
          script_id: scriptId || null,
          prediction_type: scriptId ? 'full_script' : 'premise',
          title: title || 'Untitled',
          content: content,
          niche: niche || null,
          viral_score,
          engagement_score,
          shareability_score,
          hook_strength: analysis.hook_strength,
          emotional_impact: analysis.emotional_impact,
          conflict_clarity: analysis.conflict_clarity,
          pacing_quality: analysis.pacing_quality,
          dialogue_quality: analysis.dialogue_quality,
          quotability: analysis.quotability,
          relatability: analysis.relatability,
          recommendations: analysis.recommendations,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses
        });

      if (historyError) {
        console.error('Failed to save prediction history:', historyError);
        // Don't fail the request if history save fails
      } else {
        console.log('Prediction saved to history');
      }
    } catch (historyErr) {
      console.error('Error saving prediction history:', historyErr);
    }

    return new Response(
      JSON.stringify({ success: true, analysis: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing script:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
