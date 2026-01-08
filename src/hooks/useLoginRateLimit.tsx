import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoginRateLimitState {
  isBlocked: boolean;
  blockedUntil: Date | null;
  remainingAttempts: number | null;
  retryAfterSeconds: number;
  warningMessage: string | null;
  requiresCaptcha: boolean;
  captchaAttemptsRemaining: number | null;
}

interface RateLimitResponse {
  allowed: boolean;
  blocked?: boolean;
  blockedUntil?: string;
  remainingAttempts?: number;
  retryAfterSeconds?: number;
  message?: string;
  requiresCaptcha?: boolean;
  captchaAttemptsRemaining?: number;
}

export function useLoginRateLimit() {
  const [state, setState] = useState<LoginRateLimitState>({
    isBlocked: false,
    blockedUntil: null,
    remainingAttempts: null,
    retryAfterSeconds: 0,
    warningMessage: null,
    requiresCaptcha: false,
    captchaAttemptsRemaining: null
  });
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer for blocked state
  useEffect(() => {
    if (state.isBlocked && state.retryAfterSeconds > 0) {
      countdownRef.current = setInterval(() => {
        setState(prev => {
          const newRetry = prev.retryAfterSeconds - 1;
          if (newRetry <= 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return {
              ...prev,
              isBlocked: false,
              blockedUntil: null,
              retryAfterSeconds: 0,
              warningMessage: null,
              requiresCaptcha: false,
              captchaAttemptsRemaining: null
            };
          }
          return { ...prev, retryAfterSeconds: newRetry };
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [state.isBlocked]);

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke<RateLimitResponse>('login-rate-limit', {
        body: { action: 'check' }
      });

      if (error || !data) {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error to prevent lockout
      }

      if (data.blocked && data.blockedUntil) {
        setState({
          isBlocked: true,
          blockedUntil: new Date(data.blockedUntil),
          remainingAttempts: 0,
          retryAfterSeconds: data.retryAfterSeconds || 0,
          warningMessage: data.message || null,
          requiresCaptcha: false,
          captchaAttemptsRemaining: null
        });
        return false;
      }

      setState(prev => ({
        ...prev,
        isBlocked: false,
        remainingAttempts: data.remainingAttempts ?? null,
        requiresCaptcha: data.requiresCaptcha ?? false,
        captchaAttemptsRemaining: data.captchaAttemptsRemaining ?? null
      }));

      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true;
    }
  }, []);

  const recordAttempt = useCallback(async (success: boolean, captchaSolved?: boolean): Promise<RateLimitResponse | null> => {
    try {
      const { data, error } = await supabase.functions.invoke<RateLimitResponse>('login-rate-limit', {
        body: { action: 'record_attempt', success, captchaSolved }
      });

      if (error) {
        console.error('Failed to record attempt:', error);
        return null;
      }

      if (data?.blocked && data.blockedUntil) {
        setState({
          isBlocked: true,
          blockedUntil: new Date(data.blockedUntil),
          remainingAttempts: 0,
          retryAfterSeconds: data.retryAfterSeconds || 0,
          warningMessage: data.message || null,
          requiresCaptcha: false,
          captchaAttemptsRemaining: null
        });
      } else if (data) {
        setState(prev => ({
          ...prev,
          isBlocked: false,
          remainingAttempts: data.remainingAttempts ?? null,
          warningMessage: data.message || null,
          requiresCaptcha: data.requiresCaptcha ?? false,
          captchaAttemptsRemaining: data.captchaAttemptsRemaining ?? null
        }));
      }

      return data || null;
    } catch (error) {
      console.error('Record attempt error:', error);
      return null;
    }
  }, []);

  const formatTimeRemaining = useCallback(() => {
    const seconds = state.retryAfterSeconds;
    if (seconds <= 0) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  }, [state.retryAfterSeconds]);

  const reset = useCallback(() => {
    setState({
      isBlocked: false,
      blockedUntil: null,
      remainingAttempts: null,
      retryAfterSeconds: 0,
      warningMessage: null,
      requiresCaptcha: false,
      captchaAttemptsRemaining: null
    });
  }, []);

  return {
    ...state,
    checkRateLimit,
    recordAttempt,
    formatTimeRemaining,
    reset
  };
}