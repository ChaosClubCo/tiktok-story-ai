import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigestRequest {
  digestType: 'daily' | 'weekly';
  adminEmails?: string[];
}

interface SecuritySummary {
  totalEvents: number;
  criticalEvents: number;
  blockedLogins: number;
  failedLogins: number;
  successfulLogins: number;
  new2FASetups: number;
  suspiciousActivities: number;
  topIPs: { ip: string; count: number }[];
  recentAlerts: { type: string; count: number }[];
}

const getDigestHtml = (summary: SecuritySummary, digestType: string, period: string): string => {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
    background: #ffffff;
  `;

  const headerStyle = `
    background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
    color: white;
    padding: 24px;
    border-radius: 12px 12px 0 0;
    text-align: center;
  `;

  const cardStyle = `
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
  `;

  const metricBox = `
    display: inline-block;
    text-align: center;
    padding: 16px;
    min-width: 100px;
  `;

  const criticalColor = summary.criticalEvents > 0 ? '#dc2626' : '#22c55e';
  const blockedColor = summary.blockedLogins > 0 ? '#f59e0b' : '#22c55e';

  return `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin: 0; font-size: 24px;">🛡️ Security ${digestType === 'daily' ? 'Daily' : 'Weekly'} Digest</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">${period}</p>
      </div>
      
      <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <!-- Key Metrics -->
        <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 18px;">📊 Security Overview</h2>
        
        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 24px;">
          <div style="${metricBox} background: #f0f9ff; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #0369a1;">${summary.totalEvents}</div>
            <div style="font-size: 12px; color: #64748b;">Total Events</div>
          </div>
          
          <div style="${metricBox} background: ${summary.criticalEvents > 0 ? '#fef2f2' : '#f0fdf4'}; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: ${criticalColor};">${summary.criticalEvents}</div>
            <div style="font-size: 12px; color: #64748b;">Critical Events</div>
          </div>
          
          <div style="${metricBox} background: ${summary.blockedLogins > 0 ? '#fffbeb' : '#f0fdf4'}; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: ${blockedColor};">${summary.blockedLogins}</div>
            <div style="font-size: 12px; color: #64748b;">Blocked Logins</div>
          </div>
          
          <div style="${metricBox} background: #f0fdf4; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #16a34a;">${summary.successfulLogins}</div>
            <div style="font-size: 12px; color: #64748b;">Successful Logins</div>
          </div>
        </div>
        
        <!-- Authentication Summary -->
        <div style="${cardStyle}">
          <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">🔐 Authentication Summary</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Successful Logins</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16a34a;">${summary.successfulLogins}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Failed Attempts</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #dc2626;">${summary.failedLogins}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Rate Limited (Blocked)</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f59e0b;">${summary.blockedLogins}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">New 2FA Setups</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0369a1;">${summary.new2FASetups}</td>
            </tr>
          </table>
        </div>
        
        <!-- Alert Breakdown -->
        ${summary.recentAlerts.length > 0 ? `
          <div style="${cardStyle}">
            <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">⚠️ Alert Breakdown</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              ${summary.recentAlerts.map(alert => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b;">${alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${alert.count}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}
        
        <!-- Top IPs -->
        ${summary.topIPs.length > 0 ? `
          <div style="${cardStyle}">
            <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px;">🌐 Top IP Addresses (Failed Attempts)</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              ${summary.topIPs.slice(0, 5).map(ip => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; font-family: monospace; color: #64748b;">${ip.ip}</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #dc2626;">${ip.count} attempts</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}
        
        <!-- Recommendations -->
        ${summary.criticalEvents > 0 || summary.suspiciousActivities > 0 ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-top: 16px;">
            <h3 style="margin: 0 0 12px; color: #991b1b; font-size: 16px;">🚨 Recommended Actions</h3>
            <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px;">
              ${summary.criticalEvents > 0 ? '<li>Review critical security events immediately</li>' : ''}
              ${summary.suspiciousActivities > 0 ? '<li>Investigate suspicious activity patterns</li>' : ''}
              ${summary.blockedLogins > 5 ? '<li>Consider reviewing rate limit thresholds</li>' : ''}
              <li>Ensure all admin accounts have 2FA enabled</li>
            </ul>
          </div>
        ` : `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 16px;">
            <p style="margin: 0; color: #166534; font-size: 14px;">
              ✅ <strong>All Clear!</strong> No critical security issues detected during this period.
            </p>
          </div>
        `}
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This is an automated security digest from MiniDrama Admin Panel.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">
            Generated at ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>
      </div>
    </div>
  `;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { digestType = 'daily', adminEmails }: DigestRequest = await req.json();
    
    console.log(`[Security Digest] Generating ${digestType} digest`);

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (digestType === 'daily') {
      startDate.setDate(now.getDate() - 1);
    } else {
      startDate.setDate(now.getDate() - 7);
    }

    const period = digestType === 'daily' 
      ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Fetch security alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('security_alerts')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (alertsError) {
      console.error('[Security Digest] Error fetching alerts:', alertsError);
    }

    // Fetch login activity
    const { data: loginActivity, error: loginError } = await supabase
      .from('login_activity')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (loginError) {
      console.error('[Security Digest] Error fetching login activity:', loginError);
    }

    // Fetch rate limits
    const { data: rateLimits, error: rateLimitError } = await supabase
      .from('login_rate_limits')
      .select('*')
      .gte('last_attempt_at', startDate.toISOString());

    if (rateLimitError) {
      console.error('[Security Digest] Error fetching rate limits:', rateLimitError);
    }

    // Calculate summary
    const summary: SecuritySummary = {
      totalEvents: (alerts?.length || 0) + (loginActivity?.length || 0),
      criticalEvents: alerts?.filter(a => 
        a.alert_type === 'suspicious_activity' || 
        a.alert_type === 'login_blocked'
      ).length || 0,
      blockedLogins: rateLimits?.filter(r => r.blocked_until).length || 0,
      failedLogins: loginActivity?.filter(l => !l.success).length || 0,
      successfulLogins: loginActivity?.filter(l => l.success).length || 0,
      new2FASetups: alerts?.filter(a => a.alert_type === '2fa_enabled').length || 0,
      suspiciousActivities: alerts?.filter(a => a.alert_type === 'suspicious_activity').length || 0,
      topIPs: [],
      recentAlerts: []
    };

    // Calculate top IPs with failed attempts
    const ipCounts: { [key: string]: number } = {};
    loginActivity?.filter(l => !l.success).forEach(l => {
      const ip = l.ip_address || 'unknown';
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });
    summary.topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate alert breakdown
    const alertCounts: { [key: string]: number } = {};
    alerts?.forEach(a => {
      alertCounts[a.alert_type] = (alertCounts[a.alert_type] || 0) + 1;
    });
    summary.recentAlerts = Object.entries(alertCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Get admin emails if not provided
    let targetEmails = adminEmails || [];
    
    if (targetEmails.length === 0) {
      // Fetch all admin users
      const { data: adminRoles } = await supabase
        .from('admin_roles')
        .select('user_id')
        .in('role', ['super_admin', 'support_admin']);

      if (adminRoles && adminRoles.length > 0) {
        for (const role of adminRoles) {
          const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
          if (userData?.user?.email) {
            targetEmails.push(userData.user.email);
          }
        }
      }
    }

    console.log(`[Security Digest] Sending to ${targetEmails.length} admin(s)`);

    if (targetEmails.length === 0) {
      console.log('[Security Digest] No admin emails found, skipping send');
      return new Response(
        JSON.stringify({ success: true, message: 'No admin emails configured', summary }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send digest email
    const emailResponse = await resend.emails.send({
      from: "MiniDrama Security <onboarding@resend.dev>",
      to: targetEmails,
      subject: `🛡️ Security ${digestType === 'daily' ? 'Daily' : 'Weekly'} Digest - ${summary.criticalEvents > 0 ? '⚠️ Action Required' : '✅ All Clear'}`,
      html: getDigestHtml(summary, digestType, period),
    });

    console.log('[Security Digest] Email sent:', emailResponse);

    // Log the digest generation
    await supabase.from('admin_audit_log').insert({
      admin_id: 'system',
      action: `security_digest_${digestType}`,
      resource_type: 'security_digest',
      metadata: {
        period,
        summary,
        recipientCount: targetEmails.length,
      },
    });

    return new Response(
      JSON.stringify({ success: true, summary, emailsSent: targetEmails.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('[Security Digest] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
