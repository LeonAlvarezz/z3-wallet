# Pre-deploy Checklist

This checklist is required before every production release.

## 1) CI Gate Must Pass

Run or confirm:

- `bun run verify:predeploy`
- GitHub Actions `Predeploy Gate` workflow is green on the release commit.

## 2) Database Migration (Manual Reviewed)

- Generate migration SQL: `bun run db:gen` (from `apps/backend`).
- Review SQL manually before applying.
- Apply to staging first: `bun run db:migrate`.
- Run smoke tests on staging after migration.
- Apply to production only after staging validation is complete.

## 3) Staging Smoke Tests

- Sign in and sign out flow works.
- `/v1/health-check` responds with success.
- Core data endpoints load (`/wallets`, `/transactions`, `/categories`).
- Transaction CRUD succeeds (create, update, delete).
- Frontend API proxy path works (`/api/*` to backend `/v1/*`).

## 4) Production Promotion

- Promote only when sections 1-4 pass.
- Keep rollback-ready artifacts and migration context available during release window.

## 5) Release Trigger

- Bump the shared app version with `bun run release:bump -- <patch|minor|major|x.y.z>`.
- Commit the version update.
- Create the release tag with `bun run release:tag`.
- Push the release commit and tag with `git push --follow-tags`.
- The `Release` GitHub workflow deploys backend first, confirms `/v1/health-check` reports the tagged version, then deploys the web app.
