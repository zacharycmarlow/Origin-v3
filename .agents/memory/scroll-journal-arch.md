---
name: Scroll Journal section architecture
description: How the continuous scroll journal is structured and how tools integrate
---

## Rule
`ScrollJournal.tsx` renders a flat `SectionData[]` array. Each section type maps to a full-width block. Interactive tools (stream, body) are `section.kind` types embedded in scroll — not overlays opened from buttons.

**Section order per chapter:**
`chapter-gate → scene×N → stream-section → body-section → ai-reading → chapter-transition`

**Why:** Code review rejected overlay-based stream/body in scroll context. Inline tools feel like natural page content; overlays break scroll immersion.

**How to apply:** Adding a new tool = add `SectionData` union member + entry in `buildSections()` + case in the switch render. Never add buttons that open overlays for content that fits inline.

## SavedPulse pattern
`Journal.tsx` has `onSave?: () => void` called after 300ms debounce (only when value has content). `SceneSection` in ScrollJournal owns `savedVisible` state and passes `onSaveJournal` down through Scene → Journal. Auto-hides after 1600ms via setTimeout.

## Word-by-word reveal
`useWordReveal(text, active, delayMs)` in AiReadingSection — splits on `\s+`, advances index via setInterval, returns revealed substring. `active` is `freshlyLoaded` (set only after successful API fetch, reset on chapterIdx change).
