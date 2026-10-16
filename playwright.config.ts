import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Resend is mocked: lib/resend.ts writes emails and contacts to this folder instead.
    command: `pnpm next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      RESEND_MOCK_OUTBOX: ".outbox-e2e",
      RESEND_API_KEY: "",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      WAITLIST_TOKEN_SECRET: "e2e-secret-that-is-at-least-32-characters-long",
    },
  },
});
