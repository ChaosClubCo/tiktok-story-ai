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

    const { scriptId, branchId } = await req.json();

    if (!scriptId || !branchId) {
      throw new Error('Invalid request: scriptId and branchId required');
    }

    // Update active branch in scripts table
    const { error: updateError } = await supabaseClient
      .from('scripts')
      .update({
        active_branch_id: branchId
      })
      .eq('id', scriptId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Get branch content
    const { data: branch, error: branchError } = await supabaseClient
      .from('script_branches')
      .select('*')
      .eq('id', branchId)
      .single();

    if (branchError) throw branchError;

    return new Response(
      JSON.stringify({
        success: true,
        branch
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in switch-branch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
