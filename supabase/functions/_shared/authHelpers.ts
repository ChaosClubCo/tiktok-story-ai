import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { truncateUserId } from "./piiMasking.ts";

export interface AuthResult {
  user: any;
  error?: string;
}

/**
 * Verify user authentication from request headers
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { user: null, error: 'Unauthorized - Missing authentication' };
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    console.error('[AUTH] Authentication failed:', authError?.message);
    return { user: null, error: 'Unauthorized - Invalid token' };
  }

  console.log('[AUTH] User authenticated:', truncateUserId(user.id));
  return { user };
}

/**
 * Verify user has admin role
 */
export async function verifyAdminRole(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: isAdmin, error } = await supabase.rpc('is_admin', { _user_id: userId });
  
  if (error) {
    console.error('[AUTH] Admin check failed:', error.message);
    return false;
  }

  if (isAdmin) {
    console.log('[AUTH] Admin role verified:', truncateUserId(userId));
  }

  return !!isAdmin;
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  resourceType: string,
  req: Request,
  resourceId?: string,
  metadata?: any
) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
  const userAgent = req.headers.get('user-agent');

  try {
    await supabase.from('admin_audit_log').insert({
      admin_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: {
        ...metadata,
        logged_at: new Date().toISOString(),
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    console.log('[AUDIT] Admin action logged:', {
      userId: truncateUserId(userId),
      action,
      resourceType,
      resourceId,
    });
  } catch (error) {
    console.error('[AUDIT] Failed to log admin action:', error);
  }
}

/**
 * Create a service role client with request context for audit logging
 */
export function createServiceRoleClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );
}
