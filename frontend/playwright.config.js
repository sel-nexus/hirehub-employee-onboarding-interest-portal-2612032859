import { defineConfig } from '@playwright/test';

/** Configures one deterministic browser worker against the live Vite SPA. */
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
