import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  type: 'auth_attempt' | 'rate_limit' | 'suspicious_activity' | 'csrf_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export const useSecurityMonitoring = () => {
  const logSecurityEvent = useCallback(async (event: Omit<SecurityEvent, 'timestamp'>) => {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        // Note: IP is handled server-side for security
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        console.warn('Security Event:', securityEvent);
      }

      // Send to monitoring endpoint
      await supabase.functions.invoke('security-monitor', {
        body: securityEvent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  const monitorAuthAttempts = useCallback((email: string, success: boolean) => {
    logSecurityEvent({
      type: 'auth_attempt',
      severity: success ? 'low' : 'medium',
      details: {
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially mask email
        success,
        timestamp: Date.now()
      }
    });
  }, [logSecurityEvent]);

  const monitorRateLimit = useCallback((endpoint: string, attempts: number) => {
    logSecurityEvent({
      type: 'rate_limit',
      severity: attempts > 10 ? 'high' : 'medium',
      details: {
        endpoint,
        attempts,
        timestamp: Date.now()
      }
    });
  }, [logSecurityEvent]);

  const monitorSuspiciousActivity = useCallback((activity: string, details: Record<string, any>) => {
    logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      details: {
        activity,
        ...details,
        timestamp: Date.now()
      }
    });
  }, [logSecurityEvent]);

  // Monitor for potential CSRF attempts
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      // Check for suspicious patterns
      if (typeof url === 'string' && url.includes('supabase')) {
        const hasValidOrigin = options?.headers && 
          (options.headers as any)['x-client-info'];
        
        if (!hasValidOrigin && options?.method !== 'GET') {
          monitorSuspiciousActivity('potential_csrf', {
            url,
            method: options?.method || 'GET'
          });
        }
      }
      
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [monitorSuspiciousActivity]);

  return {
    logSecurityEvent,
    monitorAuthAttempts,
    monitorRateLimit,
    monitorSuspiciousActivity
  };
};