import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/corsHeaders.ts";
import { verifyAuth, verifyAdminRole } from "../_shared/authHelpers.ts";
import { maskUserInfo } from "../_shared/piiMasking.ts";

/**
 * Verify Admin Access Edge Function
 * 
 * Server-side admin route protection that validates authentication
 * and admin role before allowing access to admin pages.
 * 
 * This provides defense-in-depth beyond client-side route guards.
 */

const logStep = (step: string, details?: any) => {
  console.log(`[VERIFY-ADMIN-ACCESS] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Verification request received");

    // Verify authentication
    const { user, error } = await verifyAuth(req);
    
    if (error || !user) {
      logStep("Authentication failed", { error });
      return new Response(
        JSON.stringify({ 
          authorized: false, 
          error: error || 'Unauthorized' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log authenticated user (with PII masking)
    logStep("User authenticated", maskUserInfo(user));

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin role
    const isAdmin = await verifyAdminRole(supabase, user.id);
    
    if (!isAdmin) {
      logStep("Admin verification failed - user is not an admin", { 
        userId: user.id.slice(0, 8) + '...' 
      });
      return new Response(
        JSON.stringify({ 
          authorized: false, 
          error: 'Forbidden - Admin access required' 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("Admin access granted", { userId: user.id.slice(0, 8) + '...' });

    // Return success with user info
    return new Response(
      JSON.stringify({ 
        authorized: true,
        userId: user.id,
        email: user.email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-admin-access", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        authorized: false, 
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
