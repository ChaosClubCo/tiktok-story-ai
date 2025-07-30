import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  type: 'auth_attempt' | 'rate_limit' | 'suspicious_activity' | 'csrf_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const event: SecurityEvent = await req.json();
    
    // Add server-side information
    const enrichedEvent = {
      ...event,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      serverTimestamp: new Date().toISOString()
    };

    // Log security event
    console.log('Security Event:', JSON.stringify(enrichedEvent, null, 2));

    // Critical events should be handled immediately
    if (event.severity === 'critical' || event.severity === 'high') {
      console.warn('HIGH SEVERITY SECURITY EVENT:', enrichedEvent);
      
      // In production, you might want to:
      // - Send alerts to security team
      // - Update threat detection rules
      // - Temporarily block suspicious IPs
    }

    // Rate limiting events
    if (event.type === 'rate_limit') {
      console.warn('RATE LIMIT EXCEEDED:', {
        ip: enrichedEvent.ip,
        userAgent: event.userAgent,
        details: event.details
      });
    }

    // Suspicious activity
    if (event.type === 'suspicious_activity') {
      console.error('SUSPICIOUS ACTIVITY DETECTED:', enrichedEvent);
    }

    // Auth attempt monitoring
    if (event.type === 'auth_attempt' && !event.details.success) {
      console.warn('FAILED AUTH ATTEMPT:', {
        ip: enrichedEvent.ip,
        email: event.details.email,
        timestamp: event.timestamp
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Security event logged',
        eventId: crypto.randomUUID()
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Security monitoring error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process security event',
        message: error.message 
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