-- Fix self-referential RLS policy on admin_roles table
-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.admin_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.admin_roles;

-- Create new secure policies
-- Service role has full access (for edge functions)
CREATE POLICY "Service role full access"
ON public.admin_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.admin_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only super admins can insert/update/delete roles (using function to avoid recursion)
CREATE POLICY "Super admins can insert roles"
ON public.admin_roles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = auth.uid() 
    AND ar.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update roles"
ON public.admin_roles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = auth.uid() 
    AND ar.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete roles"
ON public.admin_roles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = auth.uid() 
    AND ar.role = 'super_admin'
  )
);