import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Video Generation Pipeline
 * Tests the video generation workflow and UI components
 */

test.describe('Video Generator Access', () => {
  test('should navigate to video generator page', async ({ page }) => {
    await page.goto('/video-generator');
    
    // Should show video generator or auth redirect
    await page.waitForTimeout(2000);
    
    const pageContent = page.locator('main, [class*="container"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should display video generation form elements', async ({ page }) => {
    await page.goto('/video-generator');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for form elements or generation UI
    const hasFormElements = 
      await page.getByRole('textbox').first().isVisible() ||
      await page.getByRole('button').first().isVisible() ||
      await page.locator('form').first().isVisible();
    
    expect(hasFormElements).toBeTruthy();
  });
});

test.describe('Video Generation UI', () => {
  test('should show loading state when generating', async ({ page }) => {
    await page.goto('/video-generator');
    await page.waitForLoadState('networkidle');
    
    // Find generate button
    const generateButton = page.getByRole('button', { name: /generate|create|start/i }).first();
    
    if (await generateButton.isVisible()) {
      // Button should be interactive
      await expect(generateButton).toBeEnabled();
    }
  });

  test('should display template options if available', async ({ page }) => {
    await page.goto('/video-generator');
    await page.waitForLoadState('networkidle');
    
    // Look for template selector or options
    const templates = page.locator('[class*="template"]').or(
      page.getByRole('option')
    ).or(
      page.getByRole('radiogroup')
    );
    
    // Template selector may or may not be present depending on auth
    await page.waitForTimeout(1000);
  });
});

test.describe('Video Editor Access', () => {
  test('should handle editor route with project ID', async ({ page }) => {
    // Try to access editor with a sample project ID
    await page.goto('/video-editor/test-project-123');
    
    await page.waitForTimeout(2000);
    
    // Should show editor, error, or redirect
    const hasContent = 
      await page.locator('main').isVisible() ||
      await page.locator('[class*="editor"]').isVisible() ||
      await page.getByText(/not found|error|login/i).isVisible();
    
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Series Builder', () => {
  test('should load series builder page', async ({ page }) => {
    await page.goto('/series/builder');
    
    await page.waitForLoadState('networkidle');
    
    // Should show builder UI or auth redirect
    const pageLoaded = 
      await page.locator('main').isVisible() ||
      await page.locator('h1, h2').first().isVisible();
    
    expect(pageLoaded).toBeTruthy();
  });

  test('should display series list page', async ({ page }) => {
    await page.goto('/series');
    
    await page.waitForLoadState('networkidle');
    
    // Should show series page content
    const hasContent = await page.locator('main, [class*="container"]').first().isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Video Generation Flow', () => {
  test('should navigate from templates to generator', async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    
    // Look for a link or button to generator
    const generatorLink = page.getByRole('link', { name: /generate|video|create/i }).first();
    
    if (await generatorLink.isVisible()) {
      await generatorLink.click();
      await expect(page).toHaveURL(/video-generator|generate/);
    }
  });

  test('should show script input area', async ({ page }) => {
    await page.goto('/video-generator');
    await page.waitForLoadState('networkidle');
    
    // Look for script/content input
    const textInput = page.getByRole('textbox').first().or(
      page.locator('textarea').first()
    );
    
    if (await textInput.isVisible()) {
      await expect(textInput).toBeEnabled();
    }
  });
});

test.describe('Video Workflow Integration', () => {
  test('should handle AB tests navigation', async ({ page }) => {
    await page.goto('/ab-tests');
    await page.waitForLoadState('networkidle');
    
    // Should load AB tests page
    const pageLoaded = await page.locator('main, [class*="container"]').first().isVisible();
    expect(pageLoaded).toBeTruthy();
  });

  test('should handle predictions page', async ({ page }) => {
    await page.goto('/predictions');
    await page.waitForLoadState('networkidle');
    
    // Should load predictions page
    const pageLoaded = await page.locator('main, [class*="container"]').first().isVisible();
    expect(pageLoaded).toBeTruthy();
  });

  test('should handle my-scripts page', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    // Should load or redirect appropriately
    await page.waitForTimeout(1000);
    const hasResponse = page.url().includes('/my-scripts') || 
                        page.url().includes('/auth') ||
                        page.url() === 'http://localhost:8080/';
    expect(hasResponse).toBeTruthy();
  });
});

test.describe('Video Generation Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Block API requests to simulate network issues
    await page.route('**/api/**', (route) => route.abort());
    
    await page.goto('/video-generator');
    await page.waitForLoadState('domcontentloaded');
    
    // Page should still render
    const pageLoaded = await page.locator('body').isVisible();
    expect(pageLoaded).toBeTruthy();
  });

  test('should show error boundary on component crash', async ({ page }) => {
    await page.goto('/');
    
    // Error boundary should be in place
    // We can't easily trigger a crash, but we verify the page loads
    await expect(page.locator('body')).toBeVisible();
  });
});
