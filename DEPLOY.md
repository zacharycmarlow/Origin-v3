# Cloudflare Deployment Guide

## Prerequisites

1. Install wrangler: `pnpm add -g wrangler`
2. Login: `wrangler login`
3. Create the D1 database:
   ```bash
   wrangler d1 create origin-db
   # Copy the database_id into artifacts/api-worker/wrangler.toml
   ```
4. Create the R2 bucket:
   ```bash
   wrangler r2 bucket create origin-media
   ```

## D1 Database Setup

1. Generate migrations (already done):
   ```bash
   pnpm -F @workspace/db run generate-d1
   ```

2. Apply migrations to D1:
   ```bash
   wrangler d1 execute origin-db --remote --file=lib/db/drizzle-d1/0000_useful_shocker.sql
   ```

   For local development with D1:
   ```bash
   wrangler d1 execute origin-db --local --file=lib/db/drizzle-d1/0000_useful_shocker.sql
   ```

## API Worker Deployment

1. Set secrets:
   ```bash
   cd artifacts/api-worker
   wrangler secret put ANTHROPIC_API_KEY
   wrangler secret put CLERK_SECRET_KEY
   ```

2. Set the Anthropic base URL (AI Gateway or direct):
   ```bash
   wrangler secret put ANTHROPIC_BASE_URL
   ```

3. Deploy:
   ```bash
   wrangler deploy
   ```

## Frontend (Cloudflare Pages) Deployment

1. Build the frontend:
   ```bash
   PORT=3000 BASE_PATH=/ pnpm -F @workspace/origin-app build
   ```

2. Deploy to Pages:
   ```bash
   cd artifacts/origin-app
   wrangler pages deploy dist/public
   ```

   Or connect the GitHub repo to Cloudflare Pages in the dashboard with:
   - Build command: `PORT=3000 BASE_PATH=/ pnpm -F @workspace/origin-app build`
   - Build output: `artifacts/origin-app/dist/public`

3. Set environment variables in Pages dashboard:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_PROXY_TARGET` (your Workers API URL)

## Architecture

```
Browser → Cloudflare Pages (frontend)
                ↓ /api/*
         Cloudflare Worker (Hono API)
                ↓
         D1 (SQLite) + R2 (media) + Anthropic (AI)
```

- **Pages**: Static frontend (React/Vite)
- **Worker**: Hono API with D1 + R2 bindings
- **D1**: SQLite database (free tier: 5GB, 5M reads/day)
- **R2**: Object storage (free tier: 10GB storage, 1M ops/month)
- **AI Gateway**: Optional Anthropic caching/rate-limiting layer

## Local Development

The Express API server (`artifacts/api-server`) remains for local
development with PostgreSQL. The Hono worker (`artifacts/api-worker`)
is for production on Cloudflare.

```bash
# Local dev (PostgreSQL + Express)
docker run -d --name origin-pg -e POSTGRES_DB=origin -e POSTGRES_HOST_AUTH_METHOD=trust -p 5432:5432 postgres:17
pnpm install
pnpm -F @workspace/db run push
pnpm -F @workspace/api-server dev   # terminal 1
PORT=3000 BASE_PATH=/ VITE_API_PROXY_TARGET=http://localhost:3001 pnpm -F @workspace/origin-app dev  # terminal 2

# Local dev with Workers (D1 + Hono)
cd artifacts/api-worker
wrangler dev
```
