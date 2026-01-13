import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Mock the web-vitals library
vi.mock('web-vitals', () => ({
  onLCP: vi.fn(),
  onINP: vi.fn(),
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onTTFB: vi.fn(),
}));

// Mock analytics
vi.mock('../analytics', () => ({
  analytics: {
    track: vi.fn(),
  },
}));

describe('webVitals', () => {
  let onLCP: Mock;
  let onINP: Mock;
  let onCLS: Mock;
  let onFCP: Mock;
  let onTTFB: Mock;
  let analyticsTrack: Mock;

  beforeEach(async () => {
    vi.resetModules();
    
    // Get mocked functions
    const webVitals = await import('web-vitals');
    onLCP = webVitals.onLCP as Mock;
    onINP = webVitals.onINP as Mock;
    onCLS = webVitals.onCLS as Mock;
    onFCP = webVitals.onFCP as Mock;
    onTTFB = webVitals.onTTFB as Mock;
    
    const analyticsModule = await import('../analytics');
    analyticsTrack = analyticsModule.analytics.track as Mock;
    
    // Clear mock calls
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initWebVitals', () => {
    it('should register all web vital handlers', async () => {
      const { initWebVitals } = await import('../webVitals');
      
      initWebVitals();

      expect(onLCP).toHaveBeenCalled();
      expect(onINP).toHaveBeenCalled();
      expect(onCLS).toHaveBeenCalled();
      expect(onFCP).toHaveBeenCalled();
      expect(onTTFB).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      onLCP.mockImplementation(() => {
        throw new Error('Mock error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { initWebVitals } = await import('../webVitals');
      
      // Should not throw
      expect(() => initWebVitals()).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getWebVitals', () => {
    it('should return empty map initially', async () => {
      const { getWebVitals } = await import('../webVitals');
      
      const vitals = getWebVitals();
      
      expect(vitals).toBeInstanceOf(Map);
      expect(vitals.size).toBe(0);
    });

    it('should return stored metrics after initialization', async () => {
      const { initWebVitals, getWebVitals } = await import('../webVitals');
      
      initWebVitals();
      
      // Simulate LCP callback
      const lcpCallback = onLCP.mock.calls[0][0];
      lcpCallback({
        name: 'LCP',
        value: 2000,
        delta: 2000,
        id: 'test-lcp',
        navigationType: 'navigate',
      });

      const vitals = getWebVitals();
      expect(vitals.has('LCP')).toBe(true);
      expect(vitals.get('LCP')?.value).toBe(2000);
      expect(vitals.get('LCP')?.rating).toBe('good');
    });
  });

  describe('getPerformanceScore', () => {
    it('should return 100 when no metrics are recorded', async () => {
      const { getPerformanceScore } = await import('../webVitals');
      
      const score = getPerformanceScore();
      
      expect(score).toBe(100);
    });

    it('should calculate score based on ratings', async () => {
      const { initWebVitals, getPerformanceScore } = await import('../webVitals');
      
      initWebVitals();
      
      // Simulate metrics with different ratings
      const lcpCallback = onLCP.mock.calls[0][0];
      lcpCallback({
        name: 'LCP',
        value: 5000, // Poor
        delta: 5000,
        id: 'test-lcp',
        navigationType: 'navigate',
      });

      const inpCallback = onINP.mock.calls[0][0];
      inpCallback({
        name: 'INP',
        value: 100, // Good
        delta: 100,
        id: 'test-inp',
        navigationType: 'navigate',
      });

      const clsCallback = onCLS.mock.calls[0][0];
      clsCallback({
        name: 'CLS',
        value: 0.15, // Needs improvement
        delta: 0.15,
        id: 'test-cls',
        navigationType: 'navigate',
      });

      const score = getPerformanceScore();
      // 100 - 30 (poor LCP) - 0 (good INP) - 10 (needs-improvement CLS) = 60
      expect(score).toBe(60);
    });

    it('should not go below 0', async () => {
      const { initWebVitals, getPerformanceScore } = await import('../webVitals');
      
      initWebVitals();
      
      // All poor ratings
      const lcpCallback = onLCP.mock.calls[0][0];
      lcpCallback({ name: 'LCP', value: 10000, delta: 10000, id: 'test', navigationType: 'navigate' });

      const inpCallback = onINP.mock.calls[0][0];
      inpCallback({ name: 'INP', value: 1000, delta: 1000, id: 'test', navigationType: 'navigate' });

      const clsCallback = onCLS.mock.calls[0][0];
      clsCallback({ name: 'CLS', value: 1, delta: 1, id: 'test', navigationType: 'navigate' });

      const score = getPerformanceScore();
      expect(score).toBe(20);
    });
  });

  describe('metric reporting', () => {
    it('should report metrics to analytics', async () => {
      const { initWebVitals } = await import('../webVitals');
      
      initWebVitals();
      
      const lcpCallback = onLCP.mock.calls[0][0];
      lcpCallback({
        name: 'LCP',
        value: 2000,
        delta: 2000,
        id: 'test-lcp',
        navigationType: 'navigate',
      });

      expect(analyticsTrack).toHaveBeenCalledWith('web_vital', expect.objectContaining({
        metric_name: 'LCP',
        metric_rating: 'good',
      }));
    });

    it('should rate LCP correctly', async () => {
      const { initWebVitals, getWebVitals } = await import('../webVitals');
      
      initWebVitals();
      const lcpCallback = onLCP.mock.calls[0][0];

      // Good LCP (< 2500ms)
      lcpCallback({ name: 'LCP', value: 2000, delta: 2000, id: '1', navigationType: 'navigate' });
      expect(getWebVitals().get('LCP')?.rating).toBe('good');

      // Needs improvement LCP (2500-4000ms)
      lcpCallback({ name: 'LCP', value: 3000, delta: 3000, id: '2', navigationType: 'navigate' });
      expect(getWebVitals().get('LCP')?.rating).toBe('needs-improvement');

      // Poor LCP (> 4000ms)
      lcpCallback({ name: 'LCP', value: 5000, delta: 5000, id: '3', navigationType: 'navigate' });
      expect(getWebVitals().get('LCP')?.rating).toBe('poor');
    });

    it('should rate CLS correctly', async () => {
      const { initWebVitals, getWebVitals } = await import('../webVitals');
      
      initWebVitals();
      const clsCallback = onCLS.mock.calls[0][0];

      // Good CLS (< 0.1)
      clsCallback({ name: 'CLS', value: 0.05, delta: 0.05, id: '1', navigationType: 'navigate' });
      expect(getWebVitals().get('CLS')?.rating).toBe('good');

      // Needs improvement CLS (0.1-0.25)
      clsCallback({ name: 'CLS', value: 0.15, delta: 0.15, id: '2', navigationType: 'navigate' });
      expect(getWebVitals().get('CLS')?.rating).toBe('needs-improvement');

      // Poor CLS (> 0.25)
      clsCallback({ name: 'CLS', value: 0.5, delta: 0.5, id: '3', navigationType: 'navigate' });
      expect(getWebVitals().get('CLS')?.rating).toBe('poor');
    });
  });

  describe('markPerformance', () => {
    it('should handle missing performance API gracefully', async () => {
      const { markPerformance } = await import('../webVitals');
      
      // Should not throw
      expect(() => markPerformance('test-mark')).not.toThrow();
    });
  });
});
