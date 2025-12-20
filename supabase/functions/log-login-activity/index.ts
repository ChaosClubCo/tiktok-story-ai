import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";

interface LoginActivityRequest {
  success: boolean;
  failureReason?: string;
}

const logStep = (step: string, details?: any) => {
  const masked = details ? JSON.stringify(details).replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]') : '';
  console.log(`[LOG-LOGIN-ACTIVITY] ${step}`, masked);
};

function parseUserAgent(userAgent: string): { device: string; browser: string } {
  let device = 'Unknown Device';
  let browser = 'Unknown Browser';

  // Detect device type
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    device = /iPad/.test(userAgent) ? 'iPad' : 'iPhone';
  } else if (/Android/.test(userAgent)) {
    device = /Mobile/.test(userAgent) ? 'Android Phone' : 'Android Tablet';
  } else if (/Windows/.test(userAgent)) {
    device = 'Windows PC';
  } else if (/Macintosh|Mac OS X/.test(userAgent)) {
    device = 'Mac';
  } else if (/Linux/.test(userAgent)) {
    device = 'Linux PC';
  }

  // Detect browser
  if (/Firefox\//.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Edg\//.test(userAgent)) {
    browser = 'Edge';
  } else if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
    browser = 'Safari';
  } else if (/Opera|OPR\//.test(userAgent)) {
    browser = 'Opera';
  }

  return { device, browser };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Authenticate request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: LoginActivityRequest = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('cf-connecting-ip') || 
                      req.headers.get('x-real-ip');
    const userAgent = req.headers.get('user-agent') || '';
    
    const { device, browser } = parseUserAgent(userAgent);

    logStep('Logging login activity', { 
      userId: user.id.slice(0, 8), 
      success: body.success,
      device,
      browser
    });

    const { error: insertError } = await supabase
      .from('login_activity')
      .insert({
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: device,
        browser: browser,
        success: body.success,
        failure_reason: body.failureReason || null
      });

    if (insertError) {
      logStep('Error inserting login activity', { error: insertError.message });
      throw insertError;
    }

    logStep('Login activity logged successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[LOG-LOGIN-ACTIVITY] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
