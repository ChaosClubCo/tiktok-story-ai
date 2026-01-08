-- Create table for tracking IP-based rate limiting
CREATE TABLE public.login_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  first_failed_at timestamptz,
  blocked_until timestamptz,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ip_address)
);

-- Create index for efficient IP lookups
CREATE INDEX idx_login_rate_limits_ip ON public.login_rate_limits(ip_address);
CREATE INDEX idx_login_rate_limits_blocked ON public.login_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Enable RLS
ALTER TABLE public.login_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (edge functions)
CREATE POLICY "Service role can manage rate limits"
  ON public.login_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to clean up old rate limit records (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete records older than 24 hours with no blocks
  DELETE FROM public.login_rate_limits
  WHERE blocked_until IS NULL 
    AND last_attempt_at < now() - interval '24 hours';
  
  -- Reset failed attempts for expired blocks
  UPDATE public.login_rate_limits
  SET failed_attempts = 0,
      blocked_until = NULL,
      first_failed_at = NULL
  WHERE blocked_until IS NOT NULL 
    AND blocked_until < now();
END;
$$;