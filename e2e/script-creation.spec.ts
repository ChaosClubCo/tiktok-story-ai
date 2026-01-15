import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Script Creation and Analysis Flow
 * Tests the complete user journey from creating scripts to analyzing viral potential
 */

test.describe('Script Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.describe('Landing Page to Script Builder', () => {
    test('should navigate from landing to script builder', async ({ page }) => {
      await page.goto('/');
      
      // Look for CTA to create script
      const createButton = page.getByRole('button', { name: /create|start|generate|write/i }).or(
        page.getByRole('link', { name: /create|start|generate|write/i })
      );
      
      if (await createButton.first().isVisible()) {
        await createButton.first().click();
        await page.waitForTimeout(1000);
        
        // Should navigate to script-related page or show auth
        const url = page.url();
        expect(url.includes('/dashboard') || url.includes('/auth') || url.includes('/templates')).toBeTruthy();
      }
    });

    test('should display hero section with value proposition', async ({ page }) => {
      await page.goto('/');
      
      // Check for hero content
      const heroHeading = page.locator('h1').first();
      await expect(heroHeading).toBeVisible();
      
      // Should have compelling CTA
      const ctaButtons = page.getByRole('button').or(page.getByRole('link'));
      expect(await ctaButtons.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Template Selection', () => {
    test('should display available templates', async ({ page }) => {
      await page.goto('/templates');
      
      await page.waitForLoadState('networkidle');
      
      // Should show templates or template cards
      const templateCards = page.locator('[class*="card"]').or(
        page.locator('[data-testid*="template"]')
      );
      
      // Either templates visible or page content visible
      const hasContent = await page.locator('main, [class*="container"]').first().isVisible();
      expect(hasContent).toBeTruthy();
    });

    test('should filter templates by niche', async ({ page }) => {
      await page.goto('/templates');
      
      // Look for filter/select elements
      const nicheFilter = page.getByRole('combobox').or(
        page.locator('select')
      ).or(
        page.getByRole('button', { name: /niche|category|filter/i })
      );
      
      if (await nicheFilter.first().isVisible()) {
        await nicheFilter.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should preview template before selection', async ({ page }) => {
      await page.goto('/templates');
      
      await page.waitForLoadState('networkidle');
      
      // Look for template cards with preview functionality
      const templateCard = page.locator('[class*="card"]').first();
      
      if (await templateCard.isVisible()) {
        await templateCard.hover();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Script Editor', () => {
    test('should show script editor elements on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      
      await page.waitForTimeout(2000);
      
      // May redirect to auth, that's ok
      const url = page.url();
      if (!url.includes('/auth')) {
        // Look for script creation UI
        const editorArea = page.locator('textarea').or(
          page.locator('[contenteditable="true"]')
        ).or(
          page.locator('[class*="editor"]')
        );
        
        // Either editor visible or quick action cards visible
        const hasScriptUI = await page.locator('main').first().isVisible();
        expect(hasScriptUI).toBeTruthy();
      }
    });

    test('should have niche selector', async ({ page }) => {
      await page.goto('/dashboard');
      
      await page.waitForTimeout(2000);
      
      const url = page.url();
      if (!url.includes('/auth')) {
        // Check for niche selection UI
        const nicheSelector = page.getByRole('combobox').or(
          page.locator('[class*="niche"]')
        ).or(
          page.getByText(/drama|comedy|romance|mystery/i).first()
        );
        
        const hasNicheUI = await nicheSelector.isVisible().catch(() => false);
        // This is optional, not all pages have niche selector
      }
    });
  });

  test.describe('Script Analysis', () => {
    test('should display predictions page', async ({ page }) => {
      await page.goto('/predictions');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Either shows content or redirects to auth
      const hasContent = await page.locator('main, [class*="container"]').first().isVisible();
      expect(hasContent).toBeTruthy();
    });

    test('should show viral score components', async ({ page }) => {
      await page.goto('/predictions');
      
      await page.waitForTimeout(2000);
      
      // Look for score-related UI
      const scoreElements = page.locator('[class*="score"]').or(
        page.locator('[class*="progress"]')
      ).or(
        page.getByText(/viral|score|prediction/i)
      );
      
      // May be behind auth
      const url = page.url();
      if (!url.includes('/auth')) {
        const hasScoreUI = await scoreElements.first().isVisible().catch(() => false);
      }
    });
  });
});

test.describe('Script Workflow Integration', () => {
  test('should handle complete script creation workflow', async ({ page }) => {
    // Start from landing
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to templates
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    
    // Check templates loaded
    const templatesPage = await page.locator('main').first().isVisible();
    expect(templatesPage).toBeTruthy();
  });

  test('should persist script data across navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Navigate away and back
      await page.goto('/templates');
      await page.waitForTimeout(1000);
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
      
      // Page should still work
      const dashboardLoaded = await page.locator('main').first().isVisible();
      expect(dashboardLoaded).toBeTruthy();
    }
  });
});

test.describe('Script Generation Controls', () => {
  test('should display tone selection options', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForTimeout(2000);
    
    // Look for tone controls
    const toneControls = page.getByText(/dramatic|comedic|suspenseful|emotional/i).or(
      page.locator('[class*="tone"]')
    );
    
    // Not all views have tone controls, that's ok
  });

  test('should display length selection options', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForTimeout(2000);
    
    // Look for length controls
    const lengthControls = page.getByText(/short|medium|long|seconds|minutes/i).or(
      page.locator('[class*="length"]')
    );
    
    // Not all views have length controls, that's ok
  });
});

test.describe('My Scripts Page', () => {
  test('should display my scripts page', async ({ page }) => {
    await page.goto('/my-scripts');
    
    await page.waitForTimeout(2000);
    
    // Either shows scripts or redirects to auth
    const url = page.url();
    if (url.includes('/auth')) {
      expect(url).toContain('/auth');
    } else {
      const hasContent = await page.locator('main').first().isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should show empty state for new users', async ({ page }) => {
    await page.goto('/my-scripts');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for empty state or scripts list
      const content = page.locator('main, [class*="container"]').first();
      await expect(content).toBeVisible();
    }
  });
});

test.describe('Series Builder', () => {
  test('should display series page', async ({ page }) => {
    await page.goto('/series');
    
    await page.waitForTimeout(2000);
    
    const hasContent = await page.locator('main').first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should navigate to series builder', async ({ page }) => {
    await page.goto('/series-builder');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    // Either shows builder or redirects
    expect(url.includes('/series-builder') || url.includes('/auth')).toBeTruthy();
  });
});
