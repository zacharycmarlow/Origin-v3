---
name: HorizonOverlay integration in scroll journal
description: How HorizonOverlay is triggered in the scroll journal context
---

## Rule
HorizonOverlay is triggered by the user clicking "coherence breath" in `TransitionSection`. It is NOT auto-triggered on scroll or chapter advance.

**Required props:** `chapter`, `chapterIdx`, `cycles`, `onComplete`, `onCancel`

**App.tsx pattern:**
- `horizonTarget: { chapterIdx } | null` state
- ScrollJournal receives `onHorizon: (chapterIdx: number) => void`
- TransitionSection shows button only when `isChapterComplete(chapter) || hasReading`
- Both `onComplete` and `onCancel` call `setHorizonTarget(null)`

**Why:** The original deck auto-triggered Horizon between chapters on forward navigation. In scroll context there is no equivalent trigger; user-initiated breath is more intentional and avoids interrupting the reading flow.
