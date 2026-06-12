// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * TMDone Admin Console - Playwright Configuration
 * Base URL: https://consoledemo.uat.v3.dr.tmd1.org
 */
export default defineConfig({
  // Tests folder eka specify karannne mehethanin
  testDir: './tests',

  // Test files parallel run karanna - speed eka wagakai
  fullyParallel: false,

  // CI environment eke test.only thiyannam build fail wenawa
  forbidOnly: !!process.env.CI,

  // CI eke retries 2 yi, local eke 0 yi
  retries: process.env.CI ? 2 : 1,

  // CI eke workers 1 yi, local eke automatic yi
  workers: 1,

  // HTML report generate wenawa test eka run una gaman
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  // Okkoma tests walin common settings
  use: {
    // TMDone Admin demo URL eka
    baseURL: 'https://consoledemo.uat.v3.dr.tmd1.org',

    // Test fail una wita screenshot gannawa
    screenshot: 'only-on-failure',

    // Test fail una wita video gannawa
    video: 'retain-on-failure',

    // Trace collect karannawa first retry eke
    trace: 'on-first-retry',

    // Action timeout - 30 seconds
    actionTimeout: 30000,

    // Navigation timeout - 60 seconds
    navigationTimeout: 60000,

    // Browser eka balanna one nam: HEADED=true npx playwright test
    headless: process.env.HEADED !== 'true',

    // Viewport size set karannawa
    viewport: { width: 1280, height: 720 },
  },

  // Chromium browser ekkai test karanne (Chrome)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Test output folder
  outputDir: 'test-results/',

  // Global timeout per test - 2 minutes
  timeout: 120000,
});
