import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { GuestModeProvider, useGuestMode, isFeatureAvailableForGuest, GUEST_FEATURES } from '../useGuestMode';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GuestModeProvider>{children}</GuestModeProvider>
);

describe('useGuestMode', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useGuestMode());
    }).toThrow('useGuestMode must be used within a GuestModeProvider');
  });

  it('should start in non-guest mode', () => {
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    expect(result.current.isGuest).toBe(false);
    expect(result.current.guestId).toBeNull();
    expect(result.current.guestStartTime).toBeNull();
  });

  it('should enter guest mode', () => {
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    act(() => {
      result.current.enterGuestMode();
    });
    
    expect(result.current.isGuest).toBe(true);
    expect(result.current.guestId).toMatch(/^guest_\d+_[a-z0-9]+$/);
    expect(result.current.guestStartTime).toBeInstanceOf(Date);
  });

  it('should exit guest mode', () => {
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    act(() => {
      result.current.enterGuestMode();
    });
    
    expect(result.current.isGuest).toBe(true);
    
    act(() => {
      result.current.exitGuestMode();
    });
    
    expect(result.current.isGuest).toBe(false);
    expect(result.current.guestId).toBeNull();
  });

  it('should persist guest session in localStorage', () => {
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    act(() => {
      result.current.enterGuestMode();
    });
    
    const stored = localStorage.getItem('minidrama_guest_session');
    expect(stored).not.toBeNull();
    
    const session = JSON.parse(stored!);
    expect(session.guestId).toBeDefined();
    expect(session.startTime).toBeDefined();
  });

  it('should restore guest session from localStorage', () => {
    const session = {
      guestId: 'guest_12345_abc',
      startTime: new Date().toISOString(),
    };
    localStorage.setItem('minidrama_guest_session', JSON.stringify(session));
    
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    expect(result.current.isGuest).toBe(true);
    expect(result.current.guestId).toBe('guest_12345_abc');
  });

  it('should not restore expired session (>24 hours)', () => {
    const expiredTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    const session = {
      guestId: 'guest_old_session',
      startTime: expiredTime.toISOString(),
    };
    localStorage.setItem('minidrama_guest_session', JSON.stringify(session));
    
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    expect(result.current.isGuest).toBe(false);
    expect(result.current.guestId).toBeNull();
    expect(localStorage.getItem('minidrama_guest_session')).toBeNull();
  });

  it('should clear localStorage on exit', () => {
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    act(() => {
      result.current.enterGuestMode();
    });
    
    expect(localStorage.getItem('minidrama_guest_session')).not.toBeNull();
    
    act(() => {
      result.current.exitGuestMode();
    });
    
    expect(localStorage.getItem('minidrama_guest_session')).toBeNull();
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('minidrama_guest_session', 'invalid-json');
    
    const { result } = renderHook(() => useGuestMode(), { wrapper });
    
    expect(result.current.isGuest).toBe(false);
    expect(localStorage.getItem('minidrama_guest_session')).toBeNull();
  });
});

describe('isFeatureAvailableForGuest', () => {
  it('should allow view features for guests', () => {
    expect(isFeatureAvailableForGuest('viewTemplates')).toBe(true);
    expect(isFeatureAvailableForGuest('viewDashboard')).toBe(true);
    expect(isFeatureAvailableForGuest('viewSeries')).toBe(true);
  });

  it('should block premium features for guests', () => {
    expect(isFeatureAvailableForGuest('saveScripts')).toBe(false);
    expect(isFeatureAvailableForGuest('exportScripts')).toBe(false);
    expect(isFeatureAvailableForGuest('accessSettings')).toBe(false);
    expect(isFeatureAvailableForGuest('createSeries')).toBe(false);
    expect(isFeatureAvailableForGuest('viewAnalytics')).toBe(false);
    expect(isFeatureAvailableForGuest('collaborateWithOthers')).toBe(false);
  });

  it('should allow limited features for guests', () => {
    expect(isFeatureAvailableForGuest('generateScriptPreview')).toBe(true);
  });
});

describe('GUEST_FEATURES', () => {
  it('should have all expected features defined', () => {
    const expectedFeatures = [
      'viewTemplates',
      'viewDashboard',
      'generateScriptPreview',
      'viewSeries',
      'saveScripts',
      'exportScripts',
      'useAIFeatures',
      'accessSettings',
      'createSeries',
      'viewAnalytics',
      'collaborateWithOthers',
    ];

    expectedFeatures.forEach((feature) => {
      expect(GUEST_FEATURES).toHaveProperty(feature);
    });
  });

  it('should have boolean values for all features', () => {
    Object.values(GUEST_FEATURES).forEach((value) => {
      expect(typeof value).toBe('boolean');
    });
  });
});
