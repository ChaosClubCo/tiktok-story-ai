import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's prediction history
    const { data: predictions, error: predError } = await supabase
      .from('predictions_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (predError) {
      console.error('Error fetching predictions:', predError);
      return new Response(JSON.stringify({ error: 'Failed to fetch predictions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!predictions || predictions.length < 3) {
      return new Response(JSON.stringify({ 
        insights: {
          performanceSummary: "You need at least 3 predictions to generate insights. Keep creating and analyzing scripts!",
          bestPractices: [],
          improvementAreas: [],
          recommendations: []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for AI analysis
    const avgViralScore = Math.round(predictions.reduce((sum, p) => sum + p.viral_score, 0) / predictions.length);
    const avgEngagement = Math.round(predictions.reduce((sum, p) => sum + p.engagement_score, 0) / predictions.length);
    const avgShareability = Math.round(predictions.reduce((sum, p) => sum + p.shareability_score, 0) / predictions.length);
    
    const nichePerformance: Record<string, number[]> = {};
    predictions.forEach(p => {
      if (p.niche) {
        if (!nichePerformance[p.niche]) nichePerformance[p.niche] = [];
        nichePerformance[p.niche].push(p.viral_score);
      }
    });

    const bestNiche = Object.entries(nichePerformance)
      .map(([niche, scores]) => ({ 
        niche, 
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0];

    // Calculate trend (comparing first half vs second half)
    const halfPoint = Math.floor(predictions.length / 2);
    const recentAvg = Math.round(
      predictions.slice(0, halfPoint).reduce((sum, p) => sum + p.viral_score, 0) / halfPoint
    );
    const olderAvg = Math.round(
      predictions.slice(halfPoint).reduce((sum, p) => sum + p.viral_score, 0) / (predictions.length - halfPoint)
    );
    const trendChange = recentAvg - olderAvg;

    const analysisPrompt = `Analyze this TikTok script performance data and provide actionable insights:

User Statistics:
- Total Predictions: ${predictions.length}
- Average Viral Score: ${avgViralScore}/100
- Average Engagement: ${avgEngagement}/100
- Average Shareability: ${avgShareability}/100
- Performance Trend: ${trendChange > 0 ? `Improving (+${trendChange} points)` : trendChange < 0 ? `Declining (${trendChange} points)` : 'Stable'}
- Best Performing Niche: ${bestNiche?.niche || 'N/A'} (${bestNiche?.avgScore || 0}/100)

Recent Scripts Analysis:
${predictions.slice(0, 5).map((p, i) => 
  `${i + 1}. "${p.title}" - Viral: ${p.viral_score}, Hook: ${p.hook_strength}, Emotional: ${p.emotional_impact}, Dialogue: ${p.dialogue_quality}`
).join('\n')}

Provide insights in this exact JSON structure:
{
  "performanceSummary": "2-3 sentence overview of their performance trend and key achievement",
  "bestPractices": ["practice 1", "practice 2", "practice 3"],
  "improvementAreas": ["area 1", "area 2", "area 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Be specific, encouraging, and actionable. Reference actual numbers and patterns.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert TikTok content analyst. Provide clear, actionable insights in valid JSON format only.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to generate insights' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const insightsText = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanedText = insightsText.replace(/```json\n?|\n?```/g, '').trim();
      insights = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse AI response:', e, insightsText);
      insights = {
        performanceSummary: insightsText,
        bestPractices: ["Continue creating content consistently"],
        improvementAreas: ["Focus on stronger hooks"],
        recommendations: ["Analyze your top-performing scripts for patterns"]
      };
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-trend-insights:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});