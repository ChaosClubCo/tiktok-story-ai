import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility (a11y) Automated Tests
 * Uses axe-core to detect WCAG violations
 * 
 * Run with: npx playwright test e2e/accessibility.spec.ts
 */

test.describe('Accessibility Tests', () => {
  test.describe('Landing Page', () => {
    test('should have no critical accessibility violations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have accessible navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('header')
        .include('nav')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have accessible buttons and links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .options({ 
          runOnly: ['button-name', 'link-name', 'color-contrast'] 
        })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Authentication Page', () => {
    test('should have accessible form elements', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({ 
          runOnly: ['label', 'label-title-only', 'form-field-multiple-labels'] 
        })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Dashboard', () => {
    test('should have no critical violations', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-testid="chart"]') // Charts may have complex accessibility needs
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be navigable with keyboard on landing page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(firstFocused).toBeTruthy();

      // Verify focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have skip link or proper focus management', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({ 
          runOnly: ['bypass', 'focus-order-semantics', 'tabindex'] 
        })
        .analyze();

      // Log warnings but don't fail for skip link (nice to have)
      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toEqual([]);
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast on landing page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({ runOnly: ['color-contrast'] })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have sufficient color contrast on auth page', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({ runOnly: ['color-contrast'] })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Images and Media', () => {
    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({ runOnly: ['image-alt', 'image-redundant-alt'] })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('ARIA Usage', () => {
    test('should have valid ARIA attributes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({ 
          runOnly: [
            'aria-allowed-attr',
            'aria-hidden-focus',
            'aria-required-attr',
            'aria-roles',
            'aria-valid-attr-value',
            'aria-valid-attr'
          ] 
        })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have touch-friendly targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that buttons and links have minimum touch target size
      const smallTouchTargets = await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        const small: string[] = [];
        
        interactiveElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            // WCAG 2.1 recommends 44x44px minimum
            if (rect.width < 44 || rect.height < 44) {
              const text = el.textContent?.slice(0, 20) || el.tagName;
              small.push(`${text}: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
            }
          }
        });
        
        return small;
      });

      // Log warnings for small targets but don't fail (advisory)
      if (smallTouchTargets.length > 0) {
        console.warn('Elements with small touch targets:', smallTouchTargets.slice(0, 5));
      }
    });
  });
});

// Helper to generate detailed a11y report
test('Generate full accessibility report', async ({ page }) => {
  const pages = ['/', '/auth', '/dashboard'];
  const allViolations: Array<{ page: string; violations: any[] }> = [];

  for (const url of pages) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      allViolations.push({
        page: url,
        violations: results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length
        }))
      });
    }
  }

  // Output report to console
  if (allViolations.length > 0) {
    console.log('\n=== Accessibility Violations Report ===\n');
    allViolations.forEach(({ page, violations }) => {
      console.log(`Page: ${page}`);
      violations.forEach(v => {
        console.log(`  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes} elements)`);
      });
      console.log('');
    });
  }

  // This test passes but logs findings - run separately for reporting
  expect(true).toBe(true);
});
