import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { truncateUserId } from "../_shared/piiMasking.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-VIDEO-PROJECTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
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
    logStep("User authenticated", { userId: truncateUserId(user.id) });

    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');

    if (projectId) {
      // Fetch single project with scenes
      const { data: project, error: projectError } = await supabaseAdmin
        .from('video_projects')
        .select(`
          *,
          script:scripts(title, content),
          scenes:video_scenes(*)
        `)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }
      logStep("Single project retrieved", { projectId });

      return new Response(
        JSON.stringify({ project }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      // Fetch all projects for user
      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('video_projects')
        .select(`
          *,
          script:scripts(title),
          scenes:video_scenes(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }
      logStep("Projects retrieved", { count: projects?.length || 0 });

      return new Response(
        JSON.stringify({ projects }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

  } catch (error) {
    logStep("ERROR in get-video-projects", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});