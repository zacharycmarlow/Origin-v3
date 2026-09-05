# THE ORIGIN — Design Brief & Rubric

The accumulated design system. **Read this before building or changing any
screen.** It exists because the same decisions kept getting re-derived from
scratch and re-broken. Nothing here is a fresh opinion — every line is a
decision already made, tested, and in several cases learned the hard way.

Companion docs: [HYPERTEXT.md](./HYPERTEXT.md) — the Code/Lore/Etymology system.

---

## 1. WHAT THIS IS

A seven-chapter guided journey that turns a person's life into an authored
story. It is **a book you move through**, not a web page you scroll and not a
form you fill in. Every design decision serves that: reading feels like
turning pages, writing feels like being handed a real page, and crossing
between moments feels ceremonial.

The seven chapters map to seven arts, moving *backward* through the history
of storytelling:

| # | Chapter | Art | Ground |
|---|---|---|---|
| I | The Opening | Film · framing | cream `#ece1c3` |
| II | The Conflict | The Novel · tension | wine `#3a1020` |
| III | The Twist | Poetry · transformation | green `#102a14` |
| IV | The Source | Religion · awe | blue `#0a1838` |
| V | The Reveal | Mythology · revelation | void `#09090b` |
| VI | The Dream | Adventure · imagination | mint `#c8ede0` |
| VII | The Return | The Spoken Word · empathy | gold `#f2e3c6` |

---

## 2. TYPE SYSTEM — LOCKED

Four faces, each with one job. Do not introduce a fifth.

| Role | Face | Used for |
|---|---|---|
| **Titles** | **Pherome** | chapter titles, movement titles, roman numerals |
| **Sacred / quote** | **Tropic Fantasy** | hero lines, pull-quotes, the "ask", threshold leads |
| **Body** | **Optima LT Pro** | all reading prose, everywhere |
| **Labels / chrome** | **Futura** | eyebrows, counters, buttons, UI. The "clean classic future, Kubrick" register |

`--font-mono` is aliased to `--font-label` (Futura) — there is no monospace
in this design. All faces are local in `public/fonts/`.

### Reading registers
Text is never uniform — that flatness was an early, repeated failure. Five
registers only:

- **whisper** 16px — asides, meta
- **body** 20px — ordinary prose
- **weighted** 25px — a line that carries more; promotion IS isolation
- **ask** 24px italic gold — the question being put to the reader
- **hero** clamp(28–34px) serif accent — one per invocation, maximum

Markup: sigils at **paragraph start only** in the content files — `! ` = hero,
`^ ` = weighted. Rendered by `components/Registers.tsx`. Quota: 1 hero per
invocation. A gold drop cap opens the first invocation paragraph of a chapter.

### Colour law
- **Gold = meaning / the sacred text.** Titles, hero lines, the ask.
- **Teal = doing / the intelligence reading you.** Eyebrows, practice cues,
  Morpho's margin notes, the "chapter asks" label.
- Never a teal glow on gold text. On dark grounds gold must be *brightened*
  (`color-mix` toward `#ffe9b0`), or it turns muddy and unreadable.

---

## 3. THE PAGE MODEL

**One beat = one screen = one page of the book.**

- Every beat is exactly `100dvh`. Content that runs longer is **paginated
  into multiple one-screen pages** (`paginate()` in `chaptersAdapter.ts`) —
  never a 2000px scroll wall. That wall was the "it just scrolls through
  bullshit" bug.
- `scroll-snap-type: y mandatory` + `scroll-snap-stop: always` — every page
  is a committed landing. You cannot blur past one.
- The writing prompt + desk appear on the **last page of a movement**, so the
  passage is finished before the reader is asked to write.

### Chapter structure
```
title card → invocation pages → 4 × movement (essay pages + prompt page)
           → threshold → outro (bridge to next chapter)
```

### The melt (the crossing)
The transition between pages. **This is the single most-rebuilt and
most-broken element — do not reinvent it.**

- Pure CSS, **zero JavaScript**. `view-timeline: --beat` on the beat,
  `animation-timeline: --beat` on the fixed `.beat-content`.
- Keyframe: `0%,100% { blur(.42rem) contrast(1.12); opacity:0; visibility:hidden }`
  · `46%,54% { blur(0) contrast(1); opacity:1; visibility:visible }`
- The tuning is **subtle** — a soft haze, no zoom transform. Values like
  "3.4rem blur / scale .88→1.16" are a wrong reconstruction; discard on sight.
- **Never put JS in the scroll loop.** Forwarding wheel deltas kills snap
  physics (frictionless whoosh). One-swipe-per-beat paging kills tactile
  scrolling. Native scroll physics *are* the feel.
- **Browser support is the catch:** scroll-driven animations are Chromium-only
  (Safari/Firefox need a polyfill). Where unsupported, the fallback must
  **un-pin** `.beat-content` to `position: static` — merely making it visible
  leaves every page `fixed` and stacks the whole book into one smear.

---

## 4. WRITING (the journal)

A cramped textarea is a promise about the expected answer — it says "one
sentence." Rejected.

- Touching the desk opens a **full-screen writing page**: the question shrinks
  to a quiet line at top and **fades to ~34% while typing**, returning on
  pause. Borderless — ink on paper, no box.
- Autosave; localStorage is the source of truth (guest mode).
- Tools at the bottom edge, in reach but out of the way, **44px targets**:
  **voice** (Web Speech with auto-restart stitching — long dictation must not
  silently die), **photo/scan** of a handwritten page, **Morpho** (opt-in
  reflection, never interrupting).
- Voice cleanup is an AI pass that fixes punctuation **without changing the
  user's words**.

---

## 5. MOTION & CEREMONY

- Motion is **ceremonial at thresholds, restrained everywhere else.**
- **No per-element stagger/fade-in on reveal** — it read as laggy and
  distracting. Content is solid the instant a beat is active; only the
  *crossing* animates.
- Chapter-to-chapter uses the existing `HorizonOverlay` breath (5s in / 5s out
  × 6, whisper reveal, hold-to-cross). It is good. Do not replace it.
- **Still to build:** the between-chapter "void" — a pause beat with a soft
  pulsing light in glowy aether before the next chapter.
- **Still to build:** the threshold crossing is currently *just a button*. It
  needs real somatic weight — timing, held press, felt commitment.

---

## 6. VOICE & COPY — HARD RULES

1. **Never invent copy.** The chapter `.md` files are canon. No paraphrasing
   canon into a "clearer" line, no invented labels, no restatements. If a
   field would need invented text, **leave it empty.**
2. Never label ceremonial beats ("an invocation," "the practice"). Make it
   *feel* that way through pacing and type; don't announce it.
3. Specific phrases that were invented and rejected — never reintroduce:
   "Practice", "the page is yours", "offer this page", "the old knowing",
   "I have crossed this threshold", "Record it / Perform it / Make it".
4. Buttons name the **action**, not the recipient ("turn this into story").
5. Plain UI words (`done`, `saved`) are fine — they don't pretend to be canon.

---

## 7. THE RUBRIC

Check any screen against this before calling it finished.

**Structure**
- [ ] Fits one screen (`100dvh`), no internal scroll wall
- [ ] Snaps and stops — a committed landing
- [ ] The crossing runs the melt (or degrades cleanly where unsupported)

**Type**
- [ ] Only the four locked faces; Optima for all body text
- [ ] Registers varied — not a uniform slab. At most one hero
- [ ] Gold = meaning, teal = doing. Gold legible on its ground

**Content**
- [ ] Text is verbatim canon from the `.md` files
- [ ] No invented labels or paraphrase
- [ ] Hypertext is **inline** (never end-cards) — see HYPERTEXT.md
- [ ] One Code + one Lore per movement

**Interaction**
- [ ] Writing opens the full page, not a box
- [ ] Touch targets ≥ 44px
- [ ] Reading is sharp and still; motion only at the crossing

**Robustness**
- [ ] Works on mobile *and* desktop widths
- [ ] Reduced-motion path exists
- [ ] Degrades readably where scroll-driven animation is unsupported
- [ ] Verified in the user's actual browser, not only Chromium

---

## 8. HARD-WON LESSONS

- **Port, don't reconstruct.** When a reference exists, recover the literal
  source (it may be in a session transcript) rather than rebuilding from a
  description. The melt was rebuilt wrong ~4 times this way.
- **Verify in the user's browser.** Chromium-only features made "verified
  working" claims false for an entire session.
- **A fixed layer is positioned against the viewport** — gestures over it go
  to the *document*, not a nested scroller. This is the root of nearly every
  "it won't scroll" bug here.
- **Beware ancestors:** `height`/`overflow:hidden` on `html`/`body`/`#root`/
  `.app`/`.stage` will silently cap the document to one screen.
- The preview harness reports `document.hidden`, which throttles rAF, smooth
  scrolling, IntersectionObserver, and scroll-timeline sampling. Structure can
  be verified there; **feel cannot.**
