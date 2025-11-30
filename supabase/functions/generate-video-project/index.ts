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

    const { scriptId, title, description, settings } = await req.json();

    if (!scriptId || !title) {
      throw new Error('Script ID and title are required');
    }

    // Fetch the script content
    const { data: script, error: scriptError } = await supabaseAdmin
      .from('scripts')
      .select('content, title')
      .eq('id', scriptId)
      .eq('user_id', user.id)
      .single();

    if (scriptError || !script) {
      throw new Error('Script not found or access denied');
    }

    // Create video project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('video_projects')
      .insert({
        user_id: user.id,
        script_id: scriptId,
        title,
        description,
        status: 'draft',
        settings: settings || {}
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    // Parse script into scenes (split by paragraphs or sentences)
    const scriptSegments = script.content
      .split(/\n\n+/)
      .filter(segment => segment.trim().length > 0)
      .slice(0, 20); // Limit to 20 scenes

    // Create scenes
    const scenes = scriptSegments.map((segment, index) => ({
      project_id: project.id,
      sequence_order: index + 1,
      script_segment: segment.trim(),
      visual_prompt: generateVisualPrompt(segment.trim(), index, settings),
      duration_seconds: calculateDuration(segment.trim()),
      status: 'pending',
      settings: {
        transitionType: settings?.transitionType || 'fade',
        transitionDuration: settings?.transitionDuration || 0.5,
      }
    }));

    const { error: scenesError } = await supabaseAdmin
      .from('video_scenes')
      .insert(scenes);

    if (scenesError) {
      throw new Error(`Failed to create scenes: ${scenesError.message}`);
    }

    console.log(`Created video project ${project.id} with ${scenes.length} scenes`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        project,
        sceneCount: scenes.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-video-project:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function generateVisualPrompt(scriptSegment: string, index: number, templateSettings?: any): string {
  // Extract key visual elements from the script segment
  const words = scriptSegment.toLowerCase();
  
  // Start with template visual style if provided
  let style = templateSettings?.visualStyle || "cinematic, dramatic lighting, high quality";
  let colorGrading = templateSettings?.colorGrading || "";
  let subject = "";
  
  // Simple keyword detection for visual generation
  if (words.includes('night') || words.includes('dark')) {
    style += ", nighttime scene";
  } else if (words.includes('day') || words.includes('morning')) {
    style += ", daytime scene, bright";
  }
  
  if (words.includes('city') || words.includes('urban')) {
    subject = "urban cityscape";
  } else if (words.includes('forest') || words.includes('nature')) {
    subject = "natural landscape, forest";
  } else if (words.includes('beach') || words.includes('ocean')) {
    subject = "beach scene, ocean";
  } else if (words.includes('room') || words.includes('house')) {
    subject = "interior room scene";
  } else {
    subject = "abstract concept visualization";
  }
  
  // Combine all elements
  const prompt = `${subject}, ${style}${colorGrading ? ', ' + colorGrading : ''}, scene ${index + 1}`;
  return prompt;
}

function calculateDuration(segment: string): number {
  // Estimate duration based on word count (average reading speed: 150 words/min)
  const wordCount = segment.split(/\s+/).length;
  const seconds = Math.max(3, Math.ceil((wordCount / 150) * 60));
  return Math.min(seconds, 15); // Cap at 15 seconds per scene
}