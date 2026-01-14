import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SecurityThreat {
  id: string;
  type: 'login_blocked' | 'suspicious_activity' | '2fa_disabled' | 'rate_limit' | 'auth_failure' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  isNew?: boolean;
}

interface RealtimeSecurityMonitorState {
  threats: SecurityThreat[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  unreadCount: number;
}

interface UseRealtimeSecurityMonitorOptions {
  maxThreats?: number;
  showNotifications?: boolean;
  severityFilter?: SecurityThreat['severity'][];
}

export function useRealtimeSecurityMonitor(options: UseRealtimeSecurityMonitorOptions = {}) {
  const { 
    maxThreats = 100, 
    showNotifications = true,
    severityFilter = ['low', 'medium', 'high', 'critical']
  } = options;

  const [state, setState] = useState<RealtimeSecurityMonitorState>({
    threats: [],
    isConnected: false,
    connectionStatus: 'connecting',
    unreadCount: 0
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getSeverityIcon = (severity: SecurityThreat['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
    }
  };

  const playAlertSound = useCallback((severity: SecurityThreat['severity']) => {
    if (severity === 'critical' || severity === 'high') {
      // Create a simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = severity === 'critical' ? 880 : 660;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (e) {
        // Audio not available
      }
    }
  }, []);

  const addThreat = useCallback((threat: Omit<SecurityThreat, 'id' | 'timestamp' | 'isNew'>) => {
    const newThreat: SecurityThreat = {
      ...threat,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isNew: true
    };

    if (!severityFilter.includes(threat.severity)) {
      return;
    }

    setState(prev => ({
      ...prev,
      threats: [newThreat, ...prev.threats].slice(0, maxThreats),
      unreadCount: prev.unreadCount + 1
    }));

    if (showNotifications) {
      const icon = getSeverityIcon(threat.severity);
      const variant = threat.severity === 'critical' || threat.severity === 'high' ? 'error' : 'warning';
      
      toast[variant === 'error' ? 'error' : 'warning'](`${icon} ${threat.message}`, {
        description: threat.details.ipAddress ? `IP: ${threat.details.ipAddress}` : undefined,
        duration: threat.severity === 'critical' ? 10000 : 5000
      });

      playAlertSound(threat.severity);
    }

    // Remove "isNew" flag after animation
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        threats: prev.threats.map(t => 
          t.id === newThreat.id ? { ...t, isNew: false } : t
        )
      }));
    }, 3000);
  }, [maxThreats, showNotifications, severityFilter, playAlertSound]);

  const clearUnread = useCallback(() => {
    setState(prev => ({ ...prev, unreadCount: 0 }));
  }, []);

  const clearThreats = useCallback(() => {
    setState(prev => ({ ...prev, threats: [], unreadCount: 0 }));
  }, []);

  const mapAlertToThreat = useCallback((alert: any): Omit<SecurityThreat, 'id' | 'timestamp' | 'isNew'> => {
    const alertType = alert.alert_type;
    let severity: SecurityThreat['severity'] = 'medium';
    let type: SecurityThreat['type'] = 'suspicious_activity';
    let message = 'Security event detected';

    switch (alertType) {
      case 'login_blocked':
        severity = 'high';
        type = 'login_blocked';
        message = 'Login attempt blocked due to rate limiting';
        break;
      case '2fa_disabled':
        severity = 'high';
        type = '2fa_disabled';
        message = 'Two-factor authentication was disabled';
        break;
      case '2fa_enabled':
        severity = 'low';
        type = 'admin_action';
        message = 'Two-factor authentication enabled';
        break;
      case 'password_changed':
        severity = 'medium';
        type = 'admin_action';
        message = 'Password was changed';
        break;
      case 'suspicious_activity':
        severity = 'critical';
        type = 'suspicious_activity';
        message = 'Suspicious activity detected';
        break;
    }

    return {
      type,
      severity,
      message,
      details: alert.metadata || {},
      userId: alert.user_id,
      ipAddress: alert.ip_address
    };
  }, []);

  const mapLoginActivityToThreat = useCallback((activity: any): Omit<SecurityThreat, 'id' | 'timestamp' | 'isNew'> | null => {
    // Only track failures
    if (activity.success) return null;

    return {
      type: 'auth_failure',
      severity: 'medium',
      message: `Failed login attempt: ${activity.failure_reason || 'Unknown'}`,
      details: {
        browser: activity.browser,
        deviceType: activity.device_type,
        location: activity.location
      },
      userId: activity.user_id,
      ipAddress: activity.ip_address
    };
  }, []);

  const mapRateLimitToThreat = useCallback((record: any): Omit<SecurityThreat, 'id' | 'timestamp' | 'isNew'> | null => {
    // Only track when blocked
    if (!record.blocked_until) return null;

    return {
      type: 'rate_limit',
      severity: record.failed_attempts >= 15 ? 'critical' : 'high',
      message: `IP blocked after ${record.failed_attempts} failed attempts`,
      details: {
        failedAttempts: record.failed_attempts,
        blockedUntil: record.blocked_until
      },
      ipAddress: record.ip_address
    };
  }, []);

  useEffect(() => {
    // Subscribe to real-time changes on security-related tables
    const channel = supabase
      .channel('security-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts'
        },
        (payload) => {
          console.log('[Security Monitor] New security alert:', payload);
          const threat = mapAlertToThreat(payload.new);
          addThreat(threat);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'login_activity'
        },
        (payload) => {
          console.log('[Security Monitor] New login activity:', payload);
          const threat = mapLoginActivityToThreat(payload.new);
          if (threat) addThreat(threat);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'login_rate_limits'
        },
        (payload) => {
          console.log('[Security Monitor] Rate limit update:', payload);
          const threat = mapRateLimitToThreat(payload.new);
          if (threat) addThreat(threat);
        }
      )
      .subscribe((status) => {
        console.log('[Security Monitor] Subscription status:', status);
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          connectionStatus: status === 'SUBSCRIBED' ? 'connected' : 
                          status === 'CLOSED' ? 'disconnected' : 
                          status === 'CHANNEL_ERROR' ? 'error' : 'connecting'
        }));
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [addThreat, mapAlertToThreat, mapLoginActivityToThreat, mapRateLimitToThreat]);

  return {
    ...state,
    addThreat,
    clearUnread,
    clearThreats
  };
}
