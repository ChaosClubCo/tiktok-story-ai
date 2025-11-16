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

    const { scriptId, changeDescription } = await req.json();

    if (!scriptId) {
      return new Response(JSON.stringify({ error: 'scriptId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the current script
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .eq('user_id', user.id)
      .single();

    if (scriptError || !script) {
      return new Response(JSON.stringify({ error: 'Script not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the latest version number
    const { data: latestVersion } = await supabase
      .from('script_versions')
      .select('version_number')
      .eq('script_id', scriptId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const newVersionNumber = (latestVersion?.version_number || 0) + 1;

    // Create new version
    const { data: newVersion, error: versionError } = await supabase
      .from('script_versions')
      .insert({
        script_id: scriptId,
        user_id: user.id,
        version_number: newVersionNumber,
        title: script.title,
        content: script.content,
        niche: script.niche,
        length: script.length,
        tone: script.tone,
        topic: script.topic,
        change_description: changeDescription || `Version ${newVersionNumber}`,
      })
      .select()
      .single();

    if (versionError) {
      console.error('Error creating version:', versionError);
      return new Response(JSON.stringify({ error: 'Failed to create version' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update script's current_version and last_version_at
    const { error: updateError } = await supabase
      .from('scripts')
      .update({
        current_version: newVersionNumber,
        last_version_at: new Date().toISOString(),
      })
      .eq('id', scriptId);

    if (updateError) {
      console.error('Error updating script version:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      version: newVersion 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-script-version:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});