import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Scheduled Digest Edge Function
 * 
 * This function is designed to be called by an external scheduler (like cron-job.org, 
 * GitHub Actions, or Supabase's pg_cron extension).
 * 
 * Schedule recommendations:
 * - Daily digest: 0 9 * * * (9:00 AM every day)
 * - Weekly digest: 0 9 * * 1 (9:00 AM every Monday)
 * 
 * External scheduler setup examples:
 * 
 * 1. cron-job.org (free tier available):
 *    - URL: https://<project-ref>.supabase.co/functions/v1/scheduled-digest
 *    - Method: POST
 *    - Headers: Authorization: Bearer <service_role_key>
 *    - Body: {"digestType": "daily", "cronSecret": "<your-secret>"}
 * 
 * 2. GitHub Actions:
 *    - Use schedule trigger with cron expression
 *    - Use curl to call this endpoint
 * 
 * 3. Supabase pg_cron (requires database extension):
 *    - SELECT cron.schedule('daily-digest', '0 9 * * *', $$
 *        SELECT net.http_post(
 *          url := 'https://<project-ref>.supabase.co/functions/v1/scheduled-digest',
 *          body := '{"digestType": "daily"}'::jsonb,
 *          headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
 *        );
 *      $$);
 */

interface ScheduledDigestRequest {
  digestType: 'daily' | 'weekly';
  cronSecret?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { digestType = 'daily', cronSecret: requestSecret }: ScheduledDigestRequest = await req.json();
    
    // Verify cron secret if configured (optional security layer)
    if (cronSecret && cronSecret !== requestSecret) {
      console.error("[Scheduled Digest] Invalid cron secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`[Scheduled Digest] Starting ${digestType} digest job at ${new Date().toISOString()}`);
    
    // Check if it's the right time for this digest type
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday
    
    // For weekly digests, only run on Mondays
    if (digestType === 'weekly' && dayOfWeek !== 1) {
      console.log("[Scheduled Digest] Skipping weekly digest - not Monday");
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true, 
          reason: "Weekly digest only runs on Mondays" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Call the send-security-digest function
    const digestResponse = await fetch(`${supabaseUrl}/functions/v1/send-security-digest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ digestType }),
    });
    
    if (!digestResponse.ok) {
      const error = await digestResponse.text();
      throw new Error(`Digest function failed: ${error}`);
    }
    
    const digestResult = await digestResponse.json();
    
    // Log the scheduled run
    await supabase.from('admin_audit_log').insert({
      admin_id: 'cron_scheduler',
      action: `scheduled_${digestType}_digest`,
      resource_type: 'cron_job',
      metadata: {
        executedAt: now.toISOString(),
        result: digestResult,
      },
    });
    
    console.log(`[Scheduled Digest] ${digestType} digest completed successfully`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        digestType,
        executedAt: now.toISOString(),
        result: digestResult 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[Scheduled Digest] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
