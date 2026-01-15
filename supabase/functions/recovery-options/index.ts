import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

interface ResendEmailOptions {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

const sendEmail = async (options: ResendEmailOptions) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.warn("[Recovery Options] RESEND_API_KEY not configured, skipping email");
    return;
  }
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify(options),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return response.json();
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryOptionsRequest {
  action: 'get' | 'save_backup_email' | 'save_security_questions' | 'remove_backup_email' | 'remove_security_questions' | 'verify_security_answers';
  backupEmail?: string;
  securityQuestions?: { questionId: string; answerHash: string }[];
  answers?: { questionId: string; answer: string }[];
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

const sendRecoveryChangeNotification = async (
  email: string,
  changeType: 'backup_email_added' | 'backup_email_removed' | 'security_questions_added' | 'security_questions_removed' | 'recovery_used',
  details?: { newEmail?: string; ipAddress?: string }
) => {
  const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' });
  
  const subjects: Record<string, string> = {
    backup_email_added: '🔐 Backup Email Added to Your Account',
    backup_email_removed: '⚠️ Backup Email Removed from Your Account',
    security_questions_added: '🔐 Security Questions Configured',
    security_questions_removed: '⚠️ Security Questions Removed from Your Account',
    recovery_used: '🚨 Account Recovery Was Used',
  };

  const getHtmlContent = () => {
    const baseStyle = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    `;

    const alertBox = `
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    `;

    const successBox = `
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    `;

    switch (changeType) {
      case 'backup_email_added':
        return `
          <div style="${baseStyle}">
            <h1 style="color: #059669;">🔐 Backup Email Added</h1>
            <div style="${successBox}">
              <p style="margin: 0; color: #065f46;">
                A backup email has been added to your account for account recovery.
              </p>
            </div>
            <p><strong>New Backup Email:</strong> ${details?.newEmail || 'Not specified'}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p style="color: #dc2626; font-weight: bold;">
              If you didn't make this change, please secure your account immediately.
            </p>
          </div>
        `;
      
      case 'backup_email_removed':
        return `
          <div style="${baseStyle}">
            <h1 style="color: #d97706;">⚠️ Backup Email Removed</h1>
            <div style="${alertBox}">
              <p style="margin: 0; color: #991b1b;">
                Your backup email has been removed from your account.
              </p>
            </div>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p style="color: #dc2626; font-weight: bold;">
              If you didn't make this change, your account may be compromised. Please contact support.
            </p>
          </div>
        `;

      case 'security_questions_added':
        return `
          <div style="${baseStyle}">
            <h1 style="color: #059669;">🔐 Security Questions Configured</h1>
            <div style="${successBox}">
              <p style="margin: 0; color: #065f46;">
                Security questions have been set up for your account recovery.
              </p>
            </div>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p style="color: #dc2626; font-weight: bold;">
              If you didn't set up security questions, please secure your account immediately.
            </p>
          </div>
        `;

      case 'security_questions_removed':
        return `
          <div style="${baseStyle}">
            <h1 style="color: #d97706;">⚠️ Security Questions Removed</h1>
            <div style="${alertBox}">
              <p style="margin: 0; color: #991b1b;">
                Your security questions have been removed from your account.
              </p>
            </div>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p style="color: #dc2626; font-weight: bold;">
              If you didn't make this change, your account may be compromised.
            </p>
          </div>
        `;

      case 'recovery_used':
        return `
          <div style="${baseStyle}">
            <h1 style="color: #dc2626;">🚨 Account Recovery Used</h1>
            <div style="${alertBox}">
              <p style="margin: 0; color: #991b1b;">
                <strong>Someone used account recovery to access your account.</strong>
              </p>
            </div>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>IP Address:</strong> ${details?.ipAddress || 'Unknown'}</p>
            <p style="color: #dc2626; font-weight: bold;">
              If this wasn't you, your account may be compromised. Change your password immediately.
            </p>
          </div>
        `;

      default:
        return `<div style="${baseStyle}"><p>A security change was made to your account.</p></div>`;
    }
  };

  try {
    await sendEmail({
      from: "MiniDrama Security <noreply@resend.dev>",
      to: [email],
      subject: subjects[changeType],
      html: getHtmlContent(),
    });
    console.log(`[Recovery Options] Notification sent: ${changeType}`);
  } catch (error) {
    console.error("[Recovery Options] Failed to send notification:", error);
  }
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { action, backupEmail, securityQuestions, answers }: RecoveryOptionsRequest = await req.json();

    switch (action) {
      case 'get': {
        const { data, error } = await supabase
          .from("account_recovery_options")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: data || { 
              backup_email: null, 
              backup_email_verified: false, 
              security_questions: [] 
            } 
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case 'save_backup_email': {
        if (!backupEmail) {
          return new Response(
            JSON.stringify({ error: "Backup email required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Check if record exists
        const { data: existing } = await supabase
          .from("account_recovery_options")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (existing) {
          await supabase
            .from("account_recovery_options")
            .update({
              backup_email: backupEmail,
              backup_email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        } else {
          await supabase
            .from("account_recovery_options")
            .insert({
              user_id: user.id,
              backup_email: backupEmail,
              backup_email_verified: true,
            });
        }

        // Send notification to primary email
        if (user.email) {
          await sendRecoveryChangeNotification(user.email, 'backup_email_added', { newEmail: backupEmail });
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case 'save_security_questions': {
        if (!securityQuestions || securityQuestions.length < 2) {
          return new Response(
            JSON.stringify({ error: "At least 2 security questions required" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Check if record exists
        const { data: existing } = await supabase
          .from("account_recovery_options")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (existing) {
          await supabase
            .from("account_recovery_options")
            .update({
              security_questions: securityQuestions,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        } else {
          await supabase
            .from("account_recovery_options")
            .insert({
              user_id: user.id,
              security_questions: securityQuestions,
            });
        }

        // Send notification
        if (user.email) {
          await sendRecoveryChangeNotification(user.email, 'security_questions_added');
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case 'remove_backup_email': {
        await supabase
          .from("account_recovery_options")
          .update({
            backup_email: null,
            backup_email_verified: false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (user.email) {
          await sendRecoveryChangeNotification(user.email, 'backup_email_removed');
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case 'remove_security_questions': {
        await supabase
          .from("account_recovery_options")
          .update({
            security_questions: [],
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (user.email) {
          await sendRecoveryChangeNotification(user.email, 'security_questions_removed');
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case 'verify_security_answers': {
        if (!answers || answers.length < 2) {
          return new Response(
            JSON.stringify({ error: "At least 2 answers required", verified: false }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // For verification, we need service role to lookup by email (user may not be logged in)
        // This would typically require email to lookup - simplified here
        const { data, error } = await supabase
          .from("account_recovery_options")
          .select("security_questions")
          .eq("user_id", user.id)
          .single();

        if (error || !data?.security_questions) {
          return new Response(
            JSON.stringify({ error: "No security questions found", verified: false }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const storedQuestions = data.security_questions as { questionId: string; answerHash: string }[];
        let correctCount = 0;

        for (const answer of answers) {
          const stored = storedQuestions.find(q => q.questionId === answer.questionId);
          if (stored && hashAnswer(answer.answer) === stored.answerHash) {
            correctCount++;
          }
        }

        const verified = correctCount >= 2;

        return new Response(
          JSON.stringify({ success: true, verified, correctCount }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
  } catch (error: any) {
    console.error("[Recovery Options] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
