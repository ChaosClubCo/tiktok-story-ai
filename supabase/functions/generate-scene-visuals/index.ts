import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/corsHeaders.ts';
import { generateImage, AI_MODELS } from '../_shared/aiClient.ts';

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

    // Generate image using best model with fallback
    console.log('Generating image with:', AI_MODELS.imageGeneration.default);
    
    const enhancedPrompt = `Ultra high resolution, cinematic, professional, 16:9 aspect ratio: ${scene.visual_prompt}`;
    
    let result = await generateImage({
      prompt: enhancedPrompt,
      model: AI_MODELS.imageGeneration.default,
    });

    // Fallback to fast model on rate limit or payment error
    if (result.error && (result.error.includes('Rate limit') || result.error.includes('Payment required'))) {
      console.log('Rate limit or payment error, falling back to fast model');
      result = await generateImage({
        prompt: enhancedPrompt,
        model: AI_MODELS.imageGeneration.fast,
      });
    }

    if (result.error || !result.imageUrl) {
      throw new Error(result.error || 'Failed to generate image');
    }

    const imageUrl = result.imageUrl;

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