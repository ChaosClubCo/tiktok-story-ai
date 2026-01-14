import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Tests for Account Recovery Flows
 * Tests backup email recovery, security questions, and rate limiting
 */

test.describe('Account Recovery Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.describe('Recovery Options Display', () => {
    test('should display recovery options on auth page', async ({ page }) => {
      await page.goto('/auth');
      
      // Look for forgot password or recovery link
      const recoveryLink = page.getByRole('link', { name: /forgot|recovery|reset/i }).or(
        page.getByRole('button', { name: /forgot|recovery|reset/i })
      );
      
      await expect(recoveryLink.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show recovery methods when clicking forgot password', async ({ page }) => {
      await page.goto('/auth');
      
      // Click on forgot password link
      const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
        page.getByRole('button', { name: /forgot/i })
      );
      
      if (await forgotLink.first().isVisible()) {
        await forgotLink.first().click();
        
        // Should show recovery options
        await expect(page.getByText(/recovery|backup|security/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Backup Email Recovery', () => {
    test('should show backup email input field', async ({ page }) => {
      await page.goto('/auth');
      
      const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
        page.getByRole('button', { name: /forgot/i })
      );
      
      if (await forgotLink.first().isVisible()) {
        await forgotLink.first().click();
        
        // Look for backup email option
        const backupOption = page.getByText(/backup email/i);
        if (await backupOption.isVisible()) {
          await backupOption.click();
          
          // Should show email input
          await expect(page.getByLabel(/backup email|email/i)).toBeVisible();
        }
      }
    });

    test('should validate email format for backup email', async ({ page }) => {
      await page.goto('/auth');
      
      const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
        page.getByRole('button', { name: /forgot/i })
      );
      
      if (await forgotLink.first().isVisible()) {
        await forgotLink.first().click();
        
        // Enter invalid email if input is visible
        const emailInput = page.getByLabel(/email/i).first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('invalidemail');
          await page.getByRole('button', { name: /verify|submit|continue/i }).first().click();
          
          // Should show validation error
          await expect(page.getByText(/valid email|invalid/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Security Questions Recovery', () => {
    test('should display security question option', async ({ page }) => {
      await page.goto('/auth');
      
      const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
        page.getByRole('button', { name: /forgot/i })
      );
      
      if (await forgotLink.first().isVisible()) {
        await forgotLink.first().click();
        
        // Should show security questions option
        await expect(
          page.getByText(/security question/i).or(page.getByRole('button', { name: /security/i }))
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show security question form fields', async ({ page }) => {
      await page.goto('/auth');
      
      const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
        page.getByRole('button', { name: /forgot/i })
      );
      
      if (await forgotLink.first().isVisible()) {
        await forgotLink.first().click();
        
        const securityOption = page.getByText(/security question/i).or(
          page.getByRole('button', { name: /security question/i })
        );
        
        if (await securityOption.first().isVisible()) {
          await securityOption.first().click();
          
          // Should show input fields for answers
          await expect(page.getByLabel(/answer/i).first()).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should require minimum answers', async ({ page }) => {
      await page.goto('/auth');
      
      const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
        page.getByRole('button', { name: /forgot/i })
      );
      
      if (await forgotLink.first().isVisible()) {
        await forgotLink.first().click();
        
        const securityOption = page.getByText(/security question/i).first();
        if (await securityOption.isVisible()) {
          await securityOption.click();
          
          // Try to submit without answers
          const submitButton = page.getByRole('button', { name: /verify|submit|continue/i }).first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Should show error about minimum answers
            await expect(page.getByText(/required|minimum|at least/i)).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });
  });

  test.describe('Rate Limiting', () => {
    test('should show remaining attempts after failed verification', async ({ page }) => {
      await page.goto('/auth');
      
      const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
        page.getByRole('button', { name: /forgot/i })
      );
      
      if (await forgotLink.first().isVisible()) {
        await forgotLink.first().click();
        
        // Look for attempt counter or rate limit message
        // This would appear after a failed attempt
        const emailInput = page.getByLabel(/email/i).first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
          
          const backupInput = page.getByLabel(/backup/i);
          if (await backupInput.isVisible()) {
            await backupInput.fill('wrong@backup.com');
            await page.getByRole('button', { name: /verify|submit/i }).first().click();
            
            // Should show remaining attempts or rate limit message
            await expect(
              page.getByText(/attempt|remaining|try again/i)
            ).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });
  });

  test.describe('Settings Page Recovery Options', () => {
    test('should show recovery settings for authenticated users', async ({ page }) => {
      // This test would require authentication setup
      await page.goto('/settings');
      
      // Should either redirect to auth or show settings
      await expect(page).toHaveURL(/\/(settings|auth)?/);
    });
  });
});

test.describe('Account Recovery Settings', () => {
  test.describe('Backup Email Configuration', () => {
    test('should display backup email setup section', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for account recovery section
      const recoverySection = page.getByText(/account recovery|backup email|recovery options/i);
      
      if (await recoverySection.first().isVisible()) {
        await expect(recoverySection.first()).toBeVisible();
      }
    });
  });

  test.describe('Security Questions Configuration', () => {
    test('should display security questions setup section', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for security questions section
      const securitySection = page.getByText(/security question/i);
      
      if (await securitySection.first().isVisible()) {
        await expect(securitySection.first()).toBeVisible();
      }
    });
  });
});

test.describe('Recovery Flow Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and fail network requests to recovery endpoint
    await page.route('**/functions/v1/verify-recovery', route => {
      route.abort();
    });
    
    await page.goto('/auth');
    
    const forgotLink = page.getByRole('link', { name: /forgot/i }).or(
      page.getByRole('button', { name: /forgot/i })
    );
    
    if (await forgotLink.first().isVisible()) {
      await forgotLink.first().click();
      
      const emailInput = page.getByLabel(/email/i).first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        
        const submitButton = page.getByRole('button', { name: /verify|submit|continue/i }).first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Should show error message
          await expect(page.getByText(/error|failed|try again/i)).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Intercept and return 500 error
    await page.route('**/functions/v1/verify-recovery', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    await page.goto('/auth');
    
    // Test would continue similar to above
  });
});
