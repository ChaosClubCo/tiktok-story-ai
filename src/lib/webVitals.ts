import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { analytics } from './analytics';

/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals metrics and reports them to analytics
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Interactivity (replaces FID)
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render speed
 * - TTFB (Time to First Byte): Server response time
 */

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Thresholds for each metric (in milliseconds where applicable)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

// Get rating based on thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Report metric to analytics
function reportMetric(metric: Metric) {
  const vitalsData: WebVitalsMetric = {
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: getRating(metric.name, metric.value),
    delta: Math.round(metric.delta),
    id: metric.id,
    navigationType: metric.navigationType || 'unknown',
  };

  // Log in development
  if (import.meta.env.DEV) {
    const color = vitalsData.rating === 'good' ? '🟢' : vitalsData.rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`${color} Web Vital: ${vitalsData.name}`, {
      value: vitalsData.value,
      rating: vitalsData.rating,
    });
  }

  // Send to analytics
  analytics.track('web_vital', {
    metric_name: vitalsData.name,
    metric_value: vitalsData.value,
    metric_rating: vitalsData.rating,
    metric_delta: vitalsData.delta,
    navigation_type: vitalsData.navigationType,
    page_url: window.location.pathname,
  });
}

// Store metrics for later access
const metricsStore: Map<string, WebVitalsMetric> = new Map();

function storeAndReportMetric(metric: Metric) {
  const data: WebVitalsMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'unknown',
  };
  
  metricsStore.set(metric.name, data);
  reportMetric(metric);
}

/**
 * Initialize Web Vitals monitoring
 * Call this once when the app loads
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // Core Web Vitals
    onLCP(storeAndReportMetric);
    onINP(storeAndReportMetric); // INP replaces FID as of March 2024
    onCLS(storeAndReportMetric);
    
    // Additional metrics
    onFCP(storeAndReportMetric);
    onTTFB(storeAndReportMetric);
    
    if (import.meta.env.DEV) {
      console.log('📊 Web Vitals monitoring initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Get current Web Vitals metrics
 */
export function getWebVitals(): Map<string, WebVitalsMetric> {
  return new Map(metricsStore);
}

/**
 * Get performance score (0-100) based on Core Web Vitals
 */
export function getPerformanceScore(): number {
  const lcp = metricsStore.get('LCP');
  const inp = metricsStore.get('INP');
  const cls = metricsStore.get('CLS');
  
  let score = 100;
  
  if (lcp) {
    if (lcp.rating === 'needs-improvement') score -= 15;
    else if (lcp.rating === 'poor') score -= 30;
  }
  
  if (inp) {
    if (inp.rating === 'needs-improvement') score -= 15;
    else if (inp.rating === 'poor') score -= 30;
  }
  
  if (cls) {
    if (cls.rating === 'needs-improvement') score -= 10;
    else if (cls.rating === 'poor') score -= 20;
  }
  
  return Math.max(0, score);
}

/**
 * Report custom performance mark
 */
export function markPerformance(name: string, startMark?: string) {
  if (typeof window === 'undefined' || !window.performance) return;
  
  try {
    if (startMark) {
      performance.measure(name, startMark);
      const entries = performance.getEntriesByName(name, 'measure');
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        analytics.track('performance_measure', {
          name,
          duration: Math.round(lastEntry.duration),
          page_url: window.location.pathname,
        });
      }
    } else {
      performance.mark(name);
    }
  } catch (error) {
    // Silently fail - performance API might not be available
  }
}
