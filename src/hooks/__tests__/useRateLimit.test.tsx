import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '../useRateLimit';

// Mock useSecurityMonitoring
vi.mock('../useSecurityMonitoring', () => ({
  useSecurityMonitoring: () => ({
    monitorRateLimit: vi.fn(),
  }),
}));

describe('useRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within the limit', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 5, windowMs: 60000 })
    );

    act(() => {
      const check1 = result.current.checkRateLimit();
      expect(check1.allowed).toBe(true);
      expect(check1.remaining).toBe(4);
    });

    act(() => {
      const check2 = result.current.checkRateLimit();
      expect(check2.allowed).toBe(true);
      expect(check2.remaining).toBe(3);
    });
  });

  it('should block requests after limit is reached', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 3, windowMs: 60000 })
    );

    act(() => {
      result.current.checkRateLimit(); // 1
      result.current.checkRateLimit(); // 2
      result.current.checkRateLimit(); // 3
    });

    act(() => {
      const check = result.current.checkRateLimit();
      expect(check.allowed).toBe(false);
      expect(check.remaining).toBe(0);
      expect(check.retryAfter).toBeDefined();
    });

    expect(result.current.isLimited).toBe(true);
  });

  it('should reset after window expires', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 2, windowMs: 10000 })
    );

    act(() => {
      result.current.checkRateLimit();
      result.current.checkRateLimit();
      const limited = result.current.checkRateLimit();
      expect(limited.allowed).toBe(false);
    });

    act(() => {
      vi.advanceTimersByTime(10001);
    });

    act(() => {
      const check = result.current.checkRateLimit();
      expect(check.allowed).toBe(true);
      expect(check.remaining).toBe(1);
    });
  });

  it('should track attempts correctly', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 5, windowMs: 60000 })
    );

    expect(result.current.attempts).toBe(0);

    act(() => {
      result.current.checkRateLimit();
    });

    expect(result.current.attempts).toBe(1);

    act(() => {
      result.current.checkRateLimit();
      result.current.checkRateLimit();
    });

    expect(result.current.attempts).toBe(3);
  });

  it('should return correct remaining time', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 3, windowMs: 10000 })
    );

    act(() => {
      result.current.checkRateLimit();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Remaining time should be approximately 5 seconds
    expect(result.current.remainingTime).toBeLessThanOrEqual(5);
    expect(result.current.remainingTime).toBeGreaterThan(0);
  });

  it('should calculate progress percentage', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 4, windowMs: 60000 })
    );

    expect(result.current.progressPercentage).toBe(0);

    act(() => {
      result.current.checkRateLimit();
    });

    expect(result.current.progressPercentage).toBe(25);

    act(() => {
      result.current.checkRateLimit();
    });

    expect(result.current.progressPercentage).toBe(50);
  });

  it('should use custom identifier', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 5, windowMs: 60000, identifier: 'custom-id' })
    );

    act(() => {
      const check = result.current.checkRateLimit();
      expect(check.allowed).toBe(true);
    });

    act(() => {
      const check = result.current.checkRateLimit('different-id');
      expect(check.allowed).toBe(true);
    });
  });

  it('should provide maxAttempts value', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 10, windowMs: 60000 })
    );

    expect(result.current.maxAttempts).toBe(10);
  });

  it('should return retryAfter when limited', () => {
    const { result } = renderHook(() =>
      useRateLimit({ maxAttempts: 1, windowMs: 30000 })
    );

    act(() => {
      result.current.checkRateLimit();
    });

    act(() => {
      const check = result.current.checkRateLimit();
      expect(check.allowed).toBe(false);
      expect(check.retryAfter).toBeDefined();
      expect(check.retryAfter).toBeLessThanOrEqual(30);
    });
  });

  it('should maintain state between renders', () => {
    const { result, rerender } = renderHook(() =>
      useRateLimit({ maxAttempts: 5, windowMs: 60000 })
    );

    act(() => {
      result.current.checkRateLimit();
      result.current.checkRateLimit();
    });

    rerender();

    expect(result.current.attempts).toBe(2);
  });
});
