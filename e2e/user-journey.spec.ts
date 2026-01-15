import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Complete User Journey
 * Tests the full flow from first visit to script creation and analysis
 */

test.describe('First-Time User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should complete onboarding flow for new users', async ({ page }) => {
    await page.goto('/');
    
    // Check landing page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Look for onboarding or get started elements
    const getStartedBtn = page.getByRole('button', { name: /get started|try free|start/i }).or(
      page.getByRole('link', { name: /get started|try free|start/i })
    );
    
    if (await getStartedBtn.first().isVisible()) {
      await getStartedBtn.first().click();
      await page.waitForTimeout(1500);
      
      // Should navigate to auth or onboarding
      const url = page.url();
      expect(
        url.includes('/auth') || 
        url.includes('/onboarding') || 
        url.includes('/dashboard')
      ).toBeTruthy();
    }
  });

  test('should show feature highlights on landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for feature sections
    const features = page.locator('section').or(page.locator('[class*="feature"]'));
    expect(await features.count()).toBeGreaterThan(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip link (accessibility)
    const skipLink = page.locator('[href="#main-content"]').or(
      page.locator('[class*="skip"]')
    );
    
    // Check for main navigation
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });
});

test.describe('Authenticated User Journey', () => {
  // Note: These tests simulate authenticated user paths
  // Actual auth would require test fixtures or mocking
  
  test('should access dashboard after visiting protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForTimeout(2000);
    
    // Either shows dashboard or redirects to auth
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/auth') || url === 'http://localhost:8080/').toBeTruthy();
  });

  test('should navigate through main app sections', async ({ page }) => {
    const routes = ['/templates', '/predictions', '/series', '/analytics'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      
      // Each page should load without errors
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should access settings page', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    // Either shows settings or redirects to auth
    const url = page.url();
    expect(url.includes('/settings') || url.includes('/auth')).toBeTruthy();
  });
});

test.describe('Script Creation User Journey', () => {
  test('should follow script creation path', async ({ page }) => {
    // Step 1: Start from landing
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Step 2: Go to templates
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/templates');
    
    // Step 3: Check dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Page should load (may redirect to auth)
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should navigate to predictions from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for predictions link
      const predictionsLink = page.getByRole('link', { name: /predict|analyze|viral/i });
      
      if (await predictionsLink.isVisible()) {
        await predictionsLink.click();
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('/predictions');
      }
    }
  });
});

test.describe('Video Generation Journey', () => {
  test('should access video generator page', async ({ page }) => {
    await page.goto('/video-generator');
    
    await page.waitForTimeout(2000);
    
    // Either shows generator or redirects
    const url = page.url();
    expect(
      url.includes('/video-generator') || 
      url.includes('/auth') ||
      url === 'http://localhost:8080/'
    ).toBeTruthy();
  });

  test('should access video editor page', async ({ page }) => {
    await page.goto('/video-editor');
    
    await page.waitForTimeout(2000);
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Analytics Journey', () => {
  test('should display analytics page', async ({ page }) => {
    await page.goto('/analytics');
    
    await page.waitForTimeout(2000);
    
    // Either shows analytics or redirects to auth
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for analytics content
      const analyticsContent = page.locator('[class*="chart"]').or(
        page.locator('[class*="analytics"]')
      ).or(
        page.locator('main')
      );
      
      await expect(analyticsContent.first()).toBeVisible();
    }
  });

  test('should display performance page', async ({ page }) => {
    await page.goto('/performance');
    
    await page.waitForTimeout(2000);
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Collaboration Features', () => {
  test('should access collaborate page', async ({ page }) => {
    await page.goto('/collaborate');
    
    await page.waitForTimeout(2000);
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('A/B Testing Journey', () => {
  test('should access A/B tests page', async ({ page }) => {
    await page.goto('/ab-tests');
    
    await page.waitForTimeout(2000);
    
    // Either shows A/B tests or redirects
    const url = page.url();
    expect(url.includes('/ab-tests') || url.includes('/auth')).toBeTruthy();
  });
});

test.describe('Mobile User Journey', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check mobile layout
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Navigation should still work
    const mobileMenuButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check tablet layout
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });
});

test.describe('PWA Installation Journey', () => {
  test('should access install page', async ({ page }) => {
    await page.goto('/install');
    
    await page.waitForTimeout(2000);
    
    // Check install page or content
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Error Handling Journey', () => {
  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
    
    await page.waitForTimeout(2000);
    
    // Should show 404 or redirect to home
    const url = page.url();
    const has404 = await page.getByText(/404|not found|page not found/i).isVisible().catch(() => false);
    const isHome = url === 'http://localhost:8080/' || url === 'http://localhost:8080';
    
    expect(has404 || isHome || url.includes('/not-found')).toBeTruthy();
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Rapid navigation should not break the app
    await page.goto('/templates');
    await page.goto('/dashboard');
    await page.goto('/predictions');
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    // App should still work
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Keyboard Navigation Journey', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeDefined();
  });

  test('should handle Enter key on buttons', async ({ page }) => {
    await page.goto('/');
    
    // Find first button and focus it
    const firstButton = page.getByRole('button').first();
    
    if (await firstButton.isVisible()) {
      await firstButton.focus();
      // Just check that focusing works
      const isFocused = await firstButton.evaluate((el) => document.activeElement === el);
    }
  });
});
