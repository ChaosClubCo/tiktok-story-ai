-- Fix login_rate_limits RLS policy - restrict from public access
-- The service role bypasses RLS, so we just need to remove the permissive policy
-- and add restrictive policies for legitimate access patterns

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.login_rate_limits;

-- Add policy for super admins to view rate limit data (for admin dashboard)
CREATE POLICY "Super admins can view rate limits"
ON public.login_rate_limits
FOR SELECT
USING (is_super_admin());

-- Add policy for support admins to view rate limits
CREATE POLICY "Support admins can view rate limits"
ON public.login_rate_limits
FOR SELECT
USING (has_role('support_admin'));

-- Note: INSERT, UPDATE, DELETE operations will only work via service role
-- which bypasses RLS - this is the intended behavior for edge functions