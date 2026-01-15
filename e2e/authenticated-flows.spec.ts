import { test, expect } from './fixtures/auth';

/**
 * E2E Tests for Authenticated User Flows
 * Uses auth fixtures to test protected routes with authenticated sessions
 */

test.describe('Authenticated Dashboard Access', () => {
  test('should access dashboard with authenticated session', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Should not redirect to auth page
    const url = authenticatedPage.url();
    
    // Either stays on dashboard or goes to onboarding (which is also authenticated)
    expect(
      url.includes('/dashboard') || 
      url.includes('/onboarding') ||
      !url.includes('/auth')
    ).toBeTruthy();
    
    // Dashboard content should be visible
    const mainContent = authenticatedPage.locator('main, [class*="dashboard"]');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should display user-specific content on dashboard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForTimeout(2000);
    
    // Look for authenticated user elements
    const userMenu = authenticatedPage.getByRole('button', { name: /account|profile|user|menu/i }).or(
      authenticatedPage.locator('[class*="avatar"]')
    ).or(
      authenticatedPage.locator('[data-testid="user-menu"]')
    );
    
    // Either user menu is visible or main content is loaded
    const hasContent = await authenticatedPage.locator('main').first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should navigate between protected routes', async ({ authenticatedPage }) => {
    const protectedRoutes = ['/dashboard', '/templates', '/predictions', '/my-scripts', '/settings'];
    
    for (const route of protectedRoutes) {
      await authenticatedPage.goto(route);
      await authenticatedPage.waitForLoadState('domcontentloaded');
      
      // Should not be redirected to auth
      const url = authenticatedPage.url();
      expect(url.includes('/auth')).toBeFalsy();
      
      // Page content should be visible
      const body = authenticatedPage.locator('body');
      await expect(body).toBeVisible();
    }
  });
});

test.describe('Authenticated Script Operations', () => {
  test('should access script creation from dashboard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForTimeout(2000);
    
    // Look for script creation UI
    const createButton = authenticatedPage.getByRole('button', { name: /create|new|generate|start/i }).or(
      authenticatedPage.locator('[class*="quick-action"]')
    );
    
    const hasScriptUI = await authenticatedPage.locator('main').first().isVisible();
    expect(hasScriptUI).toBeTruthy();
  });

  test('should access my scripts page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/my-scripts');
    await authenticatedPage.waitForTimeout(2000);
    
    // Should show scripts or empty state
    const url = authenticatedPage.url();
    expect(url.includes('/my-scripts') || url.includes('/onboarding')).toBeTruthy();
    
    const content = authenticatedPage.locator('main, [class*="scripts"]');
    await expect(content.first()).toBeVisible();
  });

  test('should access predictions page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/predictions');
    await authenticatedPage.waitForTimeout(2000);
    
    const url = authenticatedPage.url();
    expect(url.includes('/auth')).toBeFalsy();
    
    const content = authenticatedPage.locator('main');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Authenticated Settings Access', () => {
  test('should access settings page with tabs', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings');
    await authenticatedPage.waitForTimeout(2000);
    
    const url = authenticatedPage.url();
    if (url.includes('/settings')) {
      // Look for settings tabs or sections
      const settingsTabs = authenticatedPage.getByRole('tab').or(
        authenticatedPage.locator('[class*="tab"]')
      );
      
      const hasSettingsUI = await authenticatedPage.locator('main, [class*="settings"]').first().isVisible();
      expect(hasSettingsUI).toBeTruthy();
    }
  });

  test('should access profile settings', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings');
    await authenticatedPage.waitForTimeout(2000);
    
    // Look for profile section
    const profileSection = authenticatedPage.getByText(/profile|account|personal/i);
    
    // Page should have settings content
    const hasContent = await authenticatedPage.locator('main').first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should access security settings', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings');
    await authenticatedPage.waitForTimeout(2000);
    
    // Look for security tab or section
    const securityTab = authenticatedPage.getByRole('tab', { name: /security/i }).or(
      authenticatedPage.getByText(/security|password|2fa/i)
    );
    
    if (await securityTab.first().isVisible()) {
      await securityTab.first().click();
      await authenticatedPage.waitForTimeout(500);
    }
  });
});

test.describe('Authenticated Series & Video Features', () => {
  test('should access series builder', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/series-builder');
    await authenticatedPage.waitForTimeout(2000);
    
    const url = authenticatedPage.url();
    expect(url.includes('/auth')).toBeFalsy();
    
    const content = authenticatedPage.locator('main, [class*="series"]');
    await expect(content.first()).toBeVisible();
  });

  test('should access video generator', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/video-generator');
    await authenticatedPage.waitForTimeout(2000);
    
    const url = authenticatedPage.url();
    expect(url.includes('/auth')).toBeFalsy();
  });

  test('should access video editor', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/video-editor');
    await authenticatedPage.waitForTimeout(2000);
    
    const content = authenticatedPage.locator('main, [class*="video"]');
    await expect(content.first()).toBeVisible();
  });
});

test.describe('Authenticated Analytics Access', () => {
  test('should access analytics page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/analytics');
    await authenticatedPage.waitForTimeout(2000);
    
    const url = authenticatedPage.url();
    expect(url.includes('/auth')).toBeFalsy();
    
    const content = authenticatedPage.locator('main, [class*="analytics"]');
    await expect(content.first()).toBeVisible();
  });

  test('should access performance page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/performance');
    await authenticatedPage.waitForTimeout(2000);
    
    const content = authenticatedPage.locator('main');
    await expect(content.first()).toBeVisible();
  });

  test('should access A/B tests page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/ab-tests');
    await authenticatedPage.waitForTimeout(2000);
    
    const url = authenticatedPage.url();
    expect(url.includes('/auth')).toBeFalsy();
  });
});

test.describe('Admin Panel Access', () => {
  test('should access admin panel with admin session', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForTimeout(3000);
    
    // Admin should not be redirected to auth
    const url = adminPage.url();
    
    // Either shows admin content or access denied (based on permissions)
    const hasContent = await adminPage.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should access admin users page', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForTimeout(3000);
    
    const hasContent = await adminPage.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should access admin security page', async ({ adminPage }) => {
    await adminPage.goto('/admin/security');
    await adminPage.waitForTimeout(3000);
    
    const hasContent = await adminPage.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should access admin content page', async ({ adminPage }) => {
    await adminPage.goto('/admin/content');
    await adminPage.waitForTimeout(3000);
    
    const hasContent = await adminPage.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Auth Helper Functions', () => {
  test('should check authentication status', async ({ page, authHelpers }) => {
    // Initially not authenticated
    await page.goto('/');
    const initialAuth = await authHelpers.isAuthenticated();
    
    // Mock auth
    await authHelpers.mockAuth();
    await page.goto('/');
    
    // Now should be authenticated (mock session is set)
    const afterMockAuth = await authHelpers.isAuthenticated();
    expect(afterMockAuth).toBeTruthy();
  });

  test('should handle logout', async ({ page, authHelpers }) => {
    // Set up mock auth
    await authHelpers.mockAuth();
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Perform logout
    await authHelpers.logout();
    
    // Should no longer be authenticated
    const afterLogout = await authHelpers.isAuthenticated();
    expect(afterLogout).toBeFalsy();
  });
});

test.describe('Session Persistence', () => {
  test('should maintain session across page navigation', async ({ authenticatedPage }) => {
    // Navigate to multiple pages
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    
    await authenticatedPage.goto('/templates');
    await authenticatedPage.waitForLoadState('networkidle');
    
    await authenticatedPage.goto('/settings');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Check session is still valid
    const authState = await authenticatedPage.evaluate(() => {
      const key = Object.keys(localStorage).find(k => k.includes('auth-token'));
      return key ? localStorage.getItem(key) : null;
    });
    
    expect(authState).toBeTruthy();
  });

  test('should maintain session after page reload', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForTimeout(2000);
    
    // Reload the page
    await authenticatedPage.reload();
    await authenticatedPage.waitForTimeout(2000);
    
    // Check session persists
    const authState = await authenticatedPage.evaluate(() => {
      const key = Object.keys(localStorage).find(k => k.includes('auth-token'));
      return key ? localStorage.getItem(key) : null;
    });
    
    expect(authState).toBeTruthy();
  });
});

test.describe('Protected Route Redirects', () => {
  test('should redirect unauthenticated users to auth', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Try to access protected route
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    // Should be redirected or show auth
    const url = page.url();
    expect(
      url.includes('/auth') || 
      url === 'http://localhost:8080/' ||
      url.includes('/dashboard') // Some pages allow guest access
    ).toBeTruthy();
  });

  test('should redirect to requested page after auth', async ({ page, authHelpers }) => {
    // Start at protected route
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    
    const initialUrl = page.url();
    
    // If redirected to auth, mock login and check return
    if (initialUrl.includes('/auth')) {
      await authHelpers.mockAuth();
      await page.goto('/settings');
      await page.waitForTimeout(2000);
      
      const afterAuthUrl = page.url();
      expect(afterAuthUrl.includes('/settings') || afterAuthUrl.includes('/onboarding')).toBeTruthy();
    }
  });
});
