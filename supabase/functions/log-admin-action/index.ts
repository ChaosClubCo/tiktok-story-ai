import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { truncateUserId, maskSensitiveData } from "../_shared/piiMasking.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const maskedDetails = details ? maskSensitiveData(details) : undefined;
  console.log(`[LOG-ADMIN-ACTION] ${step}`, maskedDetails ? JSON.stringify(maskedDetails) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { data: isAdmin } = await supabaseAdmin.rpc('is_admin', { _user_id: user.id });
    if (!isAdmin) throw new Error('Not authorized');

    const { action, resource_type, resource_id, reason, metadata } = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
    const userAgent = req.headers.get('user-agent');

    // Enhanced audit log entry with additional context
    const auditEntry = {
      admin_id: user.id,
      action,
      resource_type,
      resource_id,
      reason,
      metadata: {
        ...metadata,
        logged_at: new Date().toISOString(),
        service_role_operation: true,
        source: 'log-admin-action',
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    const { error: logError } = await supabaseAdmin
      .from('admin_audit_log')
      .insert(auditEntry);

    if (logError) throw logError;

    logStep('Admin action logged', {
      userId: truncateUserId(user.id),
      action,
      resourceType: resource_type,
      resourceId: resource_id,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[LOG-ADMIN-ACTION] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
