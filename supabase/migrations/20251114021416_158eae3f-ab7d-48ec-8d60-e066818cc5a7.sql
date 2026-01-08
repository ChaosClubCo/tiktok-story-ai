-- Security Fix 1: Ensure subscribers table only uses user_id for access
-- Drop any email-based policies if they exist
DROP POLICY IF EXISTS "authenticated_users_can_read_own_subscription" ON subscribers;

-- Recreate the correct policy (idempotent)
DROP POLICY IF EXISTS "users_can_read_own_subscription" ON subscribers;
CREATE POLICY "users_can_read_own_subscription"
  ON subscribers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security Fix 2: Ensure admin_roles has SELECT policy for users
-- This allows users to check their own roles without modifying them
DROP POLICY IF EXISTS "users_can_view_own_roles" ON admin_roles;
CREATE POLICY "users_can_view_own_roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON POLICY "users_can_read_own_subscription" ON subscribers IS 
  'Security: Only allow users to view their own subscription via user_id. Never use email-based access.';

COMMENT ON POLICY "users_can_view_own_roles" ON admin_roles IS 
  'Security: Allow users to check their own admin roles for authorization checks.';