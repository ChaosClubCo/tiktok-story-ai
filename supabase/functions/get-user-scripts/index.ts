import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-USER-SCRIPTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
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

    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit') || '10';
    const offsetParam = url.searchParams.get('offset') || '0';
    
    // Input validation for pagination parameters
    const limit = Math.min(Math.max(parseInt(limitParam), 1), 100); // Max 100 items
    const offset = Math.max(parseInt(offsetParam), 0);

    logStep("Fetching user scripts", { limit, offset });

    const { data: scripts, error: fetchError } = await supabaseClient
      .from('scripts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      logStep("Error fetching scripts", { error: fetchError });
      throw new Error(`Database error: ${fetchError.message}`);
    }

    const { count, error: countError } = await supabaseClient
      .from('scripts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      logStep("Error getting script count", { error: countError });
    }

    logStep("Scripts fetched successfully", { 
      scriptsCount: scripts?.length || 0,
      totalCount: count || 0
    });

    return new Response(JSON.stringify({ 
      scripts: scripts || [],
      total: count || 0,
      limit,
      offset
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-user-scripts", { message: errorMessage });
    
    // Secure error handling
    const publicError = "Failed to retrieve scripts. Please try again.";
    
    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});