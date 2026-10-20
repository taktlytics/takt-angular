import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: 'http://localhost:4177' },
  webServer: {
    command: 'pnpm build && pnpm exec vite e2e/app --port 4177 --strictPort',
    url: 'http://localhost:4177',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
