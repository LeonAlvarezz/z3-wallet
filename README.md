# Z3 Wallet

Z3 Wallet is a mobile-first personal finance app built in a Bun-powered monorepo. It includes a React web client and an Elysia API for managing authentication, wallets, transactions, categories, and category rules.

## Overview

This repository is organized as a Turborepo workspace with:

- a frontend app in `apps/web`
- a backend API in `apps/backend`
- shared packages for API types and exceptions in `packages/*`

The current product direction focuses on:

- authentication and profile management
- wallet and transaction tracking
- category management and matching rules
- a clean mobile-style UI with dark mode support

## Features

- **Transaction tracking**  
	Record and manage personal transactions with support for common money flows like expenses and top-ups.

- **At-a-glance statistics**  
	The app surfaces quick summary stats so users can understand recent activity and spending patterns faster.

- **Smart transaction input**  
	Includes a smart-input flow that helps parse natural transaction text into structured values like amount, category, and note.

- **Transaction search and browsing**  
	Transactions can be searched and browsed with pagination-friendly backend support.

- **Category rules**  
	Users can define category-matching rules to speed up transaction entry and improve consistency.

- **Profile personalization**  
	Users can update profile data and choose from built-in system avatars.

- **Blazing fast developer and runtime experience**  
	Built with Bun, Vite, React, and Elysia for fast local development, quick feedback loops, and lightweight runtime performance.

## Tech Stack

### Frontend

- React 19
- Vite
- TanStack (Router, Form, Query)

### Backend

- Elysia
- Drizzle
- PostgreSQL
- Redis

### Shared Packages
- `@z3-wallet/types`
- `@z3-wallet/exception`
- `@z3-wallet/api-client`

## Repository Structure

```text

├── apps/
│   ├── backend/        # Elysia API, Drizzle config, database logic
│   └── web/            # React app with TanStack Router and feature modules
├── documents/          # Project notes and working context
├── packages/
│   ├── api-client/     # Shared request utilities
│   ├── exception/      # Shared error classes
│   ├── types/          # Shared Zod schemas and TypeScript types
│   └── ...
├── package.json
└── turbo.json
```

Some areas are still evolving, so this project should be considered actively in progress.

## Prerequisites

Before running the project, make sure you have:

- Bun `1.3.9` or compatible
- PostgreSQL
- Redis
  
## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure the backend environment

Set the required environment variables for the backend.

### 3. Prepare the database

From the backend app:

```bash
cd apps/backend
bun run db:push
bun run db:seed
```

Available database commands:

- `bun run db:push` — push schema changes to the database
- `bun run db:gen` — generate Drizzle migrations
- `bun run db:migrate` — run migrations
- `bun run db:reset` — reset the database
- `bun run db:seed` — seed development data

### Pre-deploy Commands

Run these from repository root:

- `bun run check-types` — run type checks across workspaces
- `bun run test` — run integration tests
- `bun run verify:predeploy` — strict release gate (`install -> lint -> typecheck -> test -> build`)

### Release Flow

Release versioning is now driven from the repository root `package.json`, and the same version is synced into `apps/web` and `apps/backend`.

- `bun run release:bump -- patch` — bump the shared app version and refresh `bun.lock`
- `bun run release:prepare` — run the strict release gate before tagging
- `bun run release:tag` — create an annotated `vX.Y.Z` tag from the current version
- `git push --follow-tags` — push the release commit and tag to trigger the GitHub `Release` workflow

The release workflow verifies the tagged commit, waits for the backend auto-deploy to report the tagged version on the health check, then deploys the web app and publishes a GitHub release.

Required GitHub secrets for the release workflow:

- `BACKEND_HEALTHCHECK_URL`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `WEB_RELEASE_SMOKE_URL`

### Production Migration Policy

- `db:push` is for local development only.
- Production releases must use generated SQL migrations (`bun run db:gen`) and manual SQL review.
- Apply migrations in staging first, then apply in production using `bun run db:migrate`.

### 4. Start development

From the repository root:

```bash
bun run dev
```

This starts the workspace development tasks via Turbo.

Typical local setup:

- frontend: Vite dev server
- backend: Elysia server on port `3000` by default

The frontend proxies `/api/*` requests to the backend `/v1/*` API.

## Frontend Conventions

The frontend is organized by feature modules.

- routes live in `apps/web/src/routes`
- feature code lives in `apps/web/src/modules`
- shared UI lives in `apps/web/src/components`

## Backend Conventions

The backend is organized by domain modules under `apps/backend/src/modules`.
Each module typically contains:
- route definitions
- service logic
- repository/database access
- Zod-backed request and response schemas through shared types

See [apps/backend/src/routes/route-handler.ts](apps/backend/src/routes/route-handler.ts) for the assembled route tree.

## Shared Types

Shared runtime schemas and TypeScript types live in [packages/types/src/index.ts](packages/types/src/index.ts). These are used by both the frontend and backend to keep validation and DTO shapes consistent.

## Status

This project is under active development. The repository already contains real feature modules and shared infrastructure, but some flows are still being refined and expanded.
