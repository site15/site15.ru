import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const clientUrl = process.env['E2E_CLIENT_URL'];
const envFile = process.env['ENV_FILE']
  ? join(__dirname, '..', '..', process.env['ENV_FILE'])
  : join(__dirname, '..', '..', '.env');
const parsed = existsSync(envFile)
  ? config({ path: envFile, override: true })
  : {};

if (parsed.error) {
  throw parsed.error;
}

// For CI, you may want to set E2E_CLIENT_URL to the deployed application.
const baseURL =
  clientUrl || process.env['E2E_CLIENT_URL'] || 'http://localhost:4200';

process.env['E2E_CLIENT_URL'] = baseURL;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Run tests in files in parallel */
  fullyParallel: false,
  workers: 1,
  maxFailures: 10,
  retries: 3,
  timeout: 120 * 1000,
  reporter: [['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    video: 'on',
    viewport: { width: 1920, height: 1080 },
    headless: true,
  },
  expect: { timeout: 10_000 },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // todo: some client e2e tests only work on chrome, try fixing later
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
