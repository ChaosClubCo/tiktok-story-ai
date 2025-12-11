import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { truncateUserId } from "../_shared/piiMasking.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SWITCH-BRANCH] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId: truncateUserId(user.id) });

    const { scriptId, branchId } = await req.json();

    if (!scriptId || !branchId) {
      throw new Error('Invalid request: scriptId and branchId required');
    }
    logStep("Switching branch", { scriptId, branchId });

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
    logStep("Branch switched successfully", { branchName: branch.branch_name });

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
    logStep("ERROR in switch-branch", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
