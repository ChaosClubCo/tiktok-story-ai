import { test as base, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Authentication Fixtures for Playwright E2E Tests
 * Provides authenticated sessions for testing protected routes
 */

// Test user credentials (use env variables in CI)
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

const ADMIN_USER = {
  email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_USER_PASSWORD || 'AdminPassword123!',
};

// Storage state file paths for session persistence
const AUTH_STATE_PATH = 'e2e/.auth/user.json';
const ADMIN_AUTH_STATE_PATH = 'e2e/.auth/admin.json';

/**
 * Authenticates a user via the auth page
 */
async function authenticateUser(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Wait for auth form to load
  const emailInput = page.getByLabel(/email/i).or(
    page.locator('input[type="email"]')
  );
  const passwordInput = page.getByLabel(/password/i).or(
    page.locator('input[type="password"]')
  );

  if (!(await emailInput.isVisible())) {
    console.log('Email input not found, checking for sign-in tab');
    
    // Try clicking sign in tab first
    const signInTab = page.getByRole('tab', { name: /sign in/i });
    if (await signInTab.isVisible()) {
      await signInTab.click();
      await page.waitForTimeout(500);
    }
  }

  // Fill in credentials
  await emailInput.first().fill(email);
  await passwordInput.first().fill(password);

  // Submit form
  const submitButton = page.getByRole('button', { name: /sign in|login|submit/i });
  await submitButton.click();

  // Wait for navigation or error
  await page.waitForTimeout(3000);

  // Check if authentication was successful
  const url = page.url();
  const isAuthenticated = 
    url.includes('/dashboard') || 
    url.includes('/onboarding') ||
    !url.includes('/auth');

  return isAuthenticated;
}

/**
 * Sets up a mock authenticated session by injecting auth state
 */
async function setupMockAuthSession(context: BrowserContext, userId: string = 'test-user-id') {
  // Set up mock Supabase auth session in localStorage
  const mockSession = {
    access_token: 'mock-access-token-' + Date.now(),
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() / 1000 + 3600, // 1 hour from now
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: userId,
      email: TEST_USER.email,
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
    },
  };

  // Add auth state to storage
  await context.addInitScript((session) => {
    // Mock Supabase auth storage key format
    const storageKey = 'sb-aughkdwuvkgigczkfozp-auth-token';
    localStorage.setItem(storageKey, JSON.stringify(session));
  }, mockSession);
}

/**
 * Sets up a mock admin session
 */
async function setupMockAdminSession(context: BrowserContext, userId: string = 'admin-user-id') {
  const mockSession = {
    access_token: 'mock-admin-access-token-' + Date.now(),
    refresh_token: 'mock-admin-refresh-token',
    expires_at: Date.now() / 1000 + 3600,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: userId,
      email: ADMIN_USER.email,
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: { 
        provider: 'email', 
        providers: ['email'],
        is_admin: true 
      },
      user_metadata: { role: 'super_admin' },
    },
  };

  await context.addInitScript((session) => {
    const storageKey = 'sb-aughkdwuvkgigczkfozp-auth-token';
    localStorage.setItem(storageKey, JSON.stringify(session));
  }, mockSession);
}

/**
 * Extended test fixtures with authentication support
 */
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  authHelpers: {
    login: (email?: string, password?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    mockAuth: (userId?: string) => Promise<void>;
    mockAdminAuth: (userId?: string) => Promise<void>;
    isAuthenticated: () => Promise<boolean>;
  };
};

export const test = base.extend<AuthFixtures>({
  // Authenticated user page fixture
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await setupMockAuthSession(context);
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Admin user page fixture
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await setupMockAdminSession(context);
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Helper functions for auth operations
  authHelpers: async ({ page, context }, use) => {
    const helpers = {
      login: async (email = TEST_USER.email, password = TEST_USER.password) => {
        return authenticateUser(page, email, password);
      },
      
      logout: async () => {
        await page.goto('/');
        // Look for logout button/link
        const logoutBtn = page.getByRole('button', { name: /log ?out|sign ?out/i });
        if (await logoutBtn.isVisible()) {
          await logoutBtn.click();
          await page.waitForTimeout(1000);
        }
        // Clear cookies and storage
        await context.clearCookies();
        await page.evaluate(() => localStorage.clear());
      },
      
      mockAuth: async (userId?: string) => {
        await setupMockAuthSession(context, userId);
      },
      
      mockAdminAuth: async (userId?: string) => {
        await setupMockAdminSession(context, userId);
      },
      
      isAuthenticated: async () => {
        const authState = await page.evaluate(() => {
          const key = Object.keys(localStorage).find(k => k.includes('auth-token'));
          return key ? localStorage.getItem(key) : null;
        });
        return !!authState;
      },
    };
    
    await use(helpers);
  },
});

export { expect };

// Re-export for convenience
export const authenticatedTest = test;
export const TEST_CREDENTIALS = TEST_USER;
export const ADMIN_CREDENTIALS = ADMIN_USER;
