import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { testId, winnerId } = await req.json();

    if (!testId || !winnerId) {
      throw new Error('Invalid request: testId and winnerId required');
    }

    // Update test record
    const { data: test, error: testError } = await supabaseClient
      .from('ab_tests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        winner_variant_id: winnerId
      })
      .eq('id', testId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (testError) throw testError;

    return new Response(
      JSON.stringify({
        success: true,
        test
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in complete-ab-test:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
