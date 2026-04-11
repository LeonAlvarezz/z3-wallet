# Security Best Practices Report

Date: 2026-04-08

Scope:
- Backend: Bun + Elysia API in `apps/backend`
- Frontend: Vite + React app in `apps/web`
- Supporting shared packages in `packages/*`

## Executive Summary

This review found one critical access-control flaw, three high-severity session/data-exposure issues, and four medium-severity configuration and hardening gaps.

The highest-risk issue is an unauthenticated direct object reference on `GET /transactions/:id`, which lets an attacker request transaction records by numeric ID without logging in. The auth stack also has multiple session-handling problems: the login response returns the raw session token in JSON, the session cookie is emitted without `HttpOnly`, `Secure`, or `SameSite`, and password changes do not revoke existing sessions.

I also found an authenticated user-enumeration endpoint, a CORS configuration that reflects arbitrary origins with credentials while ignoring the configured allowlist, a public Prometheus endpoint with an attacker-controlled label, and missing visible browser security headers in the shipped web/edge configs.

## Critical Findings

### [SEC-001] Unauthenticated direct object reference on `GET /transactions/:id`

- Severity: Critical
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/modules/transaction/index.ts:55`
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/modules/transaction/transaction.service.ts:36`
- Evidence:
  - The route is registered without `authenticated: true` or `protected: true`, even though the surrounding module uses `authGuard`.
  - The handler calls `TransactionService.findById(id)`.
  - `findById` fetches by raw numeric ID and returns the row without checking that the caller owns the transaction.
- Impact:
  - Anyone who can guess or iterate transaction IDs can read transaction records without authentication.
  - Because transaction IDs are numeric and incremental, enumeration is straightforward.
- Fix:
  - Require authentication on `GET /transactions/:id`.
  - Scope the lookup by the authenticated user's wallet ownership, not by raw ID alone.
  - Add regression tests for:
    - unauthenticated access returns `401`
    - authenticated access to another user's transaction returns `403` or `404`
- Mitigation:
  - Disable the endpoint until it is ownership-checked if a full fix cannot ship immediately.

## High Findings

### [SEC-002] Any authenticated user can enumerate all users and their email addresses

- Severity: High
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/modules/user/index.ts:33`
  - `/Users/leonhong/Personal Project/my-wallet/packages/types/src/models/user.model.ts:22`
- Evidence:
  - `GET /users/` is available to any request with a valid session via `protected: true`.
  - The route returns `UserService.findAll()`.
  - `UserPublicSchema` still includes `email`, `public_id`, and record timestamps because it only omits `id` and `last_login_at`.
- Impact:
  - Any normal account can harvest the full user list and email addresses.
  - This enables phishing, account enumeration, and privacy violations.
- Fix:
  - Remove this endpoint unless there is a documented admin use case.
  - If it is needed, enforce admin authorization and return a minimized schema.
- Mitigation:
  - Temporarily return only the current user or an empty list for non-admins.

### [SEC-003] Login returns the raw session token in the JSON response body

- Severity: High
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/modules/auth/index.ts:54`
  - `/Users/leonhong/Personal Project/my-wallet/packages/types/src/models/user.model.ts:38`
  - `/Users/leonhong/Personal Project/my-wallet/apps/web/src/api/auth.ts:7`
- Evidence:
  - `/auth/sign-in` sets the session cookie and then returns `UserPublicSessionSchema`.
  - `UserPublicSessionSchema` contains `session_token`.
  - The frontend API client types the login response as `UserPublicSessionDto`, so the token is explicitly available to browser JavaScript.
- Impact:
  - The session token is exposed to any script running in the page, browser extensions, and any future XSS sink.
  - This defeats the main benefit of `HttpOnly` cookies even if cookie flags are added later.
- Fix:
  - Stop returning `session_token` in the login JSON payload.
  - Return only the public user object plus non-sensitive session metadata if needed.
- Mitigation:
  - Treat any previously logged token value as exposed and rotate sessions after the fix.

### [SEC-004] Session cookie is issued without `HttpOnly`, `Secure`, or `SameSite`

- Severity: High
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/modules/auth/index.ts:56`
  - `/Users/leonhong/Personal Project/my-wallet/packages/types/src/models/base.model.ts:27`
  - `/Users/leonhong/Personal Project/my-wallet/node_modules/.bun/elysia@1.4.28+fb8f39da64c14f42/node_modules/elysia/dist/compose.js:294`
- Evidence:
  - The app only assigns `session_token.value = ...`; there is no cookie configuration anywhere in the backend for `httpOnly`, `secure`, `sameSite`, expiry, or signing.
  - Elysia serializes only the cookie options provided by the app or route config; when none are provided, it defaults to `Path=/`.
  - Local framework verification:
    - Minimal in-memory Elysia route emitted `Set-Cookie: session_token=abc; Path=/`
- Impact:
  - The session cookie is readable from JavaScript.
  - There is no explicit production-only transport protection via `Secure`.
  - Cross-site behavior is left to browser defaults instead of an intentional CSRF/session policy.
- Fix:
  - Configure the session cookie centrally with:
    - `httpOnly: true`
    - `sameSite: 'lax'` or stricter unless a documented cross-site flow requires otherwise
    - `secure: env.NODE_ENV === 'production'` with an override for local HTTP testing if needed
    - explicit `maxAge`/`expires`
  - Consider signing the cookie value if the framework supports it for this use case.
- Mitigation:
  - If the API must be cross-site, pair `SameSite=None; Secure` with explicit CSRF protections.

## Medium Findings

### [SEC-005] CORS allowlist is ignored; the backend reflects arbitrary origins and allows credentials

- Severity: Medium
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/app.ts:17`
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/lib/env.ts:16`
  - `/Users/leonhong/Personal Project/my-wallet/node_modules/.bun/@elysiajs+cors@1.4.1+d56174d6c00e99c2/node_modules/@elysiajs/cors/dist/index.mjs:15`
- Evidence:
  - The app parses `CORS_ORIGINS` into `env.CORS_ORIGINS_LIST`, but `app.ts` calls `cors()` with no configuration.
  - The installed `@elysiajs/cors` defaults are `origin = true` and `credentials = true`, which reflect the incoming `Origin` and set `Access-Control-Allow-Credentials: true`.
  - Local framework verification with a request from `https://evil.example` returned:
    - `access-control-allow-origin: https://evil.example`
    - `access-control-allow-credentials: true`
- Impact:
  - The intended allowlist is dead code.
  - If this app is ever deployed with cross-site cookies or other credentialed browser access, arbitrary origins can read authenticated API responses.
- Fix:
  - Replace `cors()` with an explicit policy using `env.CORS_ORIGINS_LIST`.
  - If the worker proxy is the intended architecture and the API is same-origin, remove CORS entirely rather than reflecting arbitrary origins.
- Mitigation:
  - Audit all environments to ensure no deployment depends on permissive cross-origin credentialed access.

### [SEC-006] Public Prometheus metrics include an attacker-controlled `userAgent` label

- Severity: Medium
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/app.ts:19`
  - `/Users/leonhong/Personal Project/my-wallet/node_modules/.bun/elysia-prometheus@1.1.1+1421188c92c56c18/node_modules/elysia-prometheus/dist/index.mjs:56`
- Evidence:
  - The app exposes `metricsPath: "/metrics"` publicly.
  - It adds a dynamic label `userAgent` sourced directly from `ctx.request.headers.get("user-agent")`.
  - The plugin applies dynamic labels to each recorded request metric.
- Impact:
  - An attacker can send many requests with unique `User-Agent` values and create unbounded metric cardinality, which can exhaust memory and degrade observability.
  - The public metrics endpoint also leaks operational details that should normally stay behind network or auth controls.
- Fix:
  - Remove `userAgent` from metric labels.
  - Protect `/metrics` with network restrictions or authentication.
  - Keep only bounded-cardinality labels.
- Mitigation:
  - If external scraping is required, expose metrics through an internal gateway instead of the public app surface.

### [SEC-007] Changing a password does not revoke existing sessions

- Severity: Medium
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/modules/auth/auth.service.ts:404`
  - `/Users/leonhong/Personal Project/my-wallet/apps/backend/src/modules/auth/auth.service.ts:412`
- Evidence:
  - `signOut` deletes the Redis session cache entry and the persisted session row.
  - `changePassword` only verifies the current password and updates the password hash; it never deletes existing sessions.
- Impact:
  - If a session has been stolen or shared, that session remains valid after the user changes their password.
  - Password rotation does not fully recover the account.
- Fix:
  - Delete all sessions for the user as part of password change.
  - Clear matching Redis session cache entries.
  - Optionally issue one fresh session for the current device after revocation.
- Mitigation:
  - Until fixed, warn users that password change does not sign out other devices.

### [SEC-008] No visible browser security headers are configured in the shipped web/edge configs

- Severity: Medium
- Location:
  - `/Users/leonhong/Personal Project/my-wallet/apps/web/worker/index.ts:25`
  - `/Users/leonhong/Personal Project/my-wallet/apps/web/nginx.conf:1`
  - `/Users/leonhong/Personal Project/my-wallet/apps/web/index.html:24`
- Evidence:
  - The Cloudflare worker only proxies `/api` and serves assets; it does not set CSP, `X-Content-Type-Options`, `Referrer-Policy`, or frame protections.
  - The nginx config only sets cache headers for `/assets/`.
  - `index.html` contains an inline script and loads third-party styles, but there is no visible CSP configuration alongside it.
- Impact:
  - The frontend relies on browser defaults instead of explicit hardening.
  - This increases exposure to XSS impact, clickjacking, and content-type confusion if another layer is not adding headers.
- Fix:
  - Add security headers at the serving layer:
    - `Content-Security-Policy`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy`
    - `frame-ancestors` or `X-Frame-Options`
  - Externalize or nonce/hash the inline theme script so CSP can remain strict.
- Mitigation:
  - If another edge tier already injects these headers, verify them at runtime and document that ownership explicitly.

## Verification Notes

- Static review was completed across backend, frontend, shared types, and deployed web configs.
- I performed local framework-level checks to confirm two behaviors:
  - Elysia cookie emission without config produced `session_token=abc; Path=/`
  - `@elysiajs/cors` with default config reflected arbitrary origins and allowed credentials
- Full backend test execution was partially blocked because importing `apps/backend/src/app.ts` binds a real port and `bun test` failed locally with `EADDRINUSE` on port `4000`.

## Recommended Remediation Order

1. Fix `GET /transactions/:id` to require auth and enforce ownership.
2. Stop returning `session_token` in the login response body.
3. Add explicit secure cookie settings for the session cookie.
4. Remove or strictly authorize `GET /users/`.
5. Lock down CORS to the actual allowed origins.
6. Remove `userAgent` from metrics and restrict `/metrics`.
7. Revoke all sessions on password change.
8. Add explicit frontend security headers at the worker/nginx layer.
