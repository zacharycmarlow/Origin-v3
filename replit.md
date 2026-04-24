# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Primary Artifact: The Origin App

`artifacts/origin-app` — A guided 7-chapter self-discovery journaling web experience (metamyth journey).

### Visual Style
Warm handmade paper manuscript aesthetic:
- Fibrous cream paper texture via SVG noise filters
- Gold foil typography (multi-stop linear-gradient, -webkit-background-clip: text)
- Teal bioluminescent glows on interactive elements
- Chapter-specific watercolor palette transitions (2.2s CSS custom property crossfade)
- Fonts: Pherome.otf (display), FantasyMagist.otf (script/code), Ferrum.otf (code body), Valmeria.ttf
- Body font: Futura → Century Gothic → Jost (sans-serif stack)
- All in `public/fonts/`, registered via @font-face

### Architecture — Bundle 1 (Chapter Engine)
- `src/App.tsx` — New shell: Opening screen (TOC + lock states), ChapterEngine, Epilogue. No more horizontal deck.
- `src/store/userStore.ts` — UserStore: localStorage abstraction with userId, completedChapters, responses, unlocked insights/codes/lore
- `src/content/types.ts` — TypeScript types for all 14 element types
- `src/content/chapters/01-07.ts` — 7 chapter definition files (ordered element arrays)
- `src/chapters.ts` — Legacy chapter data (palettes still referenced from App.tsx)
- `src/index.css` — Complete unified CSS system (~1700+ lines, no Tailwind)
- `src/components/ChapterEngine.tsx` — Renders a chapter from element array, manages unlock state
- `src/components/BreathVisualization.tsx` — Animated breath interactive (inhale/exhale circle)
- `src/components/VoiceInput.tsx` — Web Speech API microphone transcription per prompt
- `src/components/elements/` — One component per element type:
  - PromptEl, ThresholdEl, GatherEl, ChapterCodeEl, ChapterLoreEl, StepInsightEl

### Element Types
body, bodyItalic, sectionLabel, chapterCode, chapterLore, stepInsight, somatic, breath, prompt, threshold, centerText, rule, gather

### Navigation
- Opening screen always accessible (THE ORIGIN mark in topbar)
- Locked forward: can't skip ahead (chapter unlocks when previous completes)
- Free backward: any completed chapter accessible from spine nav
- TOC shows done/in-progress/locked states with visual indicators
- Auto-save: every keystroke, debounced 500ms → localStorage

### Chapter Palettes
Each chapter has a unique Palette object (bg, ink, accent, veil, glow, shadow, dark) applied as CSS custom properties on the app root, with 2.2s watercolor crossfade transitions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
