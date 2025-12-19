import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { WelcomeEmail } from './_templates/welcome.tsx'
import { VerificationEmail } from './_templates/verification.tsx'
import { NotificationEmail } from './_templates/notification.tsx'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'verification' | 'notification';
  to: string;
  userName?: string;
  siteUrl?: string;
  // For verification emails
  verificationUrl?: string;
  token?: string;
  // For notification emails
  notificationType?: 'script_complete' | 'series_published' | 'prediction_ready' | 'weekly_digest';
  title?: string;
  message?: string;
  ctaText?: string;
  ctaUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { type, to, userName, siteUrl = 'https://minidrama.app' } = body;

    let html: string;
    let subject: string;

    switch (type) {
      case 'welcome':
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            userName: userName || 'Creator',
            siteUrl,
          })
        );
        subject = 'Welcome to MiniDrama! 🎬';
        break;

      case 'verification':
        html = await renderAsync(
          React.createElement(VerificationEmail, {
            verificationUrl: body.verificationUrl || '',
            token: body.token,
          })
        );
        subject = 'Verify your email for MiniDrama';
        break;

      case 'notification':
        html = await renderAsync(
          React.createElement(NotificationEmail, {
            userName: userName || 'Creator',
            siteUrl,
            notificationType: body.notificationType || 'script_complete',
            title: body.title || 'New Update',
            message: body.message || '',
            ctaText: body.ctaText,
            ctaUrl: body.ctaUrl,
          })
        );
        subject = body.title || 'MiniDrama Update';
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const { error } = await resend.emails.send({
      from: 'MiniDrama <noreply@minidrama.app>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log(`Email sent successfully: ${type} to ${to}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
