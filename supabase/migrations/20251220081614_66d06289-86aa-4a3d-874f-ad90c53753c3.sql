-- Create security_alerts table to track sent alerts and prevent duplicates
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    alert_type text NOT NULL, -- 'login_blocked', '2fa_enabled', '2fa_disabled', 'suspicious_activity'
    ip_address inet,
    metadata jsonb DEFAULT '{}',
    email_sent boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- User can view their own alerts
CREATE POLICY "users_view_own_alerts" ON public.security_alerts
FOR SELECT USING (auth.uid() = user_id);

-- Super admin can view all
CREATE POLICY "super_admin_all_alerts" ON public.security_alerts
FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Service role can insert alerts
CREATE POLICY "service_insert_alerts" ON public.security_alerts
FOR INSERT WITH CHECK (true);

-- Add index for efficient querying
CREATE INDEX idx_security_alerts_user_created ON public.security_alerts(user_id, created_at DESC);
CREATE INDEX idx_security_alerts_type ON public.security_alerts(alert_type);