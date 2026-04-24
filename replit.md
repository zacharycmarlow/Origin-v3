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

### Architecture
- `src/App.tsx` — shell with Spine nav, Deck navigator, 5 tile types (Prelude/Opener/Code/Scene/Epilogue)
- `src/chapters.ts` — all 7 chapters' content with TypeScript types
- `src/index.css` — complete unified CSS system (~1200 lines, no Tailwind)
- `src/storage.ts` — localStorage persistence for journal entries and tile position
- `src/components/Scene.tsx` — routes to 10 interactive scene components
- `src/components/` — BreathPacer, Journal, ShameMask, VoicesList, Declarations, Gratitude, Gathering, MoveTimer, Broadcast, JournalOverlay
- `src/storage.ts` — exports `BodyEntry`, `StreamEntry` types + `getBodyEntries`, `getStreamEntries`, `deleteStreamEntry` helpers
- Floating toolbar (bottom-right, z-80): book icon opens JournalOverlay. Slots reserved for Stream (wave) and Body (figure) icons from Tasks #4/#5.

### Chapters
1. Prologue — The Wound (shame mask, breath pacer, journaling)
2. Wound — The Conditioned Self (voices list, shame mask, journaling)
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
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
