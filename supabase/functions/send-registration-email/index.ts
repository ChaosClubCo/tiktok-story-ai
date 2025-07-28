import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REGISTRATION-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { userEmail, displayName } = await req.json();
    if (!userEmail) throw new Error("User email is required");
    logStep("Processing registration email", { userEmail, displayName });

    // Send notification email to owner
    const ownerEmailResponse = await resend.emails.send({
      from: "MiniDrama <onboarding@resend.dev>",
      to: ["your-email@example.com"], // Replace with your actual email
      subject: "New User Registration - MiniDrama",
      html: `
        <h2>New User Registration</h2>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Display Name:</strong> ${displayName || 'Not provided'}</p>
        <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>This is an automated notification from your MiniDrama application.</p>
      `,
    });

    logStep("Owner notification email sent", { response: ownerEmailResponse });

    // Send welcome email to new user
    const welcomeEmailResponse = await resend.emails.send({
      from: "MiniDrama <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Welcome to MiniDrama!",
      html: `
        <h1>Welcome to MiniDrama, ${displayName || 'Creator'}!</h1>
        <p>Thank you for joining our community of creative storytellers.</p>
        
        <h2>Get Started:</h2>
        <ul>
          <li>Create your first mini-drama script</li>
          <li>Choose from our variety of niches and tones</li>
          <li>Export and share your stories</li>
        </ul>
        
        <h2>Subscription Tiers Available:</h2>
        <ul>
          <li><strong>Creator Tier ($9/month):</strong> Unlimited generation, basic templates, 720p exports</li>
          <li><strong>Pro Tier ($19/month):</strong> HD exports, trending templates, no watermark</li>
          <li><strong>Studio Tier ($49/month):</strong> Team collaboration, analytics, brand kit</li>
        </ul>
        
        <p>Start creating amazing mini-dramas today!</p>
        <p>Best regards,<br>The MiniDrama Team</p>
      `,
    });

    logStep("Welcome email sent", { response: welcomeEmailResponse });

    return new Response(JSON.stringify({ 
      success: true,
      ownerEmailId: ownerEmailResponse.data?.id,
      welcomeEmailId: welcomeEmailResponse.data?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in registration email", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});