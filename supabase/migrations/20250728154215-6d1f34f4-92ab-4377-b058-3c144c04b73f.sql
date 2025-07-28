-- Fix critical RLS policy vulnerabilities
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create proper RLS policies for subscribers table
-- Only allow service role (edge functions) to update subscription data
CREATE POLICY "service_role_can_update_subscriptions" 
ON public.subscribers 
FOR UPDATE 
TO service_role 
USING (true);

-- Allow users to read only their own subscription data
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
CREATE POLICY "users_can_read_own_subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

-- Only service role can insert subscriptions (from edge functions)
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
CREATE POLICY "service_role_can_insert_subscriptions" 
ON public.subscribers 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Add a policy for authenticated users to read their subscription for UI purposes
CREATE POLICY "authenticated_users_can_read_own_subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid() OR email = auth.email());