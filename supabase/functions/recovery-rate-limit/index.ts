import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitRequest {
  identifier: string;
  attemptType: 'security_questions' | 'backup_email' | 'verification_code';
  success?: boolean;
}

interface RateLimitResponse {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil?: string;
  message?: string;
}

const RATE_LIMIT_CONFIG = {
  security_questions: { maxAttempts: 3, windowMinutes: 15, blockMinutes: 30 },
  backup_email: { maxAttempts: 5, windowMinutes: 60, blockMinutes: 60 },
  verification_code: { maxAttempts: 5, windowMinutes: 15, blockMinutes: 15 },
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { identifier, attemptType, success }: RateLimitRequest = await req.json();

    if (!identifier || !attemptType) {
      return new Response(
        JSON.stringify({ error: "Missing identifier or attemptType" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const config = RATE_LIMIT_CONFIG[attemptType];
    if (!config) {
      return new Response(
        JSON.stringify({ error: "Invalid attempt type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get current rate limit record
    const { data: existing } = await supabase
      .from("recovery_rate_limits")
      .select("*")
      .eq("identifier", identifier)
      .eq("attempt_type", attemptType)
      .single();

    const now = new Date();

    // Check if currently blocked
    if (existing?.blocked_until) {
      const blockedUntil = new Date(existing.blocked_until);
      if (blockedUntil > now) {
        return new Response(
          JSON.stringify({
            allowed: false,
            remainingAttempts: 0,
            blockedUntil: existing.blocked_until,
            message: `Too many failed attempts. Try again after ${blockedUntil.toLocaleTimeString()}`,
          } as RateLimitResponse),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // If success, reset the counter
    if (success) {
      await supabase
        .from("recovery_rate_limits")
        .delete()
        .eq("identifier", identifier)
        .eq("attempt_type", attemptType);

      return new Response(
        JSON.stringify({
          allowed: true,
          remainingAttempts: config.maxAttempts,
        } as RateLimitResponse),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if window has expired
    const windowExpiry = existing?.first_attempt_at 
      ? new Date(new Date(existing.first_attempt_at).getTime() + config.windowMinutes * 60 * 1000)
      : null;

    if (windowExpiry && windowExpiry < now) {
      // Reset the counter
      await supabase
        .from("recovery_rate_limits")
        .delete()
        .eq("identifier", identifier)
        .eq("attempt_type", attemptType);
      
      // Start fresh
      const { error: insertError } = await supabase
        .from("recovery_rate_limits")
        .insert({
          identifier,
          attempt_type: attemptType,
          attempt_count: 1,
          first_attempt_at: now.toISOString(),
        });

      if (insertError) {
        console.error("Insert error:", insertError);
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          remainingAttempts: config.maxAttempts - 1,
        } as RateLimitResponse),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Increment or create counter
    const newCount = (existing?.attempt_count || 0) + 1;
    const remainingAttempts = Math.max(0, config.maxAttempts - newCount);

    if (newCount >= config.maxAttempts) {
      // Block the identifier
      const blockedUntil = new Date(now.getTime() + config.blockMinutes * 60 * 1000);

      if (existing) {
        await supabase
          .from("recovery_rate_limits")
          .update({
            attempt_count: newCount,
            blocked_until: blockedUntil.toISOString(),
          })
          .eq("identifier", identifier)
          .eq("attempt_type", attemptType);
      } else {
        await supabase
          .from("recovery_rate_limits")
          .insert({
            identifier,
            attempt_type: attemptType,
            attempt_count: newCount,
            first_attempt_at: now.toISOString(),
            blocked_until: blockedUntil.toISOString(),
          });
      }

      return new Response(
        JSON.stringify({
          allowed: false,
          remainingAttempts: 0,
          blockedUntil: blockedUntil.toISOString(),
          message: `Too many failed attempts. Try again after ${blockedUntil.toLocaleTimeString()}`,
        } as RateLimitResponse),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Still within limits
    if (existing) {
      await supabase
        .from("recovery_rate_limits")
        .update({ attempt_count: newCount })
        .eq("identifier", identifier)
        .eq("attempt_type", attemptType);
    } else {
      await supabase
        .from("recovery_rate_limits")
        .insert({
          identifier,
          attempt_type: attemptType,
          attempt_count: newCount,
          first_attempt_at: now.toISOString(),
        });
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        remainingAttempts,
      } as RateLimitResponse),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[Recovery Rate Limit] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
