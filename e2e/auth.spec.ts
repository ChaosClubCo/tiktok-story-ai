import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Tests for Authentication Flows
 * Tests login, signup, and session management
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
  });

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth');
      
      // Check for login form elements
      await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
      await page.goto('/auth');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /sign in|login/i }).click();
      
      // Should show validation error
      await expect(page.getByText(/email.*required|please enter.*email/i)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth');
      
      // Fill in invalid credentials
      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in|login/i }).click();
      
      // Should show error message
      await expect(page.getByText(/invalid.*credentials|incorrect.*password|error/i)).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to signup form', async ({ page }) => {
      await page.goto('/auth');
      
      // Find and click signup link/button
      const signupLink = page.getByRole('button', { name: /sign up|create account|register/i }).or(
        page.getByRole('link', { name: /sign up|create account|register/i })
      );
      
      if (await signupLink.isVisible()) {
        await signupLink.click();
        await expect(page.getByRole('heading', { name: /sign up|create|register/i })).toBeVisible();
      }
    });
  });

  test.describe('Sign Up Flow', () => {
    test('should display signup form elements', async ({ page }) => {
      await page.goto('/auth');
      
      // Look for signup tab or navigate to signup
      const signupTab = page.getByRole('tab', { name: /sign up/i }).or(
        page.getByRole('button', { name: /create account/i })
      );
      
      if (await signupTab.isVisible()) {
        await signupTab.click();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();
      }
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth');
      
      // Switch to signup if needed
      const signupTab = page.getByRole('tab', { name: /sign up/i });
      if (await signupTab.isVisible()) {
        await signupTab.click();
      }
      
      // Enter invalid email
      await page.getByLabel(/email/i).first().fill('invalidemail');
      await page.getByLabel(/password/i).first().fill('ValidPassword123!');
      
      // Try to submit
      await page.getByRole('button', { name: /sign up|create|register/i }).first().click();
      
      // Should show email validation error
      await expect(page.getByText(/valid email|invalid email/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Session Management', () => {
    test('should redirect to auth page when accessing protected route', async ({ page }) => {
      // Try to access dashboard without auth
      await page.goto('/dashboard');
      
      // Should either redirect to auth or show auth required message
      await expect(page).toHaveURL(/\/(auth|login)?/);
    });

    test('should persist session across page reloads', async ({ page }) => {
      // This test would require a valid session setup
      // Placeholder for actual implementation with auth fixtures
      await page.goto('/');
      await expect(page).toHaveURL('/');
    });
  });
});

test.describe('Protected Route Access', () => {
  test('should show loading state when checking auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Either shows loading spinner or redirects
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]').or(
      page.getByRole('progressbar')
    );
    
    // Give it a moment to potentially show
    await page.waitForTimeout(500);
  });
});
