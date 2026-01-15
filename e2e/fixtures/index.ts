/**
 * E2E Test Fixtures Index
 * Exports all test fixtures for use in E2E tests
 */

export { 
  test, 
  expect, 
  authenticatedTest,
  TEST_CREDENTIALS,
  ADMIN_CREDENTIALS 
} from './auth';

// Re-export Playwright utilities
export type { Page, BrowserContext, Locator } from '@playwright/test';
