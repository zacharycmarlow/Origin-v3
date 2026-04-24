# THE ORIGIN — v1 Bundle 1: The Chapter Engine

## Context

You are updating the existing Origin app at `origin.metamyth.quest` to bring the static journey to life as a dynamic, guided, interactive experience. This is bundle 1 of 3. It establishes the foundational chapter engine: how users walk through each of the seven chapters, the flow within each chapter, navigation between chapters, auto-save, voice input, and the first embodied somatic interactive (the breath visualization). Later bundles add the dock and tools (Body, Stream, Journal, Library), and the export with rich Code/Lore content.

**Do not build the Library, Body tool, Stream tool, or rich Code/Lore content in this bundle.** Those come in bundles 2 and 3. Step insights and Codes/Lore appear as placeholder stubs in this bundle; their content is written separately.

---

## Core Architecture

### The Seven Chapters

The journey has seven chapters, in this order:

1. **The Prologue** — Remember who you were before the world rewrote you.
2. **The Wound** — Discover that what broke you is exactly what built you.
3. **The Gift** — Hold your life as a gift and watch what it becomes.
4. **The Source** — Discover that the force that shaped your story shaped everything.
5. **The Narrator** — Meet the voice that constructed your entire reality.
6. **The Dream** — Remember when you could build worlds.
7. **The Ending** — Close the book and become the author.

Each chapter follows a three-phase architecture:

- **REALIZE** — Teaching, understanding, expanding awareness. Body text, Chapter Code card (placeholder in v1), Chapter Lore card (placeholder in v1).
- **PRACTICE** — Embodied and reflective exercises. Somatic instructions, short reflective prompts, the Threshold.
- **AUTHOR** — One (or occasionally two) sustained writing prompt(s) where the user produces the chapter's deliverable.

Chapters vary in internal shape. Some (Wound, Narrator, Dream) have multiple REALIZE-PRACTICE pairs before reaching AUTHOR. The engine must support flexible ordering of elements within a chapter, driven by a chapter definition file.

### Element Types

The engine renders a sequence of typed elements defined per chapter. Each chapter is an ordered array of elements. Element types to support:

| Type | Purpose |
|------|---------|
| `body` | Plain body text (prose teaching) |
| `bodyItalic` | Body text in italic (transitions, reflective lines) |
| `sectionLabel` | Small green uppercase label: "REALIZE", "PRACTICE", "AUTHOR" |
| `chapterCode` | The big Chapter Code card (green left border). Shows essence subtitle + expandable content (placeholder in v1). |
| `chapterLore` | The big Chapter Lore card (green left border). Shows essence subtitle + expandable content (placeholder in v1). |
| `stepInsight` | Small inline insight card that unlocks when the preceding step completes. Has small Code piece + small Lore piece (both placeholder in v1). |
| `somatic` | Bold italic embodied instruction. May trigger the breath visualization or prompt the Body tool (bundle 2). |
| `breath` | Triggers the breath visualization interactive (see below). |
| `prompt` | Bold writing prompt with expandable text input below for the user's response. |
| `threshold` | Gold-bordered threshold card. Culminating embodied instruction for the chapter. |
| `centerText` | Centered display text, used for moments like "Author your consciousness." |
| `rule` | Thin horizontal divider, visual breathing room |
| `gather` | Used only in chapter 7's gathering prompt: indented italic lines ("They were born into this world...") |

### Chapter Content Source

The full prose content of the seven chapters exists in the delivered Origin document (`THE_ORIGIN.docx`). Port this content into seven chapter definition files (e.g., `chapters/01-prologue.json`, `chapters/02-wound.json`, etc.) structured as ordered arrays of element objects.

**Example structure for a chapter definition file:**

```json
{
  "id": "prologue",
  "number": "I",
  "title": "The Prologue",
  "epigraph": "Remember who you were before the world rewrote you.",
  "elements": [
    { "type": "sectionLabel", "text": "REALIZE" },
    { "type": "body", "text": "Your whole life, everything you have built and lost and survived, is backstory..." },
    { "type": "chapterCode", "id": "prologue-code", "essence": "Everything you have lived is the opening chapter of a story only you can tell.", "expandedContent": "PLACEHOLDER — rich content to be added in content generation phase" },
    { "type": "chapterLore", "id": "prologue-lore", "essence": "The acorn.", "expandedContent": "PLACEHOLDER — rich content to be added in content generation phase" },
    { "type": "sectionLabel", "text": "PRACTICE" },
    { "type": "breath", "pattern": "4-in-7-out", "duration": 60, "label": "Arrival breath" },
    { "type": "prompt", "id": "prologue-prompt-1", "text": "Before the world shaped you, before anyone approved or disapproved, there was a thread. A fascination. An energy pulling you toward something you could not yet name. What was it?" },
    { "type": "stepInsight", "id": "prologue-insight-1", "unlocksAfter": "prologue-prompt-1", "codeEssence": "PLACEHOLDER", "loreEssence": "PLACEHOLDER", "expandedContent": "PLACEHOLDER" },
    ...
  ]
}
```

A content file in the repo (`content/stubs.json`) holds placeholders for every `chapterCode`, `chapterLore`, and `stepInsight`. Every placeholder has a stable `id` so that rich content can be dropped in later via a single content file swap without touching code.

---

## Navigation

### Chapter Structure

- Chapter 1 of the journey is the **title/opening screen**, which includes the hero title, the opening body text (up to and including the "before we begin" section), the TOC, and belief/mental-health disclaimers. This is always accessible from anywhere in the app.
- Chapters 2–8 in the navigation correspond to the seven journey chapters I–VII.
- After chapter VII, there is a final **Beginning** screen (the metamyth container pitch and closing lines).

### Navigation Rules

- **Locked forward.** The user cannot skip ahead to a chapter they have not yet unlocked. A chapter unlocks when the previous chapter is completed.
- **Free backward.** Once a chapter is unlocked, the user can always return to any earlier chapter (including re-reading, re-viewing their responses).
- **The opening screen is always accessible.** From anywhere in the app, the user can return to the title screen to see the TOC and overall scope.
- The TOC on the opening screen shows chapter state:
  - **Completed**: colored/fully styled
  - **In progress**: partial color, progress indicator
  - **Locked**: grayed out, lock icon, not clickable

### Chapter Completion

A chapter is marked complete when the user reaches and submits the final AUTHOR prompt in that chapter AND taps the **"Save and continue"** button at the bottom.

On completion:
- The chapter's Code and Lore unlock (stubbed in v1; will show placeholder content).
- Any remaining step insights unlock.
- The next chapter becomes available.
- The user transitions to the next chapter.

### Within-Chapter Navigation

- Chapters are displayed as **vertical scrolling screens**, one chapter per screen.
- The user scrolls through the chapter's elements in order.
- A **subtle progress bar** at the top of the chapter indicates position within the chapter (what percentage of elements have been passed or completed).
- At the bottom of each chapter is the **Save and continue** button. It auto-saves anyway, but this gives users a confident, ceremonial transition.

---

## Auto-save and Response Persistence

- **Every text input auto-saves on every keystroke** (debounced at ~500ms).
- Responses persist in browser local storage for v1. (Server-side persistence can come later; keep the data model abstracted so swapping storage is easy.)
- Each response is keyed by `(userId, chapterId, promptId)`. Use a simple anonymous user ID stored in local storage for v1.
- When the user returns to a chapter, all their previously written responses appear in their fields.
- Stream captures, Body taps, and all other inputs persist the same way (though those come in bundle 2).

---

## Voice Input

Every `prompt` text input has a **voice input option**: a small microphone icon inside or beside the textarea.

**Behavior:**
- Tap the mic. A recording UI appears (pulsing circle or similar, to show active listening).
- The Web Speech API (`window.SpeechRecognition` / `webkitSpeechRecognition`) transcribes speech to text in real time.
- Transcribed text appears in the textarea. The user can edit before saving.
- Tap the mic again (or an "Done" button) to stop.

**Fallback:** If Web Speech API is unavailable (some browsers), show a message: "Voice input is not supported in this browser. Please use Chrome or Edge."

**This voice option is per-field, not a separate mode.** Users can type, speak, or mix freely.

---

## The Breath Visualization (Flagship Somatic Interactive)

When the engine encounters a `breath` element, display a guided breath visualization inline within the chapter flow.

### Behavior

- A large, softly pulsing circle appears, centered.
- The circle expands during inhale and contracts during exhale, following the pattern specified (e.g., `4-in-7-out` means 4 seconds inhale, 7 seconds exhale).
- Text around the circle gently cues: "Breathe in..." on expansion, "Breathe out..." on contraction.
- The total duration runs for the specified number of seconds (default 60 if not specified).
- A small skip/dismiss option ("I'll do this on my own") is available — users who don't want to engage the visual can opt out.
- After the duration completes, a gentle confirmation appears ("good") and the user can continue scrolling.

### Visual Tone

- Colors: soft deep teal (`#2E5D4B`) with a faint gold (`#C4A265`) ring pulse.
- Smooth easing (no jarring transitions).
- Minimal text. The visual does the work.
- Feels contemplative, restorative. Think meditation app, not fitness app.

---

## Step Insights (Placeholders in v1)

- A `stepInsight` element renders as a small inline card that is **initially hidden or locked**.
- It unlocks when the step it references (via `unlocksAfter` property) is completed:
  - For a `prompt`: unlocks when the user submits a response (any text content).
  - For a `breath`: unlocks when the breath cycle completes (or is dismissed).
  - For a `somatic`: unlocks when the user taps a "Continue" or "Done" button on that somatic element.
- When unlocked, the step insight card animates in (gentle fade or slide) with placeholder content: "Code: [placeholder essence]" and "Lore: [placeholder essence]" and an expand toggle.
- Tapping the card expands it to show placeholder expanded content.
- Step insights persist as unlocked once the user earns them — they remain visible on return visits.

**v1 Scope:** All step insights use stub content. The unlocking logic and UI must work perfectly. Actual content comes in the content generation phase.

---

## Chapter Code and Chapter Lore Cards (Placeholders in v1)

- `chapterCode` renders as a larger card (compared to step insights) in the REALIZE section.
- Styling: green left border (`#2E5D4B`), "THE CODE —" label in the display font, then the essence subtitle in italic, then an expand toggle below.
- Expanded state shows the placeholder expanded content (400–600 words in final version).
- **Chapter Codes unlock only when the chapter is completed** (marked as unlocked in user state). Before completion, they show the essence subtitle but expanded content is locked/hidden.
  - Display state before completion: card visible, essence readable, but expanded content area shows "Complete this chapter to unlock the full Code."
- After chapter completion, expanded content becomes available.

Same rules apply to `chapterLore` (styled similarly but with warmer visual treatment to be refined in bundle 3).

**v1 Scope:** Essence lines are the final versions (see below). Expanded content is stub placeholder.

### Final Essence Lines (use these in the chapter definition files)

| Chapter | Code Essence | Lore Essence |
|---------|--------------|--------------|
| I Prologue | Everything you have lived is the opening chapter of a story only you can tell. | The acorn. |
| II Wound | What you carry as who you are is the story your brain made out of what happened. | The songline. |
| III Gift | The meaning you give your life is the life you get to live. | The golden repair. |
| IV Source | The mind that built every god can make your life sacred. | The law of origin. |
| V Narrator | Your entire reality is a story, and the one telling it is the one you mistook for yourself. | The daimon. |
| VI Dream | The world you want to live in does not exist yet, and you are the one dreaming it into being. | The dreaming. |
| VII Ending | A story told aloud to another nervous system becomes real in a way no thought can. | The thin place. |

---

## Visual Language (Reference)

Match the typography and color of the existing static Origin build. Key tokens:

- **Primary dark**: `#1A1A2E` (titles, headings, prompt text)
- **Green**: `#2E5D4B` (Chapter Code, Chapter Lore, step insights, section labels)
- **Gold**: `#C4A265` (Threshold cards, breath pulse ring)
- **Body text**: `#4A4A5A`
- **Display font**: Pherome (fallback to Century Gothic / sans-serif if not available)
- **Body font**: Century Gothic / clean sans-serif

- Chapter titles are large, display font, green.
- Epigraphs are italic body font, gray-body color.
- Section labels (REALIZE / PRACTICE / AUTHOR) are small caps, display font, green, before their section.
- Somatic text is bold italic body, slightly indented.
- Prompts are bold primary-dark, indented, with generous whitespace for the response field below.

---

## User Data Model (v1)

Minimum viable data model, stored in local storage:

```json
{
  "userId": "anon-uuid-xxxx",
  "currentChapter": "prologue",
  "completedChapters": ["prologue"],
  "responses": {
    "prologue-prompt-1": "user's written response here...",
    "prologue-prompt-2": "...",
    ...
  },
  "unlockedStepInsights": ["prologue-insight-1", "prologue-insight-2"],
  "unlockedChapterCodes": ["prologue-code"],
  "unlockedChapterLore": ["prologue-lore"]
}
```

Keep this model abstracted (e.g., through a `UserStore` module) so it can be swapped for server persistence later.

---

## What This Bundle Delivers

After bundle 1, a user can:
- Land on the opening screen, see the hero title, read the opening text, and see the TOC with locked/unlocked states.
- Enter chapter I (the Prologue) and walk through every element in sequence: read the body text, see the Chapter Code and Lore cards (with placeholders, essence visible), do the breath visualization, answer prompts via typing or voice.
- Have step insights unlock as they complete each step (with placeholder content).
- Auto-save on every keystroke.
- Tap "Save and continue" to complete the chapter and unlock the next.
- Return to any completed chapter at any time and see their previously written responses intact.
- Progress through all seven chapters this way.
- Land on the final "Beginning" screen after chapter VII.

What the user cannot yet do (coming in bundles 2 and 3):
- Open a Body tool to mark where they feel things
- Open a Stream capture
- Open a Journal to see all responses together
- Open a Library of unlocked Codes and Lore
- Export a PDF of their journey
- See rich Morpho presence

---

## Deliverables for Bundle 1

1. **Chapter engine**: React component that renders a chapter from its definition file, handles all element types above, manages state (current position, response values, unlock tracking).
2. **Seven chapter definition files** in `content/chapters/`, populated with the full body text, somatic instructions, prompts, and essence lines from the existing Origin content (placeholders for expanded Code/Lore/insight content).
3. **Opening screen** with title, opening body text, TOC with lock states, disclaimers.
4. **Final Beginning screen** with closing content after chapter VII.
5. **Navigation system** with locked-forward / free-back rules.
6. **Auto-save system** persisting to local storage.
7. **Voice input component** reusable across all prompts.
8. **Breath visualization component** with configurable pattern and duration.
9. **Subtle progress bar** within each chapter.
10. **Save and continue** button and transition logic.

## Out of Scope for Bundle 1

- Body tool / chakra diagram (bundle 2)
- Stream capture tool (bundle 2)
- Journal view with three tabs (bundle 2)
- Library browser (bundle 3)
- PDF export (bundle 3)
- Morpho icon and presence (bundle 3)
- Rich content for Codes, Lore, and step insights (content generation phase, after all three bundles)
- Server-side data persistence (later phase)

## Development Notes

- Keep element rendering modular. Each element type is its own component. This makes adding new element types trivial later.
- Keep content definition and rendering decoupled. Content lives in JSON. Rendering logic lives in components. Swapping rich content for placeholders should require zero code changes.
- Use a simple state management approach (React Context or Zustand). No need for Redux.
- Animations should be subtle and smooth. Favor CSS transitions and simple fade/slide effects.
- Mobile-first responsive design. Most users will walk this on a phone.
- Accessibility: proper semantic HTML, keyboard navigation, sufficient contrast.
- Do not build speculative features. Build exactly what this spec describes.

## Questions to Confirm Before Building

If anything in this spec is ambiguous or conflicts with the existing codebase, flag it before building. Key places where the existing app may constrain this design:
- How is the existing app currently organized (single-page vs multi-route)?
- Is there existing state management that should be extended vs replaced?
- Are there existing style tokens / theme files to integrate with?

---

**End of Bundle 1.** Bundles 2 and 3 follow the same structure: clear scope, tight deliverables, placeholders where content is still being written.
