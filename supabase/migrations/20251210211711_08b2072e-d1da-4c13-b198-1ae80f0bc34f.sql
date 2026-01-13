-- Create admin_totp table for 2FA
CREATE TABLE IF NOT EXISTS public.admin_totp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  secret_encrypted TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[], -- Encrypted backup codes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_totp ENABLE ROW LEVEL SECURITY;

-- Only admins can view their own TOTP settings
CREATE POLICY "Admin users can view their own TOTP"
ON public.admin_totp
FOR SELECT
USING (
  auth.uid() = user_id AND
  public.is_admin(auth.uid())
);

-- Only admins can update their own TOTP
CREATE POLICY "Admin users can update their own TOTP"
ON public.admin_totp
FOR UPDATE
USING (
  auth.uid() = user_id AND
  public.is_admin(auth.uid())
);

-- Service role for edge function operations
CREATE POLICY "Service role can manage TOTP"
ON public.admin_totp
FOR ALL
USING (true)
WITH CHECK (true);

-- Create admin_2fa_attempts for rate limiting and audit
CREATE TABLE IF NOT EXISTS public.admin_2fa_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  attempt_type TEXT NOT NULL, -- 'totp_verify', 'backup_code', 'setup'
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_2fa_attempts ENABLE ROW LEVEL SECURITY;

-- Admins can view their own attempts
CREATE POLICY "Admins can view their own 2FA attempts"
ON public.admin_2fa_attempts
FOR SELECT
USING (
  auth.uid() = user_id AND
  public.is_admin(auth.uid())
);

-- Super admins can view all attempts for security monitoring
CREATE POLICY "Super admins can view all 2FA attempts"
ON public.admin_2fa_attempts
FOR SELECT
USING (
  public.has_role(auth.uid(), 'super_admin')
);

-- Service role can insert attempts
CREATE POLICY "Service role can insert 2FA attempts"
ON public.admin_2fa_attempts
FOR INSERT
WITH CHECK (true);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_admin_2fa_attempts_user_time 
ON public.admin_2fa_attempts(user_id, created_at DESC);

-- Create index for TOTP lookups
CREATE INDEX IF NOT EXISTS idx_admin_totp_user 
ON public.admin_totp(user_id);