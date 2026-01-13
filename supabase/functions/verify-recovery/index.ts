import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRecoveryRequest {
  method: 'backup_email' | 'security_questions';
  email: string;
  backupEmail?: string;
  answers?: { questionId: string; answer: string }[];
  ipAddress?: string;
}

// Simple hash function for security answers
const hashAnswer = (answer: string): string => {
  const normalized = answer.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { method, email, backupEmail, answers, ipAddress }: VerifyRecoveryRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limit check
    const identifier = email.toLowerCase();
    const attemptType = method === 'backup_email' ? 'backup_email' : 'security_questions';

    const rateLimitResponse = await fetch(`${supabaseUrl}/functions/v1/recovery-rate-limit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, attemptType }),
    });

    const rateLimitData = await rateLimitResponse.json();

    if (!rateLimitData.allowed) {
      return new Response(
        JSON.stringify({ 
          error: rateLimitData.message || "Too many attempts. Please try again later.",
          blocked: true,
          blockedUntil: rateLimitData.blockedUntil,
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find user by email
    const { data: { users }, error: userError } = await serviceClient.auth.admin.listUsers();
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists
      return new Response(
        JSON.stringify({ error: "If an account exists, a recovery email will be sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get recovery options for this user
    const { data: recoveryOptions, error: recoveryError } = await serviceClient
      .from("account_recovery_options")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (recoveryError && recoveryError.code !== 'PGRST116') {
      console.error("[Verify Recovery] Error fetching options:", recoveryError);
    }

    if (method === 'backup_email') {
      if (!backupEmail) {
        return new Response(
          JSON.stringify({ error: "Backup email required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify backup email matches
      if (!recoveryOptions?.backup_email || 
          recoveryOptions.backup_email.toLowerCase() !== backupEmail.toLowerCase() ||
          !recoveryOptions.backup_email_verified) {
        // Mark failed attempt
        await fetch(`${supabaseUrl}/functions/v1/recovery-rate-limit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, attemptType, success: false }),
        });

        return new Response(
          JSON.stringify({ 
            error: "Backup email does not match our records.",
            remainingAttempts: rateLimitData.remainingAttempts - 1,
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Success - reset rate limit
      await fetch(`${supabaseUrl}/functions/v1/recovery-rate-limit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, attemptType, success: true }),
      });

      // Send password reset email
      const { error: resetError } = await serviceClient.auth.admin.generateLink({
        type: 'recovery',
        email: user.email!,
      });

      if (resetError) {
        console.error("[Verify Recovery] Reset error:", resetError);
      }

      // Notify user
      if (user.email) {
        try {
          await resend.emails.send({
            from: "MiniDrama Security <noreply@resend.dev>",
            to: [user.email],
            subject: "🚨 Account Recovery Was Used",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #dc2626;">🚨 Account Recovery Used</h1>
                <p>Someone used your backup email to initiate account recovery.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
                <p style="color: #dc2626; font-weight: bold;">
                  If this wasn't you, your account may be compromised.
                </p>
              </div>
            `,
          });
        } catch (e) {
          console.error("[Verify Recovery] Email error:", e);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Recovery email sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (method === 'security_questions') {
      if (!answers || answers.length < 2) {
        return new Response(
          JSON.stringify({ error: "At least 2 answers required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const storedQuestions = recoveryOptions?.security_questions as { questionId: string; answerHash: string }[] || [];

      if (storedQuestions.length === 0) {
        return new Response(
          JSON.stringify({ error: "No security questions configured for this account." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify answers
      let correctCount = 0;
      for (const answer of answers) {
        const stored = storedQuestions.find(q => q.questionId === answer.questionId);
        if (stored && hashAnswer(answer.answer) === stored.answerHash) {
          correctCount++;
        }
      }

      if (correctCount < 2) {
        // Mark failed attempt
        await fetch(`${supabaseUrl}/functions/v1/recovery-rate-limit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, attemptType, success: false }),
        });

        return new Response(
          JSON.stringify({ 
            error: "Security answers do not match.",
            remainingAttempts: rateLimitData.remainingAttempts - 1,
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Success - reset rate limit
      await fetch(`${supabaseUrl}/functions/v1/recovery-rate-limit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, attemptType, success: true }),
      });

      // Send password reset email
      const { error: resetError } = await serviceClient.auth.admin.generateLink({
        type: 'recovery',
        email: user.email!,
      });

      if (resetError) {
        console.error("[Verify Recovery] Reset error:", resetError);
      }

      // Notify user
      if (user.email) {
        try {
          await resend.emails.send({
            from: "MiniDrama Security <noreply@resend.dev>",
            to: [user.email],
            subject: "🚨 Account Recovery Was Used",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #dc2626;">🚨 Account Recovery Used</h1>
                <p>Someone used security questions to initiate account recovery.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
                <p style="color: #dc2626; font-weight: bold;">
                  If this wasn't you, your account may be compromised.
                </p>
              </div>
            `,
          });
        } catch (e) {
          console.error("[Verify Recovery] Email error:", e);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Recovery email sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid recovery method" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[Verify Recovery] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
