import { useState, useCallback, useRef } from 'react';
import { useSecurityMonitoring } from './useSecurityMonitoring';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitState {
  attempts: number;
  resetTime: number;
  isLimited: boolean;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { monitorRateLimit } = useSecurityMonitoring();
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    resetTime: Date.now() + config.windowMs,
    isLimited: false
  });
  
  const stateRef = useRef(state);
  stateRef.current = state;

  const checkRateLimit = useCallback((identifier = config.identifier || 'default') => {
    const now = Date.now();
    const currentState = stateRef.current;

    // Reset if window has expired
    if (now > currentState.resetTime) {
      const newState = {
        attempts: 1,
        resetTime: now + config.windowMs,
        isLimited: false
      };
      setState(newState);
      stateRef.current = newState;
      return { allowed: true, remaining: config.maxAttempts - 1, resetTime: newState.resetTime };
    }

    // Check if rate limited
    if (currentState.attempts >= config.maxAttempts) {
      if (!currentState.isLimited) {
        monitorRateLimit(identifier, currentState.attempts);
      }
      
      const newState = { ...currentState, isLimited: true };
      setState(newState);
      stateRef.current = newState;
      
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: currentState.resetTime,
        retryAfter: Math.ceil((currentState.resetTime - now) / 1000)
      };
    }

    // Increment attempts
    const newState = {
      ...currentState,
      attempts: currentState.attempts + 1,
      isLimited: false
    };
    setState(newState);
    stateRef.current = newState;

    return { 
      allowed: true, 
      remaining: config.maxAttempts - newState.attempts, 
      resetTime: currentState.resetTime 
    };
  }, [config, monitorRateLimit]);

  const getRemainingTime = useCallback(() => {
    const now = Date.now();
    return Math.max(0, Math.ceil((stateRef.current.resetTime - now) / 1000));
  }, []);

  const getProgressPercentage = useCallback(() => {
    return (stateRef.current.attempts / config.maxAttempts) * 100;
  }, [config.maxAttempts]);

  return {
    checkRateLimit,
    isLimited: state.isLimited,
    attempts: state.attempts,
    maxAttempts: config.maxAttempts,
    remainingTime: getRemainingTime(),
    progressPercentage: getProgressPercentage()
  };
};