-- ============================================
-- SECURITY HARDENING: Fix 3 error-level findings
-- ============================================

-- 1. SUBSCRIBERS TABLE: Add admin read access and restrict service role operations
-- Drop overly permissive service role policies
DROP POLICY IF EXISTS "service_role_can_insert_subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "service_role_can_update_subscriptions" ON public.subscribers;

-- Add super admin read access
CREATE POLICY "super_admin_read_all_subscriptions"
ON public.subscribers FOR SELECT
USING (is_super_admin());

-- Add support admin read access for customer support
CREATE POLICY "support_admin_read_subscriptions"
ON public.subscribers FOR SELECT
USING (has_role('support_admin'));

-- ============================================
-- 2. ADMIN_TOTP TABLE: Restrict service role access
-- ============================================
-- Drop the overly permissive "Service role can manage TOTP" policy
DROP POLICY IF EXISTS "Service role can manage TOTP" ON public.admin_totp;

-- Create more restrictive policies for edge functions (via super admin check)
-- Super admins can manage all TOTP records
CREATE POLICY "super_admin_manage_totp"
ON public.admin_totp FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admin users can insert their own TOTP (for initial setup)
CREATE POLICY "admin_insert_own_totp"
ON public.admin_totp FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_admin(auth.uid()));

-- Admin users can delete their own TOTP (for reset)
CREATE POLICY "admin_delete_own_totp"
ON public.admin_totp FOR DELETE
USING (auth.uid() = user_id AND is_admin(auth.uid()));

-- ============================================
-- 3. ADMIN_ROLES TABLE: Restrict service role access
-- ============================================
-- Drop the overly permissive "Service role full access" policy
DROP POLICY IF EXISTS "Service role full access" ON public.admin_roles;

-- Super admins can manage all roles (already have separate policies)
-- The existing policies are sufficient:
-- - "Super admins can insert roles" 
-- - "Super admins can update roles"
-- - "Super admins can delete roles"
-- - "Users can view own roles"

-- ============================================
-- 4. Create audit trigger for subscribers table changes
-- ============================================
CREATE OR REPLACE FUNCTION public.audit_subscriber_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all changes to subscribers table
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_OP,
    'subscribers',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'email_masked', LEFT(COALESCE(NEW.email, OLD.email), 3) || '***',
      'subscription_tier', COALESCE(NEW.subscription_tier, OLD.subscription_tier),
      'subscribed', COALESCE(NEW.subscribed, OLD.subscribed)
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for subscribers table
DROP TRIGGER IF EXISTS audit_subscribers_changes ON public.subscribers;
CREATE TRIGGER audit_subscribers_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_subscriber_changes();

-- ============================================
-- 5. Create audit trigger for admin_roles table changes
-- ============================================
CREATE OR REPLACE FUNCTION public.audit_admin_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_OP || '_admin_role',
    'admin_roles',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
      'role', COALESCE(NEW.role::text, OLD.role::text),
      'granted_by', COALESCE(NEW.granted_by, OLD.granted_by)
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for admin_roles table
DROP TRIGGER IF EXISTS audit_admin_role_changes ON public.admin_roles;
CREATE TRIGGER audit_admin_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_admin_role_changes();

-- ============================================
-- 6. Create audit trigger for admin_totp table changes
-- ============================================
CREATE OR REPLACE FUNCTION public.audit_admin_totp_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_OP || '_totp',
    'admin_totp',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
      'is_enabled', COALESCE(NEW.is_enabled, OLD.is_enabled),
      'verified_at', COALESCE(NEW.verified_at, OLD.verified_at)
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for admin_totp table
DROP TRIGGER IF EXISTS audit_admin_totp_changes ON public.admin_totp;
CREATE TRIGGER audit_admin_totp_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_totp
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_admin_totp_changes();