import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { truncateUserId, maskSensitiveData } from '../_shared/piiMasking.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const maskedDetails = details ? maskSensitiveData(details) : undefined;
  const detailsStr = maskedDetails ? ` - ${JSON.stringify(maskedDetails)}` : '';
  console.log(`[RUN-AB-TEST] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { scriptId, testName, hypothesis, variants } = await req.json();

    if (!scriptId || !testName || !variants || variants.length < 2) {
      throw new Error('Invalid request: scriptId, testName, and at least 2 variants required');
    }

    // Create test record
    const { data: test, error: testError } = await supabaseClient
      .from('ab_tests')
      .insert({
        user_id: user.id,
        script_id: scriptId,
        test_name: testName,
        hypothesis: hypothesis || null,
        status: 'active'
      })
      .select()
      .single();

    if (testError) throw testError;

    // Analyze each variant and create variant records
    const variantResults = [];
    
    for (const variant of variants) {
      // Call analyze-script function
      const { data: analysis, error: analysisError } = await supabaseClient.functions.invoke('analyze-script', {
        body: {
          script: variant.content,
          niche: 'drama', // Could be passed from client
          length: '60s',
          tone: 'suspenseful'
        }
      });

      if (analysisError) {
        console.error(`Error analyzing variant ${variant.name}:`, analysisError);
        continue;
      }

      // Create prediction record
      const { data: prediction, error: predictionError } = await supabaseClient
        .from('predictions_history')
        .insert({
          user_id: user.id,
          title: `${testName} - ${variant.name}`,
          niche: 'drama',
          viral_score: analysis.viralScore || 0,
          engagement_score: analysis.engagement || 0,
          shareability_score: analysis.shareability || 0,
          hook_strength: analysis.hookStrength || 0,
          emotional_impact: analysis.emotionalImpact || 0,
          trend_alignment: analysis.trendAlignment || 0
        })
        .select()
        .single();

      // Create variant record
      const { data: variantRecord, error: variantError } = await supabaseClient
        .from('ab_test_variants')
        .insert({
          test_id: test.id,
          variant_name: variant.name,
          content: variant.content,
          prediction_id: prediction?.id || null,
          viral_score: analysis.viralScore || 0,
          engagement_score: analysis.engagement || 0,
          shareability_score: analysis.shareability || 0,
          hook_strength: analysis.hookStrength || 0,
          emotional_impact: analysis.emotionalImpact || 0,
          trend_alignment: analysis.trendAlignment || 0
        })
        .select()
        .single();

      if (variantError) throw variantError;

      variantResults.push(variantRecord);
    }

    return new Response(
      JSON.stringify({
        success: true,
        test,
        variants: variantResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in run-ab-test:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
