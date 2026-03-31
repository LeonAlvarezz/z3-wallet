# E2E Tests (Playwright)

This suite covers a minimal end-to-end flow:

- sign in
- add transaction
- verify dashboard updates
- sign out

## Run

From `apps/web`:

```bash
bun install
bunx playwright install chromium
bun run test:e2e
```

By default, Playwright starts the frontend dev server and expects backend API to
already be running.

## Optional env overrides

- `E2E_BASE_URL` (default: `http://127.0.0.1:5173`)
- `E2E_API_BASE_URL` (default: `http://127.0.0.1:4000/v1`)
- `E2E_WEB_PORT` (default: `5173`)
- `E2E_API_PORT` (default: `4000`)
- `E2E_WEB_CMD` (override frontend startup command)
- `E2E_BACKEND_CMD` (override backend startup command)
- `E2E_MANAGE_BACKEND=1` (also start backend from Playwright, defaults to `.env.test`)
- `E2E_BACKEND_ENV_FILE` (default: `.env.test`, only used when `E2E_BACKEND_CMD` is not set)
- `VITE_DEV_API_PROXY_TARGET` (frontend dev proxy target, defaults to `http://localhost:4000`)
