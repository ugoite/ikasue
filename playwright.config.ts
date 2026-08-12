import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const systemChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  timeout: 15_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    ...devices["Desktop Chrome"],
    ...(existsSync(systemChrome)
      ? { launchOptions: { executablePath: systemChrome } }
      : {}),
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
