-- Create login_activity table for tracking login attempts
CREATE TABLE public.login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address inet,
  user_agent text,
  device_type text,
  browser text,
  location text,
  success boolean NOT NULL DEFAULT true,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient queries by user
CREATE INDEX idx_login_activity_user_id ON public.login_activity(user_id);
CREATE INDEX idx_login_activity_created_at ON public.login_activity(created_at DESC);

-- Enable RLS
ALTER TABLE public.login_activity ENABLE ROW LEVEL SECURITY;

-- Users can only view their own login activity
CREATE POLICY "Users can view own login activity"
  ON public.login_activity
  FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can view all login activity
CREATE POLICY "Super admins can view all login activity"
  ON public.login_activity
  FOR SELECT
  USING (is_super_admin());

-- Support admins can view login activity for support
CREATE POLICY "Support admins can view login activity"
  ON public.login_activity
  FOR SELECT
  USING (has_role('support_admin'));

-- Service role can insert login activity (via edge functions)
CREATE POLICY "Service can insert login activity"
  ON public.login_activity
  FOR INSERT
  WITH CHECK (true);

-- Fix subscribers table RLS policies - drop overly permissive policies
DROP POLICY IF EXISTS "service_update_own_subscription" ON public.subscribers;

-- Create properly scoped update policy
CREATE POLICY "users_can_update_own_subscription"
  ON public.subscribers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admins can update any subscription
CREATE POLICY "super_admins_can_update_subscriptions"
  ON public.subscribers
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Drop overly permissive insert policy
DROP POLICY IF EXISTS "user_insert_own_subscription" ON public.subscribers;

-- Create properly scoped insert policy
CREATE POLICY "users_can_insert_own_subscription"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Super admins can insert subscriptions
CREATE POLICY "super_admins_can_insert_subscriptions"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (is_super_admin());