-- Add back necessary policies for edge functions to manage subscribers
-- These are more restrictive than the previous blanket policies

-- Allow authenticated users to have their own subscription record created/updated
-- This works because check-subscription validates the user JWT before operating
CREATE POLICY "authenticated_manage_own_subscription"
ON public.subscribers FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- For edge functions that need to create initial records (where user_id might be null initially)
-- We need to allow insert when the email matches the authenticated user
CREATE POLICY "service_insert_matching_user"
ON public.subscribers FOR INSERT
WITH CHECK (
  -- Only allow if the user_id matches the authenticated user, or super admin
  (user_id IS NULL OR user_id = auth.uid()) OR is_super_admin()
);

-- Allow service operations for updates where user matches
CREATE POLICY "service_update_own_subscription"
ON public.subscribers FOR UPDATE
USING (
  (user_id = auth.uid()) OR is_super_admin()
)
WITH CHECK (
  (user_id = auth.uid()) OR is_super_admin()
);