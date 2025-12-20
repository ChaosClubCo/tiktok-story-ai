import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";

const logStep = (step: string, details?: any) => {
  console.log(`[DELETE-ACCOUNT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Authenticate request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { confirmation } = await req.json();

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return new Response(
        JSON.stringify({ error: 'Invalid confirmation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    logStep('Starting account deletion', { userId: userId.slice(0, 8) });

    // Delete user data in order (respecting foreign key constraints)
    const tablesToClean = [
      // Child tables first
      'ab_test_results',
      'ab_test_variants',
      'ab_tests',
      'video_assets',
      'video_scenes',
      'video_projects',
      'script_versions',
      'script_branches',
      'predictions_history',
      'scripts',
      'series',
      'notification_preferences',
      'subscribers',
      'profiles',
      'user_totp',
    ];

    for (const table of tablesToClean) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
        
        if (error) {
          logStep(`Warning: Error deleting from ${table}`, { error: error.message });
        } else {
          logStep(`Deleted data from ${table}`);
        }
      } catch (e) {
        logStep(`Warning: Failed to delete from ${table}`, { error: e.message });
      }
    }

    // Delete the auth user
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      logStep('Error deleting auth user', { error: deleteUserError.message });
      return new Response(
        JSON.stringify({ error: 'Failed to delete account. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Account deleted successfully', { userId: userId.slice(0, 8) });

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[DELETE-ACCOUNT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
