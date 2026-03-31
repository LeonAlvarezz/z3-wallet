import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webPort = Number(process.env.E2E_WEB_PORT ?? 5173);
const apiPort = Number(process.env.E2E_API_PORT ?? 4000);
const apiBaseURL =
  process.env.E2E_API_BASE_URL ?? `http://127.0.0.1:${apiPort}/v1`;
const apiOrigin = new URL(apiBaseURL).origin;
const manageBackend = process.env.E2E_MANAGE_BACKEND === "1";
const backendEnvFile = process.env.E2E_BACKEND_ENV_FILE ?? ".env.test";

const webCommand =
  process.env.E2E_WEB_CMD ??
  `VITE_DEV_API_PROXY_TARGET=${apiOrigin} bun run dev -- --host 127.0.0.1 --port ${webPort}`;
const backendCommand =
  process.env.E2E_BACKEND_CMD ??
  `PORT=${apiPort} bun --no-env-file --env-file=${backendEnvFile} run src/app.ts`;

const webServers = [
  {
    command: webCommand,
    cwd: __dirname,
    port: webPort,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
];

if (manageBackend) {
  webServers.unshift({
    command: backendCommand,
    cwd: path.resolve(__dirname, "../backend"),
    port: apiPort,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  });
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://127.0.0.1:${webPort}`,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: webServers,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
