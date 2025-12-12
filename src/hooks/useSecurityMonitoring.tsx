import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityEvent {
  type: 'auth_attempt' | 'rate_limit' | 'suspicious_activity' | 'csrf_attempt' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

interface AlertConfig {
  showToasts: boolean;
  logToConsole: boolean;
  sendToServer: boolean;
}

const defaultAlertConfig: AlertConfig = {
  showToasts: true,
  logToConsole: import.meta.env.DEV,
  sendToServer: true,
};

// Track failed attempts for pattern detection
const failedAttemptTracker = new Map<string, { count: number; firstAttempt: number }>();

export const useSecurityMonitoring = (config: Partial<AlertConfig> = {}) => {
  const alertConfig = { ...defaultAlertConfig, ...config };
  const isProcessingRef = useRef(false);

  const showSecurityAlert = useCallback((event: SecurityEvent) => {
    if (!alertConfig.showToasts) return;

    const alertMessages: Record<SecurityEvent['type'], { title: string; getDescription: (e: SecurityEvent) => string }> = {
      auth_attempt: {
        title: event.details.success ? '🔓 Login Successful' : '🚨 Failed Login Attempt',
        getDescription: (e) => e.details.success 
          ? 'You have been authenticated successfully.'
          : `Failed login attempt detected. ${e.details.consecutiveFailures > 3 ? 'Multiple failures detected!' : ''}`
      },
      rate_limit: {
        title: '⚠️ Rate Limit Exceeded',
        getDescription: (e) => `Too many requests on ${e.details.endpoint}. Please slow down.`
      },
      suspicious_activity: {
        title: '🚨 Suspicious Activity Detected',
        getDescription: (e) => `Unusual activity: ${e.details.activity}`
      },
      csrf_attempt: {
        title: '🛡️ CSRF Protection Triggered',
        getDescription: () => 'A potentially malicious request was blocked.'
      },
      admin_action: {
        title: '👤 Admin Action Logged',
        getDescription: (e) => `Admin performed: ${e.details.action}`
      }
    };

    const message = alertMessages[event.type];
    if (!message) return;

    // Show toast based on severity
    if (event.severity === 'critical' || event.severity === 'high') {
      toast.error(message.title, {
        description: message.getDescription(event),
        duration: 8000,
      });
    } else if (event.severity === 'medium') {
      toast.warning(message.title, {
        description: message.getDescription(event),
        duration: 5000,
      });
    } else if (event.type === 'auth_attempt' && event.details.success) {
      toast.success(message.title, {
        description: message.getDescription(event),
        duration: 3000,
      });
    }
  }, [alertConfig.showToasts]);

  const logSecurityEvent = useCallback(async (event: Omit<SecurityEvent, 'timestamp'>) => {
    // Prevent concurrent processing of same event
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Show real-time alert
      showSecurityAlert(securityEvent);

      // Log to console in development
      if (alertConfig.logToConsole) {
        const logMethod = event.severity === 'critical' || event.severity === 'high' 
          ? console.error 
          : event.severity === 'medium' 
            ? console.warn 
            : console.log;
        logMethod('Security Event:', securityEvent);
      }

      // Send to monitoring endpoint
      if (alertConfig.sendToServer) {
        await supabase.functions.invoke('security-monitor', {
          body: securityEvent
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [showSecurityAlert, alertConfig]);

  const monitorAuthAttempts = useCallback((email: string, success: boolean) => {
    const maskedEmail = email.replace(/(.{2}).*(@.*)/, '$1***$2');
    const trackingKey = maskedEmail;
    
    // Track consecutive failures for pattern detection
    const tracker = failedAttemptTracker.get(trackingKey) || { count: 0, firstAttempt: Date.now() };
    
    if (!success) {
      tracker.count++;
      if (tracker.count === 1) tracker.firstAttempt = Date.now();
      failedAttemptTracker.set(trackingKey, tracker);
    } else {
      failedAttemptTracker.delete(trackingKey);
    }

    // Determine severity based on patterns
    let severity: SecurityEvent['severity'] = success ? 'low' : 'medium';
    if (!success && tracker.count >= 5) {
      severity = 'critical';
    } else if (!success && tracker.count >= 3) {
      severity = 'high';
    }

    logSecurityEvent({
      type: 'auth_attempt',
      severity,
      details: {
        email: maskedEmail,
        success,
        consecutiveFailures: success ? 0 : tracker.count,
        timestamp: Date.now()
      }
    });
  }, [logSecurityEvent]);

  const monitorRateLimit = useCallback((endpoint: string, attempts: number) => {
    const severity: SecurityEvent['severity'] = attempts > 20 ? 'critical' : attempts > 10 ? 'high' : 'medium';
    
    logSecurityEvent({
      type: 'rate_limit',
      severity,
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

  const monitorAdminAction = useCallback((action: string, resourceType?: string, resourceId?: string) => {
    logSecurityEvent({
      type: 'admin_action',
      severity: 'low',
      details: {
        action,
        resourceType,
        resourceId,
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
          logSecurityEvent({
            type: 'csrf_attempt',
            severity: 'high',
            details: {
              url,
              method: options?.method || 'GET'
            }
          });
        }
      }
      
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    monitorAuthAttempts,
    monitorRateLimit,
    monitorSuspiciousActivity,
    monitorAdminAction,
    showSecurityAlert
  };
};