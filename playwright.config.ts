import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E & Visual Regression Test Configuration
 * 
 * Commands:
 * - Run all tests: npx playwright test
 * - Run with UI: npx playwright test --ui
 * - Run specific test: npx playwright test e2e/auth.spec.ts
 * - Run authenticated tests: npx playwright test e2e/authenticated-flows.spec.ts
 * - Update snapshots: npx playwright test --update-snapshots
 * - Generate report: npx playwright show-report
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Global timeout for each test */
  timeout: 30000,
  
  /* Reporter configuration with HTML report and coverage */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:8080',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'on-first-retry',
    
    /* Default action timeout */
    actionTimeout: 10000,
    
    /* Default navigation timeout */
    navigationTimeout: 15000,
  },

  /* Visual comparison options */
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.02,
    },
    /* Increase expect timeout for slower operations */
    timeout: 10000,
  },

  /* Snapshot output directory */
  snapshotDir: './e2e/__snapshots__',

  /* Configure projects for major browsers */
  projects: [
    // Setup project for auth state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Chrome with authenticated state
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    // Safari
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    /* Authenticated tests project */
    {
      name: 'authenticated',
      use: { 
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*authenticated.*\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
