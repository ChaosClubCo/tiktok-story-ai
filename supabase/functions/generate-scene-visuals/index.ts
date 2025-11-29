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

    // @ts-ignore - Type assertion for project
    if (scene.project.user_id !== user.id) {
      throw new Error('Access denied');
    }

    // Update scene status
    await supabaseAdmin
      .from('video_scenes')
      .update({ status: 'generating_image' })
      .eq('id', sceneId);

    // Generate image using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating image for scene:', scene.visual_prompt);

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: `Generate a high-quality video scene: ${scene.visual_prompt}. Ultra high resolution, cinematic, 16:9 aspect ratio.`
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Image generation failed:', errorText);
      throw new Error(`Image generation failed: ${errorText}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Update scene with image URL
    const { error: updateError } = await supabaseAdmin
      .from('video_scenes')
      .update({ 
        image_url: imageUrl,
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
        asset_type: 'image',
        url: imageUrl,
        mime_type: 'image/png',
        metadata: { prompt: scene.visual_prompt }
      });

    console.log(`Generated image for scene ${sceneId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sceneId,
        imageUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-scene-visuals:', error);
    
    // Try to update scene status to failed if we have the sceneId
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