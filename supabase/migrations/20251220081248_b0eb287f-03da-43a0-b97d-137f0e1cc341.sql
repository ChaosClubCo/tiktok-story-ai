-- Drop all existing policies on subscribers table to recreate with proper scoping
DROP POLICY IF EXISTS "authenticated_manage_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "super_admin_read_all_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "super_admins_can_insert_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "super_admins_can_update_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "support_admin_read_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "users_can_insert_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "users_can_read_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "users_can_update_own_subscription" ON public.subscribers;

-- Create properly scoped user policies
CREATE POLICY "users_select_own_subscription"
ON public.subscribers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_subscription"
ON public.subscribers FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "users_update_own_subscription"
ON public.subscribers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_subscription"
ON public.subscribers FOR DELETE
USING (auth.uid() = user_id);

-- Super admin policies (full access for billing management)
CREATE POLICY "super_admin_all_subscriptions"
ON public.subscribers FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Support admin read-only for customer support
CREATE POLICY "support_admin_read_subscriptions"
ON public.subscribers FOR SELECT
USING (has_role('support_admin'));

-- Service role policy for Stripe webhook updates (uses service_role key)
CREATE POLICY "service_role_manage_subscriptions"
ON public.subscribers FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');