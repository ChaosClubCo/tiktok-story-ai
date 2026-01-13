import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";

/**
 * Login Rate Limiting Configuration
 * 
 * Based on OWASP and NIST guidelines:
 * - 3 failed attempts triggers CAPTCHA requirement
 * - 8 failed attempts (after CAPTCHA) triggers a 15-minute block
 * - 15 failed attempts triggers a 1-hour block
 * - 25+ failed attempts triggers a 24-hour block
 * - Rate limit window resets after successful login
 */
const RATE_LIMIT_CONFIG = {
  WINDOW_MINUTES: 15,
  CAPTCHA_THRESHOLD: 3, // Show CAPTCHA after 3 failed attempts
  THRESHOLDS: [
    { attempts: 8, blockMinutes: 15 },
    { attempts: 15, blockMinutes: 60 },
    { attempts: 25, blockMinutes: 1440 } // 24 hours
  ]
};

interface RateLimitRequest {
  action: 'check' | 'record_attempt' | 'reset';
  success?: boolean;
  captchaSolved?: boolean;
}

interface RateLimitResponse {
  allowed: boolean;
  blocked?: boolean;
  blockedUntil?: string;
  remainingAttempts?: number;
  retryAfterSeconds?: number;
  message?: string;
  requiresCaptcha?: boolean;
  captchaAttemptsRemaining?: number;
}

const logStep = (step: string, details?: any) => {
  const masked = details ? JSON.stringify(details).replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]') : '';
  console.log(`[LOGIN-RATE-LIMIT] ${step}`, masked);
};

function getBlockDuration(failedAttempts: number): number {
  let blockMinutes = 0;
  for (const threshold of RATE_LIMIT_CONFIG.THRESHOLDS) {
    if (failedAttempts >= threshold.attempts) {
      blockMinutes = threshold.blockMinutes;
    }
  }
  return blockMinutes;
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

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('cf-connecting-ip') || 
                      req.headers.get('x-real-ip') ||
                      '0.0.0.0';

    const body: RateLimitRequest = await req.json();
    const { action, success } = body;

    logStep(`Action: ${action}`, { success });

    // Get current rate limit record for this IP
    const { data: rateLimitRecord, error: fetchError } = await supabase
      .from('login_rate_limits')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logStep('Error fetching rate limit record', { error: fetchError.message });
    }

    const now = new Date();

    switch (action) {
      case 'check': {
        // Check if IP is currently blocked
        if (rateLimitRecord?.blocked_until) {
          const blockedUntil = new Date(rateLimitRecord.blocked_until);
          if (blockedUntil > now) {
            const retryAfterSeconds = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);
            
            logStep('IP is blocked', { retryAfterSeconds });
            
            const response: RateLimitResponse = {
              allowed: false,
              blocked: true,
              blockedUntil: blockedUntil.toISOString(),
              retryAfterSeconds,
              message: `Too many failed login attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`
            };
            
            return new Response(JSON.stringify(response), {
              status: 429,
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Retry-After': retryAfterSeconds.toString()
              }
            });
          }
        }

        // Calculate remaining attempts before next block
        const currentAttempts = rateLimitRecord?.failed_attempts || 0;
        const requiresCaptcha = currentAttempts >= RATE_LIMIT_CONFIG.CAPTCHA_THRESHOLD;
        const nextThreshold = RATE_LIMIT_CONFIG.THRESHOLDS.find(t => t.attempts > currentAttempts);
        const remainingAttempts = nextThreshold 
          ? nextThreshold.attempts - currentAttempts 
          : 0;
        
        // Calculate attempts remaining before block (after CAPTCHA kicks in)
        const captchaAttemptsRemaining = requiresCaptcha 
          ? RATE_LIMIT_CONFIG.THRESHOLDS[0].attempts - currentAttempts
          : RATE_LIMIT_CONFIG.CAPTCHA_THRESHOLD - currentAttempts;

        const response: RateLimitResponse = {
          allowed: true,
          blocked: false,
          remainingAttempts,
          requiresCaptcha,
          captchaAttemptsRemaining: Math.max(0, captchaAttemptsRemaining)
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'record_attempt': {
        const { captchaSolved } = body;
        
        if (success) {
          // Successful login - reset rate limit
          if (rateLimitRecord) {
            await supabase
              .from('login_rate_limits')
              .update({
                failed_attempts: 0,
                blocked_until: null,
                first_failed_at: null,
                last_attempt_at: now.toISOString()
              })
              .eq('ip_address', ipAddress);
          }

          logStep('Successful login, rate limit reset');

          return new Response(JSON.stringify({ 
            allowed: true, 
            blocked: false,
            requiresCaptcha: false,
            message: 'Rate limit reset on successful login'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Failed login - increment counter
        const windowStart = new Date(now.getTime() - RATE_LIMIT_CONFIG.WINDOW_MINUTES * 60 * 1000);
        
        let newFailedAttempts: number;
        let firstFailedAt: string;

        if (rateLimitRecord) {
          // Check if first failure is within window
          const recordFirstFailed = rateLimitRecord.first_failed_at 
            ? new Date(rateLimitRecord.first_failed_at) 
            : null;
          
          if (recordFirstFailed && recordFirstFailed > windowStart) {
            // Within window - increment
            newFailedAttempts = rateLimitRecord.failed_attempts + 1;
            firstFailedAt = rateLimitRecord.first_failed_at;
          } else {
            // Outside window - start fresh
            newFailedAttempts = 1;
            firstFailedAt = now.toISOString();
          }
        } else {
          newFailedAttempts = 1;
          firstFailedAt = now.toISOString();
        }

        // Check if CAPTCHA is required
        const requiresCaptcha = newFailedAttempts >= RATE_LIMIT_CONFIG.CAPTCHA_THRESHOLD;
        
        // Only block if CAPTCHA was required and they still failed
        // OR if they've exceeded the hard block threshold
        const blockMinutes = getBlockDuration(newFailedAttempts);
        const shouldBlock = blockMinutes > 0 && (captchaSolved || !requiresCaptcha);
        const blockedUntil = shouldBlock
          ? new Date(now.getTime() + blockMinutes * 60 * 1000).toISOString()
          : null;

        // Upsert the rate limit record
        const { error: upsertError } = await supabase
          .from('login_rate_limits')
          .upsert({
            ip_address: ipAddress,
            failed_attempts: newFailedAttempts,
            first_failed_at: firstFailedAt,
            blocked_until: blockedUntil,
            last_attempt_at: now.toISOString()
          }, { onConflict: 'ip_address' });

        if (upsertError) {
          logStep('Error upserting rate limit', { error: upsertError.message });
        }

        // Log to login_activity as well
        const userAgent = req.headers.get('user-agent') || '';
        await supabase
          .from('login_activity')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Anonymous for failed attempts
            ip_address: ipAddress,
            user_agent: userAgent,
            device_type: 'Unknown',
            browser: 'Unknown',
            success: false,
            failure_reason: blockedUntil ? 'Rate limited' : requiresCaptcha ? 'CAPTCHA required' : 'Invalid credentials'
          });

        if (blockedUntil) {
          const retryAfterSeconds = blockMinutes * 60;
          
          logStep('IP blocked due to too many attempts', { 
            attempts: newFailedAttempts, 
            blockMinutes 
          });

          // Send security alert email (fire and forget)
          try {
            const alertUrl = `${supabaseUrl}/functions/v1/send-security-alert`;
            fetch(alertUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                userId: '00000000-0000-0000-0000-000000000000', // Will be looked up from IP activity
                alertType: 'login_blocked',
                ipAddress: ipAddress,
                userAgent: req.headers.get('user-agent') || '',
                failedAttempts: newFailedAttempts,
                blockedUntil: blockedUntil,
              }),
            }).catch(err => logStep('Failed to send security alert', { error: err.message }));
          } catch (alertError) {
            logStep('Security alert error', { error: alertError });
          }

          return new Response(JSON.stringify({
            allowed: false,
            blocked: true,
            blockedUntil,
            retryAfterSeconds,
            requiresCaptcha: false,
            message: `Too many failed attempts. Account locked for ${blockMinutes} minutes.`
          }), {
            status: 429,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': retryAfterSeconds.toString()
            }
          });
        }

        const nextThreshold = RATE_LIMIT_CONFIG.THRESHOLDS.find(t => t.attempts > newFailedAttempts);
        const remainingAttempts = nextThreshold 
          ? nextThreshold.attempts - newFailedAttempts 
          : 0;
        
        const captchaAttemptsRemaining = requiresCaptcha 
          ? RATE_LIMIT_CONFIG.THRESHOLDS[0].attempts - newFailedAttempts
          : RATE_LIMIT_CONFIG.CAPTCHA_THRESHOLD - newFailedAttempts;

        logStep('Failed attempt recorded', { 
          attempts: newFailedAttempts, 
          remainingAttempts,
          requiresCaptcha
        });

        return new Response(JSON.stringify({
          allowed: true,
          blocked: false,
          remainingAttempts,
          requiresCaptcha,
          captchaAttemptsRemaining: Math.max(0, captchaAttemptsRemaining),
          message: requiresCaptcha 
            ? `Please complete the security verification. ${Math.max(0, captchaAttemptsRemaining)} attempts remaining before lockout.`
            : remainingAttempts <= 2 
              ? `Warning: ${remainingAttempts} attempts remaining before CAPTCHA required`
              : undefined
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'reset': {
        // Admin action to manually reset an IP
        if (rateLimitRecord) {
          await supabase
            .from('login_rate_limits')
            .delete()
            .eq('ip_address', ipAddress);
        }

        logStep('Rate limit manually reset');

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Rate limit reset' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('[LOGIN-RATE-LIMIT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
