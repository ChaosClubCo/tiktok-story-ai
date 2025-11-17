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

    const { scriptId, branchName, description } = await req.json();

    if (!scriptId || !branchName) {
      throw new Error('Invalid request: scriptId and branchName required');
    }

    // Get current script details
    const { data: script, error: scriptError } = await supabaseClient
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .eq('user_id', user.id)
      .single();

    if (scriptError) throw scriptError;

    // Get current version count
    const { data: versions, error: versionsError } = await supabaseClient
      .from('script_versions')
      .select('version_number')
      .eq('script_id', scriptId)
      .order('version_number', { ascending: false })
      .limit(1);

    const currentVersion = versions && versions.length > 0 ? versions[0].version_number : 0;

    // Create branch
    const { data: branch, error: branchError } = await supabaseClient
      .from('script_branches')
      .insert({
        script_id: scriptId,
        user_id: user.id,
        branch_name: branchName,
        created_from_version: currentVersion,
        current_version_content: script.content || '',
        niche: script.niche,
        length: script.length,
        tone: script.tone,
        topic: script.topic,
        is_active: true
      })
      .select()
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
    console.error('Error in create-branch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
