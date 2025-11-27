import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/corsHeaders.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Generate cryptographic nonce for inline scripts
    const nonce = crypto.randomUUID();
    
    // Security headers to add to responses
    const securityHeaders = {
      // Comprehensive Content Security Policy (Production-Ready)
      'Content-Security-Policy': [
        // Default: Only load from same origin
        "default-src 'self'",
        
        // Scripts: Remove unsafe-inline/unsafe-eval for XSS protection
        // Allow Supabase realtime, CDN libraries, and nonce-based inline scripts
        "script-src 'self' 'nonce-" + nonce + "' https://*.supabase.co https://cdn.jsdelivr.net https://challenges.cloudflare.com",
        
        // Styles: Allow inline styles (needed for React/styled-components) and Google Fonts
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        
        // Fonts: Allow Google Fonts and data URIs
        "font-src 'self' https://fonts.gstatic.com data:",
        
        // Images: Allow HTTPS, data URIs, and blob for dynamic content
        "img-src 'self' data: https: blob:",
        
        // Connect: API endpoints (Supabase, OpenAI, ElevenLabs, Stripe, PostHog)
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.elevenlabs.io https://api.stripe.com https://us.i.posthog.com",
        
        // Media: Allow blob and data URIs for generated content
        "media-src 'self' blob: data:",
        
        // Workers: Allow blob for Web Workers
        "worker-src 'self' blob:",
        
        // Prevent loading of plugins (Flash, Java, etc.)
        "object-src 'none'",
        
        // Prevent embedding in iframes (clickjacking protection)
        "frame-ancestors 'none'",
        
        // Restrict base tag to prevent base tag hijacking
        "base-uri 'self'",
        
        // Only allow form submissions to same origin
        "form-action 'self'",
        
        // Upgrade all HTTP requests to HTTPS
        "upgrade-insecure-requests",
        
        // Block mixed content (HTTP resources on HTTPS pages)
        "block-all-mixed-content"
      ].join('; '),
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Enforce HTTPS with preload
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      
      // Prevent referrer leakage
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Comprehensive Permissions Policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=(self)',
        'encrypted-media=(self)',
        'picture-in-picture=(self)'
      ].join(', '),
      
      // Cross-Origin policies
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      
      ...corsHeaders
    };

    return new Response(
      JSON.stringify({ 
        message: "Security headers configured - Enhanced CSP with XSS protection",
        nonce: nonce,
        csp_strength: "strict",
        headers: Object.keys(securityHeaders).filter(key => !key.startsWith('Access-Control')),
        security_features: [
          "XSS Protection (no unsafe-inline/unsafe-eval for scripts)",
          "Clickjacking Protection (frame-ancestors 'none')",
          "MIME Sniffing Protection",
          "HTTPS Enforcement (HSTS with preload)",
          "Mixed Content Blocking",
          "Referrer Policy Protection"
        ]
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Nonce': nonce, // Return nonce for client-side use if needed
          ...securityHeaders
        }
      }
    );

  } catch (error) {
    console.error('Security headers function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to apply security headers'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});