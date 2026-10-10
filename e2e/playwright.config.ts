import { fileURLToPath } from "node:url"

import { defineConfig, devices } from "@playwright/test"

const port = process.env.E2E_PORT ?? "18080"
export const baseURL = `http://127.0.0.1:${port}`
export const adminStorageState = fileURLToPath(new URL(".tmp/admin.json", import.meta.url))

export default defineConfig({
  testDir: "./tests",
  outputDir: "./.tmp/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: ".tmp/report" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL,
    // Fixed locale and time zone so formatted dates are deterministic.
    locale: "en-US",
    timezoneId: "America/Chicago",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      // Lets environments with a preinstalled Chromium use it instead of `npx playwright install`.
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: adminStorageState },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "node e2e/scripts/server.mjs",
    cwd: "..",
    url: `${baseURL}/healthz`,
    // Building the admin UI and server takes a while on a cold cache.
    timeout: 240_000,
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "pipe",
  },
})
