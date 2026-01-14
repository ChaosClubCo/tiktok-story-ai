import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * Captures screenshots of critical UI pages to detect unintended changes
 * 
 * Run with: npx playwright test e2e/visual-regression.spec.ts
 * Update snapshots: npx playwright test e2e/visual-regression.spec.ts --update-snapshots
 */

test.describe('Visual Regression Tests', () => {
  test.describe('Landing Page', () => {
    test('homepage hero section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for animations to complete
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('landing-hero.png', {
        fullPage: false,
        mask: [page.locator('[data-testid="dynamic-content"]')],
        maxDiffPixelRatio: 0.02
      });
    });

    test('homepage full page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('landing-full.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02
      });
    });
  });

  test.describe('Authentication Page', () => {
    test('login form', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('auth-login.png', {
        maxDiffPixelRatio: 0.02
      });
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to dashboard (will redirect to auth if not logged in)
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    });

    test('dashboard layout', async ({ page }) => {
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('dashboard-layout.png', {
        fullPage: false,
        maxDiffPixelRatio: 0.02
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile viewport - landing page', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('mobile-landing.png', {
        fullPage: false,
        maxDiffPixelRatio: 0.03
      });
    });

    test('tablet viewport - landing page', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('tablet-landing.png', {
        fullPage: false,
        maxDiffPixelRatio: 0.03
      });
    });
  });

  test.describe('Component Snapshots', () => {
    test('navigation header', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const header = page.locator('header').first();
      await expect(header).toHaveScreenshot('header-component.png', {
        maxDiffPixelRatio: 0.02
      });
    });

    test('feature cards', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Scroll to feature section if exists
      const featureSection = page.locator('[data-testid="features"], section:has-text("Features")').first();
      if (await featureSection.isVisible()) {
        await featureSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        
        await expect(featureSection).toHaveScreenshot('features-section.png', {
          maxDiffPixelRatio: 0.02
        });
      }
    });
  });

  test.describe('Error States', () => {
    test('404 page', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('404-page.png', {
        maxDiffPixelRatio: 0.02
      });
    });
  });

  test.describe('Dark/Light Theme', () => {
    test('landing page - system preference dark', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('landing-dark-theme.png', {
        fullPage: false,
        maxDiffPixelRatio: 0.02
      });
    });

    test('landing page - system preference light', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('landing-light-theme.png', {
        fullPage: false,
        maxDiffPixelRatio: 0.02
      });
    });
  });
});
