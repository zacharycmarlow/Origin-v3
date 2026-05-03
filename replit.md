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
- `src/storage.ts` — exports `BodyEntry` (with `zoneId` field + legacy migration from `energyCenter`), `StreamEntry` types + `getBodyEntries`, `getStreamEntries`, `deleteStreamEntry`, `addBodyEntry`, `deleteBodyEntry` helpers
- Floating toolbar (bottom-right, z-80): three stacked buttons — Stream (ripples) → Body (silhouette) → Journal (book). Each opens its own full-screen overlay.
- `src/components/BodyOverlay.tsx` — full-screen "where does this live in your body?" tool. Line-art figure (240×600 SVG) with 11 zones (Head/Brow/Jaw/Throat/Shoulders/Heart/Gut/Belly/Root/Hands(paired)/Back). Faint dashed Back-echo silhouette behind torso. Notes accumulate as colored petal-clusters around each zone, distributed within a chapter-owned 51.4° sector (one sector per chapter, starting at top). Per-zone bottom-sheet for note entry + history. Keyboard accessible (Tab/Enter/Space, ESC closes sheet then overlay, ⌘/Ctrl+Enter saves). Exports named `BodyFigure` for read-only reuse in Journal Body tab as the artifact-at-a-glance (always shows full journey, ignores chapter filter).
- `src/components/StreamOverlay.tsx` — full-screen stream-of-consciousness tool. Type or speak (uses Web Speech API). User's words render in **Maritim** script font (`/public/fonts/Maritim.ttf`, exposed as `--font-stream` CSS var) — chrome stays in system fonts. Mic button toggles continuous recognition with a pulsing 3-bar visualizer; transcription streams into the textarea live. Save (⌘/Ctrl+Enter or Save button) writes to `streamEntries` via `addStreamEntry(chapter, text)`. History displayed below as a "downstream" — chronological reverse, each entry in Maritim with chapter color dot + relative timestamp + delete confirm.
- Code tiles: collapsed by default (essence line + explore chevron). Tap to expand full body text; tap collapse to return.
- Lore tiles: new tile type after each Code tile. Organic vine+eye corner frame, gold (#C4A265). Same expand/collapse as Code. Essence line collapsed; rich tradition text expanded.
- `chapters.ts`: Chapter.code has `essence` field; Chapter.lore: `{ essence, expandedContent }` per chapter with Dagara/Aboriginal/Kogi/Sufi/etc. tradition content.

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
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
