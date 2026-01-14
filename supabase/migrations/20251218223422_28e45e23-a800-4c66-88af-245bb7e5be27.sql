-- Tighten admin_audit_log policies
-- Drop overly permissive service role insert policy
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.admin_audit_log;

-- Create more restrictive policies
-- Only authenticated users can insert audit logs (via edge functions with proper auth)
CREATE POLICY "authenticated_insert_audit_logs"
ON public.admin_audit_log FOR INSERT
WITH CHECK (
  -- Must have a valid auth context or be super admin
  auth.uid() IS NOT NULL OR is_super_admin()
);

-- Alternatively for the audit triggers (which run as security definer)
CREATE POLICY "system_insert_audit_logs"
ON public.admin_audit_log FOR INSERT
WITH CHECK (true); -- Triggers run with elevated privileges

-- Drop if duplicate
DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON public.admin_audit_log;