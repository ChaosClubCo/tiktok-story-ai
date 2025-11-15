import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation and sanitization functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeInput = (input: string, maxLength: number = 100): string => {
  return input
    .replace(/[<>&"']/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[char] || char;
    })
    .slice(0, maxLength)
    .trim();
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
    
    // Input validation
    if (!userEmail || !displayName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userEmail and displayName" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Security: Verify the email matches the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logStep("Invalid authentication token", { error: authError?.message });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify email matches authenticated user
    if (user.email !== userEmail) {
      logStep("Email mismatch attempt detected", { 
        authenticatedEmail: user.email, 
        requestedEmail: userEmail 
      });
      return new Response(
        JSON.stringify({ error: "Email does not match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep("Email validation passed", { userEmail: user.email });

    if (!validateEmail(userEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(userEmail, 254);
    const sanitizedDisplayName = sanitizeInput(displayName, 50);

    logStep("Processing registration email", { userEmail: sanitizedEmail, displayName: sanitizedDisplayName });

    // Get owner email from environment variable
    const ownerEmail = Deno.env.get("OWNER_EMAIL");
    if (!ownerEmail) {
      console.error("OWNER_EMAIL environment variable not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send notification email to owner
    const ownerEmailResponse = await resend.emails.send({
      from: "MiniDrama <onboarding@resend.dev>",
      to: [ownerEmail],
      subject: "New User Registration - MiniDrama",
      html: `
        <h2>New User Registration</h2>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Display Name:</strong> ${sanitizedDisplayName}</p>
        <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>This is an automated notification from your MiniDrama application.</p>
      `,
    });

    logStep("Owner notification email sent", { response: ownerEmailResponse });

    // Send welcome email to new user
    const welcomeEmailResponse = await resend.emails.send({
      from: "MiniDrama <onboarding@resend.dev>",
      to: [sanitizedEmail],
      subject: "Welcome to MiniDrama!",
      html: `
        <h1>Welcome to MiniDrama, ${sanitizedDisplayName}!</h1>
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