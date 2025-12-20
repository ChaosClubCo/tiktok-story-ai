-- Create user_totp table for regular user 2FA (separate from admin_totp)
CREATE TABLE IF NOT EXISTS public.user_totp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  secret_encrypted text NOT NULL,
  backup_codes text[] DEFAULT NULL,
  is_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone DEFAULT NULL,
  last_used_at timestamp with time zone DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.user_totp ENABLE ROW LEVEL SECURITY;

-- Users can view their own TOTP settings
CREATE POLICY "Users can view their own TOTP"
ON public.user_totp
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own TOTP settings
CREATE POLICY "Users can insert their own TOTP"
ON public.user_totp
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own TOTP settings
CREATE POLICY "Users can update their own TOTP"
ON public.user_totp
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own TOTP settings
CREATE POLICY "Users can delete their own TOTP"
ON public.user_totp
FOR DELETE
USING (auth.uid() = user_id);

-- Super admins can manage all TOTP settings
CREATE POLICY "Super admins can manage user TOTP"
ON public.user_totp
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_totp_user_id ON public.user_totp(user_id);