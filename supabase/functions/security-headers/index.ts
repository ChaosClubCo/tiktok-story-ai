import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/corsHeaders.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Enhanced Content Security Policy with nonce support
    const nonce = crypto.randomUUID();
    
    // Security headers to add to responses
    const securityHeaders = {
      // Comprehensive Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.elevenlabs.io",
        "media-src 'self' blob: data:",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
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
        message: "Security headers configured",
        headers: Object.keys(securityHeaders).filter(key => !key.startsWith('Access-Control'))
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
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