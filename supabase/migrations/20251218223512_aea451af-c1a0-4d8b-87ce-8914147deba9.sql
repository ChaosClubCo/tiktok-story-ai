-- Fix the system_insert_audit_logs to be more restrictive
DROP POLICY IF EXISTS "system_insert_audit_logs" ON public.admin_audit_log;

-- For audit triggers that run as SECURITY DEFINER, they already bypass RLS
-- So we only need INSERT policy for direct authenticated inserts
CREATE POLICY "authenticated_admin_insert_audit"
ON public.admin_audit_log FOR INSERT
WITH CHECK (
  -- Only admins or super admins can directly insert audit logs
  is_admin(auth.uid()) OR is_super_admin()
);

-- Fix subscribers: Remove the NULL user_id loophole  
DROP POLICY IF EXISTS "service_insert_matching_user" ON public.subscribers;

-- Create a more restrictive insert policy
CREATE POLICY "user_insert_own_subscription"
ON public.subscribers FOR INSERT
WITH CHECK (
  -- User can only insert their own subscription record
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR is_super_admin()
);