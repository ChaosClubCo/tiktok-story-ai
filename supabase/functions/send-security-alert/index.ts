import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  userId: string;
  alertType: 'login_blocked' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity' | 'password_changed';
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  failedAttempts?: number;
  blockedUntil?: string;
}

const getAlertSubject = (alertType: string): string => {
  switch (alertType) {
    case 'login_blocked':
      return '🚨 Security Alert: Your account login was blocked';
    case '2fa_enabled':
      return '🔐 Two-Factor Authentication Enabled';
    case '2fa_disabled':
      return '⚠️ Security Alert: Two-Factor Authentication Disabled';
    case 'suspicious_activity':
      return '🚨 Suspicious Activity Detected on Your Account';
    case 'password_changed':
      return '🔑 Your Password Was Changed';
    default:
      return '🔔 Security Notification';
  }
};

const getAlertHtml = (alertType: string, data: SecurityAlertRequest): string => {
  const timestamp = new Date().toLocaleString('en-US', { 
    dateStyle: 'full', 
    timeStyle: 'long' 
  });

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

  const infoBox = `
    background: #f3f4f6;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  `;

  switch (alertType) {
    case 'login_blocked':
      return `
        <div style="${baseStyle}">
          <h1 style="color: #dc2626;">🚨 Login Attempt Blocked</h1>
          <div style="${alertBox}">
            <p style="margin: 0; color: #991b1b;">
              <strong>Multiple failed login attempts detected.</strong>
            </p>
            <p style="margin: 8px 0 0; color: #7f1d1d;">
              Your account has been temporarily locked to protect against unauthorized access.
            </p>
          </div>
          <div style="${infoBox}">
            <p style="margin: 0;"><strong>Details:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Failed Attempts: ${data.failedAttempts || 'Multiple'}</li>
              <li>IP Address: ${data.ipAddress || 'Unknown'}</li>
              <li>Location: ${data.location || 'Unknown'}</li>
              <li>Device: ${data.userAgent || 'Unknown'}</li>
              <li>Time: ${timestamp}</li>
              ${data.blockedUntil ? `<li>Blocked Until: ${new Date(data.blockedUntil).toLocaleString()}</li>` : ''}
            </ul>
          </div>
          <h3>What should you do?</h3>
          <ul>
            <li>If this was you, wait for the lockout period to end and try again with the correct password.</li>
            <li>If this wasn't you, consider changing your password immediately after the lockout ends.</li>
            <li>Enable Two-Factor Authentication for additional security.</li>
          </ul>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't attempt to log in, someone may be trying to access your account. 
            Please secure your account by changing your password.
          </p>
        </div>
      `;

    case '2fa_enabled':
      return `
        <div style="${baseStyle}">
          <h1 style="color: #059669;">🔐 Two-Factor Authentication Enabled</h1>
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #065f46;">
              <strong>Great news!</strong> Your account is now more secure.
            </p>
          </div>
          <div style="${infoBox}">
            <p style="margin: 0;"><strong>Details:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>IP Address: ${data.ipAddress || 'Unknown'}</li>
              <li>Device: ${data.userAgent || 'Unknown'}</li>
              <li>Time: ${timestamp}</li>
            </ul>
          </div>
          <h3>Important Reminders:</h3>
          <ul>
            <li>Keep your backup codes in a safe place.</li>
            <li>You'll need your authenticator app to log in from now on.</li>
            <li>If you lose access to your authenticator, use your backup codes.</li>
          </ul>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't enable 2FA, please contact support immediately.
          </p>
        </div>
      `;

    case '2fa_disabled':
      return `
        <div style="${baseStyle}">
          <h1 style="color: #d97706;">⚠️ Two-Factor Authentication Disabled</h1>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Warning:</strong> Your account security has been reduced.
            </p>
          </div>
          <div style="${infoBox}">
            <p style="margin: 0;"><strong>Details:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>IP Address: ${data.ipAddress || 'Unknown'}</li>
              <li>Device: ${data.userAgent || 'Unknown'}</li>
              <li>Time: ${timestamp}</li>
            </ul>
          </div>
          <h3>We Recommend:</h3>
          <ul>
            <li>Re-enable Two-Factor Authentication as soon as possible.</li>
            <li>Ensure your password is strong and unique.</li>
          </ul>
          <p style="color: #dc2626; font-size: 14px; font-weight: bold;">
            If you didn't disable 2FA, your account may be compromised. 
            Change your password immediately and contact support.
          </p>
        </div>
      `;

    case 'suspicious_activity':
      return `
        <div style="${baseStyle}">
          <h1 style="color: #dc2626;">🚨 Suspicious Activity Detected</h1>
          <div style="${alertBox}">
            <p style="margin: 0; color: #991b1b;">
              <strong>We detected unusual activity on your account.</strong>
            </p>
          </div>
          <div style="${infoBox}">
            <p style="margin: 0;"><strong>Details:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>IP Address: ${data.ipAddress || 'Unknown'}</li>
              <li>Location: ${data.location || 'Unknown'}</li>
              <li>Device: ${data.userAgent || 'Unknown'}</li>
              <li>Time: ${timestamp}</li>
            </ul>
          </div>
          <h3>Immediate Actions Required:</h3>
          <ul>
            <li>Review your recent account activity.</li>
            <li>Change your password if you don't recognize this activity.</li>
            <li>Enable Two-Factor Authentication if not already enabled.</li>
            <li>Contact support if you need assistance.</li>
          </ul>
        </div>
      `;

    case 'password_changed':
      return `
        <div style="${baseStyle}">
          <h1 style="color: #2563eb;">🔑 Password Changed</h1>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #1e40af;">
              Your account password has been successfully changed.
            </p>
          </div>
          <div style="${infoBox}">
            <p style="margin: 0;"><strong>Details:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>IP Address: ${data.ipAddress || 'Unknown'}</li>
              <li>Device: ${data.userAgent || 'Unknown'}</li>
              <li>Time: ${timestamp}</li>
            </ul>
          </div>
          <p style="color: #dc2626; font-size: 14px; font-weight: bold;">
            If you didn't change your password, your account may be compromised. 
            Contact support immediately.
          </p>
        </div>
      `;

    default:
      return `
        <div style="${baseStyle}">
          <h1>Security Notification</h1>
          <p>A security event occurred on your account.</p>
          <div style="${infoBox}">
            <p style="margin: 0;"><strong>Time:</strong> ${timestamp}</p>
          </div>
        </div>
      `;
  }
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: SecurityAlertRequest = await req.json();
    console.log(`[Security Alert] Processing ${data.alertType} for user ${data.userId?.substring(0, 8)}...`);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.userId);
    
    if (userError || !userData?.user?.email) {
      console.error("[Security Alert] Failed to get user email:", userError);
      throw new Error("User not found or no email");
    }

    const userEmail = userData.user.email;
    const maskedEmail = userEmail.substring(0, 3) + "***@" + userEmail.split("@")[1];
    console.log(`[Security Alert] Sending to ${maskedEmail}`);

    // Log the security alert
    const { error: insertError } = await supabase
      .from("security_alerts")
      .insert({
        user_id: data.userId,
        alert_type: data.alertType,
        ip_address: data.ipAddress,
        metadata: {
          userAgent: data.userAgent,
          location: data.location,
          failedAttempts: data.failedAttempts,
          blockedUntil: data.blockedUntil,
        },
        email_sent: false,
      });

    if (insertError) {
      console.error("[Security Alert] Failed to log alert:", insertError);
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "MiniDrama Security <onboarding@resend.dev>",
      to: [userEmail],
      subject: getAlertSubject(data.alertType),
      html: getAlertHtml(data.alertType, data),
    });

    console.log("[Security Alert] Email sent:", emailResponse);

    // Update alert as sent
    if (!insertError) {
      await supabase
        .from("security_alerts")
        .update({ email_sent: true })
        .eq("user_id", data.userId)
        .eq("alert_type", data.alertType)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    // Also log to audit log for compliance
    await supabase.from("admin_audit_log").insert({
      admin_id: data.userId,
      action: `security_alert_${data.alertType}`,
      resource_type: "security_alert",
      metadata: {
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        email_sent: true,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[Security Alert] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
