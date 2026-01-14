-- Create table for account recovery options
CREATE TABLE public.account_recovery_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_email TEXT,
  backup_email_verified BOOLEAN DEFAULT FALSE,
  security_questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_recovery UNIQUE (user_id)
);

-- Create table for recovery attempt rate limiting
CREATE TABLE public.recovery_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  attempt_type TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_recovery_limit UNIQUE (identifier, attempt_type)
);

-- Enable RLS on both tables
ALTER TABLE public.account_recovery_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for account_recovery_options
CREATE POLICY "Users can view their own recovery options"
ON public.account_recovery_options
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recovery options"
ON public.account_recovery_options
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recovery options"
ON public.account_recovery_options
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recovery options"
ON public.account_recovery_options
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all recovery options"
ON public.account_recovery_options
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- RLS policies for recovery_rate_limits - service role only
CREATE POLICY "Service role can manage recovery rate limits"
ON public.recovery_rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Update trigger for account_recovery_options
CREATE TRIGGER update_account_recovery_options_updated_at
BEFORE UPDATE ON public.account_recovery_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();