-- Fix self-referential RLS policies on admin_roles table
-- Replace direct table queries with has_role() SECURITY DEFINER function

-- Drop existing self-referential policies
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.admin_roles;

-- Create new policies using the has_role() SECURITY DEFINER function
-- This prevents recursion by using a function that bypasses RLS

CREATE POLICY "Super admins can insert roles" 
ON public.admin_roles
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update roles" 
ON public.admin_roles
FOR UPDATE 
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete roles" 
ON public.admin_roles
FOR DELETE 
USING (public.has_role(auth.uid(), 'super_admin'::app_role));