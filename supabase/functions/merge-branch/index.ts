import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { truncateUserId } from "../_shared/piiMasking.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MERGE-BRANCH] ${step}${detailsStr}`);
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

    const { branchId, scriptId } = await req.json();

    if (!branchId || !scriptId) {
      throw new Error('Invalid request: branchId and scriptId required');
    }
    logStep("Processing merge request", { branchId, scriptId });

    // Get branch details
    const { data: branch, error: branchError } = await supabaseClient
      .from('script_branches')
      .select('*')
      .eq('id', branchId)
      .eq('user_id', user.id)
      .single();

    if (branchError) throw branchError;

    if (branch.branch_name === 'main') {
      throw new Error('Cannot merge main branch');
    }

    // Get current version number for main branch
    const { data: versions, error: versionsError } = await supabaseClient
      .from('script_versions')
      .select('version_number')
      .eq('script_id', scriptId)
      .eq('branch_name', 'main')
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Create new version in main branch with branch content
    const { data: newVersion, error: versionError } = await supabaseClient
      .from('script_versions')
      .insert({
        script_id: scriptId,
        user_id: user.id,
        version_number: nextVersion,
        content: branch.current_version_content,
        branch_name: 'main',
        change_description: `Merged from branch: ${branch.branch_name}`
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // Update script with new content
    const { error: updateError } = await supabaseClient
      .from('scripts')
      .update({
        content: branch.current_version_content,
        updated_at: new Date().toISOString()
      })
      .eq('id', scriptId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Mark branch as merged
    const { error: branchUpdateError } = await supabaseClient
      .from('script_branches')
      .update({
        merged_at: new Date().toISOString(),
        merged_by: user.id
      })
      .eq('id', branchId);

    if (branchUpdateError) throw branchUpdateError;

    logStep("Branch merged successfully", { newVersionId: newVersion.id });

    return new Response(
      JSON.stringify({
        success: true,
        newVersion
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logStep("ERROR in merge-branch", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
