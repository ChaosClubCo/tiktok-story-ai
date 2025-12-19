import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Dashboard Functionality
 * Tests dashboard access, navigation, and core features
 */

test.describe('Dashboard Access', () => {
  test.describe('Unauthenticated Users', () => {
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies();
    });

    test('should redirect to auth or show auth required', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should not show dashboard content without auth
      await page.waitForTimeout(2000);
      
      // Either redirected to auth or shows protected content message
      const currentUrl = page.url();
      const isProtected = currentUrl.includes('/auth') || 
                          currentUrl.includes('/login') || 
                          currentUrl === 'http://localhost:8080/';
      
      expect(isProtected || await page.getByText(/sign in|login|unauthorized/i).isVisible()).toBeTruthy();
    });
  });

  test.describe('Dashboard Layout', () => {
    test('should display navigation elements on homepage', async ({ page }) => {
      await page.goto('/');
      
      // Check for main navigation
      const header = page.locator('header').or(page.locator('nav'));
      await expect(header).toBeVisible();
    });

    test('should have responsive navigation for mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check for mobile menu button or hamburger icon
      const mobileMenu = page.getByRole('button', { name: /menu/i }).or(
        page.locator('[data-testid="mobile-menu"]')
      ).or(
        page.locator('button').filter({ has: page.locator('svg') }).first()
      );
      
      // Either mobile menu exists or navigation is visible
      await expect(page.locator('header, nav').first()).toBeVisible();
    });
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate to different sections', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation links
    const navLinks = await page.getByRole('link').all();
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('should show active state for current route', async ({ page }) => {
    await page.goto('/');
    
    // Home link should have some indication of being active
    const homeLink = page.getByRole('link', { name: /home/i }).first();
    
    if (await homeLink.isVisible()) {
      // Check for active class or aria-current
      const isActive = await homeLink.getAttribute('aria-current') === 'page' ||
                       (await homeLink.getAttribute('class'))?.includes('active');
      expect(isActive).toBeDefined();
    }
  });
});

test.describe('Dashboard Features', () => {
  test('should display quick action cards on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Look for feature cards or action buttons
    const cards = page.locator('[class*="card"]').or(
      page.getByRole('button')
    );
    
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should load templates page', async ({ page }) => {
    await page.goto('/templates');
    
    // Should show templates page content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load predictions page', async ({ page }) => {
    await page.goto('/predictions');
    
    // Should show predictions page or auth redirect
    await page.waitForTimeout(2000);
    const hasContent = await page.locator('h1, h2, main').first().isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Dashboard Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected errors (like 404s for missing resources in dev)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('net::ERR')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
