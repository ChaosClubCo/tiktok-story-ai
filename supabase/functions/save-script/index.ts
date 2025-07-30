import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SAVE-SCRIPT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    logStep("User authenticated", { userId: user.id });

    const body = await req.json();
    
    // Input size validation
    if (JSON.stringify(body).length > 50000) {
      return new Response(
        JSON.stringify({ error: "Request too large" }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { title, content, niche, length, tone, topic } = body;
    
    if (!title || !content || !niche || !length || !tone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, content, niche, length, tone" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Input sanitization and length validation
    if (title.length > 200 || content.length > 10000 || niche.length > 100 || 
        length.length > 50 || tone.length > 50 || (topic && topic.length > 500)) {
      return new Response(
        JSON.stringify({ error: "Input fields exceed maximum length limits" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logStep("Saving script", { title, niche, length, tone });

    const { data: scriptData, error: saveError } = await supabaseClient
      .from('scripts')
      .insert({
        user_id: user.id,
        title,
        content,
        niche,
        length,
        tone,
        topic: topic || null
      })
      .select()
      .single();

    if (saveError) {
      logStep("Error saving script", { error: saveError });
      throw new Error(`Database error: ${saveError.message}`);
    }

    logStep("Script saved successfully", { scriptId: scriptData.id });

    return new Response(JSON.stringify({ 
      success: true,
      script: scriptData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in save-script", { message: errorMessage });
    
    // Secure error handling
    let publicError = "Failed to save script. Please try again.";
    if (errorMessage.includes("Database error")) {
      publicError = "Database temporarily unavailable. Please try again later.";
    }
    
    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});