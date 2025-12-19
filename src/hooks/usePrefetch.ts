import { useCallback, useRef } from 'react';

// Map of route paths to their dynamic import functions
const routeImports: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/analytics': () => import('@/pages/Analytics'),
  '/templates': () => import('@/pages/Templates'),
  '/my-scripts': () => import('@/pages/MyScripts'),
  '/collaborate': () => import('@/pages/Collaborate'),
  '/predictions': () => import('@/pages/Predictions'),
  '/series': () => import('@/pages/Series'),
  '/series/builder': () => import('@/pages/SeriesBuilder'),
  '/video-generator': () => import('@/pages/VideoGenerator'),
  '/ab-tests': () => import('@/pages/ABTests'),
  '/install': () => import('@/pages/Install'),
  '/admin': () => import('@/pages/admin/AdminLayout'),
  '/admin/users': () => import('@/pages/admin/UsersPage'),
  '/admin/content': () => import('@/pages/admin/ContentPage'),
  '/admin/security': () => import('@/pages/admin/SecurityPage'),
};

// Cache of prefetched routes to avoid duplicate imports
const prefetchedRoutes = new Set<string>();

/**
 * Hook for prefetching lazy-loaded route components.
 * Provides utilities to preload routes on hover or programmatically.
 */
export function usePrefetch() {
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Prefetch a specific route's component.
   * Uses a small delay to avoid unnecessary prefetches from quick mouse movements.
   */
  const prefetch = useCallback((path: string, delay = 100) => {
    // Clear any pending prefetch
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Check if already prefetched
    if (prefetchedRoutes.has(path)) {
      return;
    }

    // Find matching route (handle dynamic routes)
    const routePath = Object.keys(routeImports).find((route) => {
      if (route === path) return true;
      // Handle routes with parameters (e.g., /video-editor/:id)
      if (path.startsWith(route.replace(/:[^/]+/g, ''))) return true;
      return false;
    });

    if (!routePath || !routeImports[routePath]) {
      return;
    }

    // Delay prefetch to avoid unnecessary loads
    prefetchTimeoutRef.current = setTimeout(() => {
      routeImports[routePath]()
        .then(() => {
          prefetchedRoutes.add(path);
          console.debug(`[Prefetch] Loaded: ${path}`);
        })
        .catch((err) => {
          console.warn(`[Prefetch] Failed to load: ${path}`, err);
        });
    }, delay);
  }, []);

  /**
   * Cancel pending prefetch (useful for mouseLeave).
   */
  const cancelPrefetch = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  /**
   * Event handlers for use with links.
   */
  const getPrefetchHandlers = useCallback((path: string) => ({
    onMouseEnter: () => prefetch(path),
    onMouseLeave: () => cancelPrefetch(),
    onFocus: () => prefetch(path),
    onBlur: () => cancelPrefetch(),
  }), [prefetch, cancelPrefetch]);

  /**
   * Prefetch multiple routes at once (e.g., on page load).
   */
  const prefetchMany = useCallback((paths: string[]) => {
    paths.forEach((path) => prefetch(path, 0));
  }, [prefetch]);

  return {
    prefetch,
    cancelPrefetch,
    getPrefetchHandlers,
    prefetchMany,
    isPrefetched: (path: string) => prefetchedRoutes.has(path),
  };
}

export default usePrefetch;
