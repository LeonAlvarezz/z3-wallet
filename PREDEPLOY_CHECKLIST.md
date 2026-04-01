# Pre-deploy Checklist

This checklist is required before every production release.

## 1) CI Gate Must Pass

Run or confirm:

- `bun run verify:predeploy`
- GitHub Actions `Predeploy Gate` workflow is green on the release commit.

## 2) Environment Preflight Must Pass

- Backend and frontend production env vars are present in Dokploy.
- Verify deployment secrets/config values are correct before release.

## 3) Database Migration (Manual Reviewed)

- Generate migration SQL: `bun run db:gen` (from `apps/backend`).
- Review SQL manually before applying.
- Apply to staging first: `bun run db:migrate`.
- Run smoke tests on staging after migration.
- Apply to production only after staging validation is complete.

## 4) Staging Smoke Tests

- Sign in and sign out flow works.
- `/v1/health-check` responds with success.
- Core data endpoints load (`/wallets`, `/transactions`, `/categories`).
- Transaction CRUD succeeds (create, update, delete).
- Frontend API proxy path works (`/api/*` to backend `/v1/*`).

## 5) Production Promotion

- Promote only when sections 1-4 pass.
- Keep rollback-ready artifacts and migration context available during release window.
