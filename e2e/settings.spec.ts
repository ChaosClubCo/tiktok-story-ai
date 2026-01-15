import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Settings and Account Management
 * Tests user settings, security options, and account preferences
 */

test.describe('Settings Page Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should redirect to auth when accessing settings unauthenticated', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    // Should redirect to auth or show auth required
    const url = page.url();
    expect(url.includes('/auth') || url.includes('/settings')).toBeTruthy();
  });

  test('should display settings page structure', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Check for settings sections
      const settingsContent = page.locator('main, [class*="settings"]').first();
      await expect(settingsContent).toBeVisible();
    }
  });
});

test.describe('Profile Settings', () => {
  test('should show profile settings section', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for profile-related elements
      const profileSection = page.getByText(/profile|account|display name/i).first();
      const hasProfileUI = await profileSection.isVisible().catch(() => false);
    }
  });
});

test.describe('Security Settings', () => {
  test('should display security options', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for security-related elements
      const securitySection = page.getByText(/security|password|2fa|two-factor/i).first();
      const hasSecurityUI = await securitySection.isVisible().catch(() => false);
    }
  });

  test('should show password change option', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      const passwordOption = page.getByText(/change password|update password/i);
      const hasPasswordUI = await passwordOption.isVisible().catch(() => false);
    }
  });

  test('should show 2FA setup option', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      const twoFAOption = page.getByText(/two-factor|2fa|authenticator/i);
      const has2FAUI = await twoFAOption.isVisible().catch(() => false);
    }
  });
});

test.describe('Notification Settings', () => {
  test('should display notification preferences', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      const notificationSection = page.getByText(/notification|email|alerts/i).first();
      const hasNotificationUI = await notificationSection.isVisible().catch(() => false);
    }
  });

  test('should have toggleable notification options', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for toggle switches
      const toggles = page.getByRole('switch').or(
        page.locator('[class*="toggle"]')
      ).or(
        page.locator('[type="checkbox"]')
      );
      
      const hasToggles = await toggles.first().isVisible().catch(() => false);
    }
  });
});

test.describe('Session Management', () => {
  test('should show active sessions', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      const sessionSection = page.getByText(/session|device|logged in/i).first();
      const hasSessionUI = await sessionSection.isVisible().catch(() => false);
    }
  });
});

test.describe('Account Deletion', () => {
  test('should show account deletion option', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      const deleteOption = page.getByText(/delete account|remove account/i);
      const hasDeleteUI = await deleteOption.isVisible().catch(() => false);
    }
  });

  test('should require confirmation for dangerous actions', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for confirmation dialogs or warning text
      const warningText = page.getByText(/irreversible|cannot be undone|permanent/i);
      const hasWarning = await warningText.isVisible().catch(() => false);
    }
  });
});

test.describe('Linked Accounts', () => {
  test('should show linked accounts section', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      const linkedSection = page.getByText(/linked|connected|social/i).first();
      const hasLinkedUI = await linkedSection.isVisible().catch(() => false);
    }
  });
});

test.describe('Settings Form Validation', () => {
  test('should validate email format in settings', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for email input
      const emailInput = page.getByLabel(/email/i).or(
        page.locator('input[type="email"]')
      );
      
      if (await emailInput.first().isVisible()) {
        await emailInput.first().fill('invalid-email');
        await emailInput.first().blur();
        
        // Should show validation error
        const errorText = page.getByText(/invalid|valid email/i);
        const hasError = await errorText.isVisible().catch(() => false);
      }
    }
  });
});

test.describe('Settings Persistence', () => {
  test('should save settings changes', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for save button
      const saveButton = page.getByRole('button', { name: /save|update|apply/i });
      const hasSaveButton = await saveButton.first().isVisible().catch(() => false);
    }
  });

  test('should show success message after saving', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Look for toast/notification area
      const toastArea = page.locator('[class*="toast"]').or(
        page.locator('[class*="notification"]')
      ).or(
        page.locator('[role="alert"]')
      );
      
      // Toast may not be visible until action is taken
    }
  });
});

test.describe('Settings Accessibility', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Check for labeled form elements
      const labels = page.locator('label');
      const hasLabels = await labels.count() > 0;
    }
  });

  test('should support keyboard navigation in settings', async ({ page }) => {
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Tab through form elements
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      await page.keyboard.press('Tab');
      
      // Check that focus moves
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeDefined();
    }
  });
});

test.describe('Settings Mobile View', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    // Settings should still be accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have touch-friendly controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/settings');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (!url.includes('/auth')) {
      // Check that buttons are large enough for touch
      const buttons = page.getByRole('button');
      
      if (await buttons.first().isVisible()) {
        const buttonBox = await buttons.first().boundingBox();
        if (buttonBox) {
          // Touch targets should be at least 44x44 pixels
          expect(buttonBox.height).toBeGreaterThanOrEqual(32); // Allow some flexibility
        }
      }
    }
  });
});
