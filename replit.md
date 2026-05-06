# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Primary Artifact: The Origin App

`artifacts/origin-app` — A guided 7-chapter self-discovery journaling web experience.

### Visual Style
Warm handmade paper manuscript aesthetic:
- Fibrous cream paper texture via SVG noise filters
- Gold foil typography (multi-stop linear-gradient with drop-shadow filters)
- Teal bioluminescent glows on interactive elements and spine waypoints
- Pherome font from `/public/fonts/Pherome-Regular.otf` for display headings
- Cormorant SC / EB Garamond / JetBrains Mono for supporting type

### Authentication (Task #7)
Clerk auth (Replit-managed) via `@clerk/react` (client) + `@clerk/express` (server):
- **ClerkProvider** wraps the app in `src/main.tsx` with Wouter routing
- **Routes**: `/sign-in/*?` → SignInPage, `/sign-up/*?` → SignUpPage (paper aesthetic, gold Clerk theme)
- **AuthBar** (`src/components/AuthBar.tsx`) — topbar-right: sign-in button (guest) or avatar+sign-out (authed)
- **Server**: `requireAuth` middleware in `artifacts/api-server/src/middlewares/requireAuth.ts` — validates Clerk JWT, upserts user row, attaches `req.userId` to request
- **Protected routes**: `/api/user/state`, `/api/user/entries`, `/api/user/readings`, `/api/user/archive` — all require auth, scoped to `req.userId`
- **Sync layer** (`src/api/userApi.ts`): `pullAll()` on sign-in (server → localStorage merge), `pushAll()` periodic (every 30s) and `pushTileIdx()` on nav
- **Migration prompt**: on first sign-in when localStorage has data, AuthBar shows "save journey" pill
- **Guest mode**: full journey accessible without sign-in; localStorage remains source of truth for guests
- Public routes unchanged: `/api/healthz`, `/api/readings/*`

### AI Reading System (Instruction 7)
Sonnet/Haiku readings via `@workspace/integrations-anthropic-ai`:
- **Morpho** (butterfly, teal) — marginal notes, through-line, subtext per chapter (Sonnet)
- **Sage** (compass, gold) — resonance + personalized codes & lore (Sonnet)
- **Horizon** (coherence breath) — 5s-in/5s-out × 6 cycles between completed chapters; integration whisper from Haiku, word-by-word reveal, hold-to-cross 2s
- **Cumulative** (after all 7 chapters) — Morpho+Sage with `cumulative: true` flag, surfaced in Codex tab + epilogue
- Server: `artifacts/api-server/src/routes/readings/{index.ts, prompts.ts}` — POST `/api/readings/{morpho|sage|horizon}`, Zod-validated, JSON-fenced parsing. System prompts inlined as TS constants.
- Client: `src/api/readings.ts` (fetch wrappers) + `src/components/{MiniJournal, HorizonOverlay, MorphoCompassIcons}.tsx`
- Storage: `getReading`, `saveMorpho/Sage/Horizon`, `getCodex` (auto-populated from Sage), `getCumulative`, `extractChapterBeats`, `isChapterComplete` in `src/storage.ts`. Readings live in localStorage keys `origin.readings`, `origin.codex`, `origin.cumulative`.
- App.tsx wraps tile navigation in `advance()` interceptor that triggers HorizonOverlay when crossing forward from a complete chapter (12 cycles when entering epilogue). `sessionHorizonsRef` prevents repeats. Spine shows butterfly/compass glyphs when readings exist.
- Journal tab order: `reading | spine | body | stream | codex`. Reading is the default tab when current chapter is complete.

### Gesture & Revelation UX (Future Magic Book)
- **Swipe navigation**: Deck component tracks touch with axis-locking (h/v), rubber-band at edges, ref-based direct DOM transform (no React re-renders during drag). `go(idx, fromSwipe?)` handles swipe vs button exits differently. `pendingRef` prevents double-fires.
- **Tile entrances**: `tileIn`/`tileInBack` are now horizontal (translateX ±36px + blur) matching swipe direction.
- **Opener ceremony**: `OpenerTileView` uses `useEffect` timers — roman numeral (120ms), title (420ms), subtitle (720ms), invocation paragraphs staggered (1050ms + 280ms/para). CSS `.opener-phase` / `.opener-phase--in` with opacity+translateY+blur transitions.
- **Progressive scene revelation**: `useSceneReveal` hook — phase 0: context materializes, phase 1: interaction slides up (auto after reading-time timer: 240ms/word, 1.6s–3.5s), phase 2: after-notes appear. SIMPLE_KINDS bypass phasing. Tap anywhere to advance early.
- **Bottom tray**: `BottomTray` component replaces floating toolbar. Three tools (Stream/Body/Journal) with icons, names, descriptions. Triggered by three-dot grip in `DeckNav` center. Slides up with spring animation. Floating toolbar CSS set to `display: none`.
- **Code/Lore frame entrance**: SVG corners animate in via `stroke-dashoffset` draw-in on tile mount.

### Architecture
- `src/App.tsx` — shell with Spine nav, Deck navigator (swipe physics), BottomTray, 5 tile types (Prelude/Opener/Code/Scene/Epilogue); auth state + sync logic
- `src/main.tsx` — WouterRouter + ClerkProvider + route table (main app / sign-in / sign-up)
- `src/chapters.ts` — all 7 chapters' content with TypeScript types
- `src/index.css` — complete unified CSS system (~3450 lines, no Tailwind)
- `src/storage.ts` — localStorage persistence for journal entries and tile position
- `src/api/userApi.ts` — server sync layer: `pullAll`, `pushAll`, `pushTileIdx`
- `src/components/AuthBar.tsx` — sign-in button (guest) or avatar+sign-out (authed) + migration prompt pill
- `src/pages/SignInPage.tsx`, `src/pages/SignUpPage.tsx` — paper-themed Clerk auth pages
- `src/components/Scene.tsx` — progressive revelation phases + routes to 10 interactive scene components
- `src/components/` — BreathPacer, Journal, ShameMask, VoicesList, Declarations, Gratitude, Gathering, MoveTimer, Broadcast, JournalOverlay
- `src/storage.ts` — exports `BodyEntry` (with `zoneId` field + legacy migration from `energyCenter`), `StreamEntry` types + `getBodyEntries`, `getStreamEntries`, `deleteStreamEntry`, `addBodyEntry`, `deleteBodyEntry` helpers
- `src/components/BodyOverlay.tsx` — full-screen "where does this live in your body?" tool
- `src/components/StreamOverlay.tsx` — full-screen stream-of-consciousness tool (Maritim font, Web Speech API)
- Code tiles: collapsed by default (essence line + explore chevron). Tap to expand full body text; tap collapse to return.
- Lore tiles: new tile type after each Code tile. Organic vine+eye corner frame, gold (#C4A265). Same expand/collapse as Code.

### API Server Architecture
- `artifacts/api-server/src/app.ts` — Express 5 + Clerk proxy middleware + clerkMiddleware + routes
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` — Clerk Frontend API proxy (production only)
- `artifacts/api-server/src/middlewares/requireAuth.ts` — JWT validation, user upsert, `req.userId` injection
- `artifacts/api-server/src/routes/user/index.ts` — all `/api/user/*` protected routes

### Chapters
1. Prologue — The opening chapter of a story only you can tell (Theater, Seed, Arc, Third Person, First Page)
2. Tension — The more tension in your story, the more powerful the resolution (Score, Conditions, Loop, Unedited Version, Threshold)
3. Gift — The Kintsugi (gratitude, declarations)
4. Source — The Power (breath, journaling)
5. Narrator — The Story (scene journaling)
6. Dream — The Vision (breath, journaling)
7. Ending — The Gathering (gathering, finale)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Auth**: Clerk (Replit-managed, `@clerk/react` + `@clerk/express`)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
