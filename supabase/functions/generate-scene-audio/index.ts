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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { sceneId } = await req.json();

    if (!sceneId) {
      throw new Error('Scene ID is required');
    }

    // Fetch scene details
    const { data: scene, error: sceneError } = await supabaseAdmin
      .from('video_scenes')
      .select(`
        *,
        project:video_projects!inner(user_id, settings)
      `)
      .eq('id', sceneId)
      .single();

    if (sceneError || !scene) {
      throw new Error('Scene not found');
    }

    // @ts-ignore
    if (scene.project.user_id !== user.id) {
      throw new Error('Access denied');
    }

    // Update scene status
    await supabaseAdmin
      .from('video_scenes')
      .update({ status: 'generating_audio' })
      .eq('id', sceneId);

    // Generate audio using OpenAI TTS
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // @ts-ignore
    const voiceId = scene.project.settings?.voiceId || 'alloy';
    console.log('Generating audio for scene with voice:', voiceId);

    const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: scene.script_segment,
        voice: voiceId,
        response_format: 'mp3'
      })
    });

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('Audio generation failed:', errorText);
      throw new Error(`Audio generation failed: ${errorText}`);
    }

    // Convert audio to base64
    const arrayBuffer = await audioResponse.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Update scene with audio URL
    const { error: updateError } = await supabaseAdmin
      .from('video_scenes')
      .update({ 
        audio_url: audioUrl,
        status: 'completed'
      })
      .eq('id', sceneId);

    if (updateError) {
      throw new Error(`Failed to update scene: ${updateError.message}`);
    }

    // Create asset record
    await supabaseAdmin
      .from('video_assets')
      .insert({
        project_id: scene.project_id,
        scene_id: sceneId,
        asset_type: 'audio',
        url: audioUrl,
        mime_type: 'audio/mp3',
        metadata: { voice: voiceId }
      });

    console.log(`Generated audio for scene ${sceneId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sceneId,
        audioUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-scene-audio:', error);
    
    const body = await req.json().catch(() => ({}));
    if (body.sceneId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseAdmin
        .from('video_scenes')
        .update({ status: 'failed' })
        .eq('id', body.sceneId)
        .catch(console.error);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});