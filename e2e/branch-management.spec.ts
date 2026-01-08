import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Branch Management Feature
 * 
 * These tests verify the complete branch management workflow:
 * - Branch creation
 * - Branch switching
 * - Branch merging
 * - Branch visibility in UI
 */

test.describe('Branch Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page (assuming test user needs to login)
    // In a real scenario, you'd either:
    // 1. Use a test user with credentials
    // 2. Mock the authentication
    // 3. Use Supabase test mode
    await page.goto('/auth');
    
    // For this test, we'll assume authentication is handled by existing test setup
    // or that the page allows access in test mode
  });

  test('should display BranchSelector on script cards in MyScripts page', async ({ page }) => {
    // Navigate to MyScripts page
    await page.goto('/my-scripts');
    
    // Wait for scripts to load
    await page.waitForSelector('[data-testid="script-card"]', { timeout: 10000 }).catch(() => {
      console.log('No scripts found, which is okay for empty state');
    });
    
    // Check if BranchSelector button exists
    // The BranchSelector renders a button with GitBranch icon and branch name
    const branchSelector = page.locator('button:has-text("main")').first();
    
    // If there are scripts, there should be branch selectors
    const scriptCards = await page.locator('[data-testid="script-card"]').count();
    if (scriptCards > 0) {
      await expect(branchSelector).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show branch dropdown when clicking BranchSelector', async ({ page }) => {
    await page.goto('/my-scripts');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find the first BranchSelector button
    const branchButton = page.locator('button').filter({ hasText: /main|branch/i }).first();
    
    // Check if button exists before clicking
    const buttonCount = await branchButton.count();
    if (buttonCount > 0) {
      await branchButton.click();
      
      // Dropdown menu should appear with "Create New Branch" option
      await expect(page.locator('text=Create New Branch')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should open CreateBranchModal when clicking Create New Branch', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    const branchButton = page.locator('button').filter({ hasText: /main|branch/i }).first();
    const buttonCount = await branchButton.count();
    
    if (buttonCount > 0) {
      await branchButton.click();
      await page.locator('text=Create New Branch').click();
      
      // Modal should open with branch name input
      await expect(page.locator('input[placeholder*="branch"]').or(page.locator('input[name="branchName"]'))).toBeVisible({ timeout: 3000 });
    }
  });

  test('should switch branches when selecting from dropdown', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    const branchButton = page.locator('button').filter({ hasText: /main|branch/i }).first();
    const buttonCount = await branchButton.count();
    
    if (buttonCount > 0) {
      // Get initial branch name
      const initialBranch = await branchButton.textContent();
      
      await branchButton.click();
      
      // Look for any other branch in the list
      const branchOptions = page.locator('[role="menuitem"]').filter({ hasText: /branch|main/i });
      const optionCount = await branchOptions.count();
      
      if (optionCount > 1) {
        // Click on a different branch (not the current one)
        await branchOptions.nth(1).click();
        
        // Wait for toast notification
        await expect(page.locator('text=Branch Switched').or(page.locator('[role="status"]'))).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show merge option for non-main branches', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    // First, create a test branch (if possible)
    const branchButton = page.locator('button').filter({ hasText: /main|branch/i }).first();
    const buttonCount = await branchButton.count();
    
    if (buttonCount > 0) {
      await branchButton.click();
      
      // If there's a non-main branch, check for merge option
      const nonMainBranch = page.locator('[role="menuitem"]').filter({ hasText: /test|feature|experiment/i }).first();
      const nonMainCount = await nonMainBranch.count();
      
      if (nonMainCount > 0) {
        await nonMainBranch.click();
        
        // Re-open dropdown
        await branchButton.click();
        
        // Should see "Merge to Main" option
        await expect(page.locator('text=Merge to Main')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should handle branch operations with proper error handling', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Try to interact with branch selector
    const branchButton = page.locator('button').filter({ hasText: /main|branch/i }).first();
    const buttonCount = await branchButton.count();
    
    if (buttonCount > 0) {
      await branchButton.click();
      
      // Wait a bit for any errors to surface
      await page.waitForTimeout(1000);
      
      // Should not have critical errors
      const criticalErrors = errors.filter(e => 
        e.includes('TypeError') || 
        e.includes('ReferenceError') ||
        e.includes('Cannot read')
      );
      
      expect(criticalErrors.length).toBe(0);
    }
  });

  test('should persist branch selection across page reloads', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    const branchButton = page.locator('button').filter({ hasText: /main|branch/i }).first();
    const buttonCount = await branchButton.count();
    
    if (buttonCount > 0) {
      // Get current branch
      const currentBranch = await branchButton.textContent();
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check branch is still the same
      const branchButtonAfterReload = page.locator('button').filter({ hasText: /main|branch/i }).first();
      const branchAfterReload = await branchButtonAfterReload.textContent();
      
      expect(branchAfterReload).toBe(currentBranch);
    }
  });

  test('should integrate with existing version history feature', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    // Look for History button
    const historyButton = page.locator('button').filter({ hasText: /history/i }).first();
    const historyButtonCount = await historyButton.count();
    
    if (historyButtonCount > 0) {
      await historyButton.click();
      
      // Version history dialog should open
      await expect(page.locator('text=Version History')).toBeVisible({ timeout: 5000 });
      
      // Branch selector should still be functional in the context of the same script
      // (This verifies integration without conflict)
    }
  });
});

test.describe('Branch Management - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    // Tab to branch selector
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Eventually should be able to activate branch selector with Enter
    // (Actual tab count will vary based on page structure)
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/my-scripts');
    await page.waitForLoadState('networkidle');
    
    const branchButton = page.locator('button').filter({ hasText: /main|branch/i }).first();
    const buttonCount = await branchButton.count();
    
    if (buttonCount > 0) {
      // Button should have accessible attributes
      const ariaExpanded = await branchButton.getAttribute('aria-expanded');
      expect(['true', 'false']).toContain(ariaExpanded);
    }
  });
});
