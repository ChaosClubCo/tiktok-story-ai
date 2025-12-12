import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  type: 'auth_attempt' | 'rate_limit' | 'suspicious_activity' | 'csrf_attempt' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

// In-memory store for tracking patterns (reset on function restart)
const eventPatterns = new Map<string, { count: number; lastSeen: number }>();

const detectPatterns = (event: SecurityEvent, ip: string): { isAnomalous: boolean; reason?: string } => {
  const patternKey = `${event.type}:${ip}`;
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minute window
  
  const pattern = eventPatterns.get(patternKey) || { count: 0, lastSeen: 0 };
  
  // Reset if window expired
  if (now - pattern.lastSeen > windowMs) {
    pattern.count = 1;
  } else {
    pattern.count++;
  }
  pattern.lastSeen = now;
  eventPatterns.set(patternKey, pattern);
  
  // Anomaly detection thresholds
  const thresholds: Record<SecurityEvent['type'], number> = {
    auth_attempt: 10,
    rate_limit: 5,
    suspicious_activity: 3,
    csrf_attempt: 2,
    admin_action: 50
  };
  
  if (pattern.count > thresholds[event.type]) {
    return { 
      isAnomalous: true, 
      reason: `${event.type} threshold exceeded: ${pattern.count} events in 5 minutes` 
    };
  }
  
  return { isAnomalous: false };
};

const maskPII = (data: Record<string, any>): Record<string, any> => {
  const masked = { ...data };
  if (masked.email && typeof masked.email === 'string') {
    masked.email = masked.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }
  if (masked.ip && typeof masked.ip === 'string') {
    const parts = masked.ip.split('.');
    if (parts.length === 4) {
      masked.ip = `${parts[0]}.${parts[1]}.***.***`;
    }
  }
  return masked;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const event: SecurityEvent = await req.json();
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Add server-side information
    const enrichedEvent = {
      ...event,
      ip: clientIp,
      serverTimestamp: new Date().toISOString(),
      details: maskPII(event.details)
    };

    // Detect anomalous patterns
    const patternAnalysis = detectPatterns(event, clientIp);
    if (patternAnalysis.isAnomalous) {
      enrichedEvent.details.anomalyDetected = true;
      enrichedEvent.details.anomalyReason = patternAnalysis.reason;
      console.error('ANOMALY DETECTED:', patternAnalysis.reason, enrichedEvent);
    }

    // Log security event with structured format
    const logLevel = event.severity === 'critical' || event.severity === 'high' ? 'ERROR' : 
                     event.severity === 'medium' ? 'WARN' : 'INFO';
    console.log(`[${logLevel}] Security Event:`, JSON.stringify(enrichedEvent, null, 2));

    // Critical events should be handled immediately
    if (event.severity === 'critical' || event.severity === 'high') {
      console.error('HIGH SEVERITY SECURITY EVENT:', {
        type: enrichedEvent.type,
        severity: enrichedEvent.severity,
        ip: enrichedEvent.ip,
        timestamp: enrichedEvent.serverTimestamp,
        details: enrichedEvent.details
      });
      
      // Future: Send alerts to security team via email/webhook
      // Future: Update threat detection rules dynamically
      // Future: Temporarily block suspicious IPs
    }

    // Rate limiting events
    if (event.type === 'rate_limit') {
      console.warn('RATE LIMIT EXCEEDED:', {
        ip: enrichedEvent.ip,
        userAgent: event.userAgent?.substring(0, 100),
        attempts: event.details.attempts,
        endpoint: event.details.endpoint
      });
    }

    // Suspicious activity
    if (event.type === 'suspicious_activity') {
      console.error('SUSPICIOUS ACTIVITY DETECTED:', {
        activity: enrichedEvent.details.activity,
        ip: enrichedEvent.ip,
        timestamp: enrichedEvent.serverTimestamp
      });
    }

    // Auth attempt monitoring with pattern detection
    if (event.type === 'auth_attempt' && !event.details.success) {
      console.warn('FAILED AUTH ATTEMPT:', {
        ip: enrichedEvent.ip,
        consecutiveFailures: event.details.consecutiveFailures,
        timestamp: enrichedEvent.serverTimestamp
      });
    }

    // Admin action logging
    if (event.type === 'admin_action') {
      console.log('ADMIN ACTION:', {
        action: enrichedEvent.details.action,
        resourceType: enrichedEvent.details.resourceType,
        resourceId: enrichedEvent.details.resourceId,
        timestamp: enrichedEvent.serverTimestamp
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Security event logged',
        eventId: crypto.randomUUID(),
        anomalyDetected: patternAnalysis.isAnomalous
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
        error: 'Failed to process security event'
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