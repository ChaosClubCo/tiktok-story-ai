-- Fix Function Search Path Mutable warnings
-- Update all functions to set search_path = public

-- 1. is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = (SELECT auth.uid())
      AND ar.role = 'super_admin'
  );
$$;

-- 2. set_owner_and_lock_user_id
CREATE OR REPLACE FUNCTION public.set_owner_and_lock_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS NULL THEN
      NEW.user_id := (SELECT auth.uid());
    END IF;
    IF NEW.user_id IS DISTINCT FROM (SELECT auth.uid()) AND NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'user_id must equal auth.uid()';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id AND NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'user_id is immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. has_role(target_role text)
CREATE OR REPLACE FUNCTION public.has_role(target_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = (SELECT auth.uid())
      AND ar.role = target_role::public.app_role
  );
$$;

-- 4. project_owner_id
CREATE OR REPLACE FUNCTION public.project_owner_id(p_project uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vp.user_id FROM public.video_projects vp WHERE vp.id = p_project;
$$;

-- 5. ab_test_owner_id
CREATE OR REPLACE FUNCTION public.ab_test_owner_id(p_test uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT at.user_id FROM public.ab_tests at WHERE at.id = p_test;
$$;

-- 6. log_admin_action
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_id, action, resource_type, resource_id, reason, metadata, created_at)
  VALUES ((SELECT auth.uid()), p_action, p_resource_type, p_resource_id, p_reason, p_metadata, now());
END;
$$;

-- 7. moderator_log
CREATE OR REPLACE FUNCTION public.moderator_log(
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role('content_moderator') OR public.has_role('support_admin') OR public.is_super_admin()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  PERFORM public.log_admin_action(p_action, p_resource_type, p_resource_id, p_reason, p_metadata);
END;
$$;

-- 8. log_admin_row_change
CREATE OR REPLACE FUNCTION public.log_admin_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_id uuid;
  v_type text := TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME;
BEGIN
  IF NOT (public.has_role('content_moderator') OR public.has_role('support_admin') OR public.is_super_admin()) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    EXECUTE format('SELECT ($1).%I::uuid', 'id') INTO v_id USING NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    EXECUTE format('SELECT ($1).%I::uuid', 'id') INTO v_id USING NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    EXECUTE format('SELECT ($1).%I::uuid', 'id') INTO v_id USING OLD;
  END IF;

  PERFORM public.log_admin_action(v_action, v_type, v_id, NULL, jsonb_build_object(
    'user_id', (SELECT auth.uid()),
    'changed_columns', (CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(ARRAY(SELECT c FROM jsonb_object_keys(to_jsonb(NEW)) c EXCEPT SELECT c FROM jsonb_object_keys(to_jsonb(OLD)) c)) ELSE '[]'::jsonb END),
    'op', TG_OP
  ));

  RETURN COALESCE(NEW, OLD);
END;
$$;