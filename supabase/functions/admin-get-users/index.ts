import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCorsPreflightRequest } from "../_shared/corsHeaders.ts";
import { verifyAuth, verifyAdminRole, logAdminAction } from "../_shared/authHelpers.ts";
import { createErrorResponse, createSuccessResponse } from "../_shared/errorHandler.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const { user, error: authError } = await verifyAuth(req);
    if (authError || !user) {
      return createErrorResponse(authError || 'Authentication failed', 401);
    }

    // Verify admin role
    const isAdmin = await verifyAdminRole(supabaseAdmin, user.id);
    if (!isAdmin) {
      return createErrorResponse('Forbidden - Admin access required', 403);
    }

    // Log admin action
    await logAdminAction(supabaseAdmin, user.id, 'view_users', 'users', req);

    // Fetch users with service role
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select(`
        user_id,
        display_name,
        created_at,
        subscribers (
          subscribed,
          subscription_tier
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;

    return createSuccessResponse({ users: users || [] });

  } catch (error) {
    return createErrorResponse(error);
  }
});
