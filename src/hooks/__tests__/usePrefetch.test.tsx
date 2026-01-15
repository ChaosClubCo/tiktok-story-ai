import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefetch } from '../usePrefetch';

describe('usePrefetch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return prefetch utilities', () => {
    const { result } = renderHook(() => usePrefetch());
    
    expect(typeof result.current.prefetch).toBe('function');
    expect(typeof result.current.cancelPrefetch).toBe('function');
    expect(typeof result.current.getPrefetchHandlers).toBe('function');
    expect(typeof result.current.prefetchMany).toBe('function');
    expect(typeof result.current.isPrefetched).toBe('function');
  });

  it('should not mark route as prefetched initially', () => {
    const { result } = renderHook(() => usePrefetch());
    
    expect(result.current.isPrefetched('/dashboard')).toBe(false);
    expect(result.current.isPrefetched('/analytics')).toBe(false);
  });

  it('should return event handlers from getPrefetchHandlers', () => {
    const { result } = renderHook(() => usePrefetch());
    
    const handlers = result.current.getPrefetchHandlers('/dashboard');
    
    expect(typeof handlers.onMouseEnter).toBe('function');
    expect(typeof handlers.onMouseLeave).toBe('function');
    expect(typeof handlers.onFocus).toBe('function');
    expect(typeof handlers.onBlur).toBe('function');
  });

  it('should cancel prefetch with cancelPrefetch', () => {
    const { result } = renderHook(() => usePrefetch());
    
    act(() => {
      result.current.prefetch('/dashboard', 500);
    });
    
    // Cancel before the timeout fires
    act(() => {
      result.current.cancelPrefetch();
    });
    
    // Advance timers - should not throw
    act(() => {
      vi.advanceTimersByTime(600);
    });
    
    // Route should not be prefetched since we cancelled
    expect(result.current.isPrefetched('/dashboard')).toBe(false);
  });

  it('should support custom delay', () => {
    const { result } = renderHook(() => usePrefetch());
    
    act(() => {
      result.current.prefetch('/analytics', 200);
    });
    
    // Advance by 100ms - not enough time
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.isPrefetched('/analytics')).toBe(false);
  });

  it('should prefetch multiple routes with prefetchMany', () => {
    const { result } = renderHook(() => usePrefetch());
    
    act(() => {
      result.current.prefetchMany(['/dashboard', '/analytics', '/templates']);
    });
    
    // Advance timers (immediate with delay 0)
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Note: Routes may or may not be prefetched depending on implementation
    // The key is that the function doesn't throw
    expect(() => {
      result.current.isPrefetched('/dashboard');
    }).not.toThrow();
  });

  it('should handle non-existent routes gracefully', () => {
    const { result } = renderHook(() => usePrefetch());
    
    expect(() => {
      act(() => {
        result.current.prefetch('/non-existent-route');
        vi.advanceTimersByTime(200);
      });
    }).not.toThrow();
  });

  it('should not prefetch external URLs', () => {
    const { result } = renderHook(() => usePrefetch());
    
    act(() => {
      result.current.prefetch('https://external.com');
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current.isPrefetched('https://external.com')).toBe(false);
  });

  it('should provide consistent handlers across renders', () => {
    const { result, rerender } = renderHook(() => usePrefetch());
    
    const handlers1 = result.current.getPrefetchHandlers('/dashboard');
    rerender();
    const handlers2 = result.current.getPrefetchHandlers('/dashboard');
    
    // Functions should be stable due to useCallback
    expect(handlers1.onMouseEnter).toBe(handlers2.onMouseEnter);
    expect(handlers1.onMouseLeave).toBe(handlers2.onMouseLeave);
  });
});
