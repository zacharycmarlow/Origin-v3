# THE ORIGIN — Inline Hypertext Spec

The authoritative reference for how Codex content (Code / Lore / Etymology)
is embedded in chapter prose. Read this before authoring or tagging any
chapter text.

---

## THE ONE RULE

**Hypertext is INLINE, woven into the prose. It is never a separate card,
footnote, sidebar, or end-of-section block.**

The reader is reading an essay. Certain phrases are *marked* — they glow,
or carry a highlighter, or a hand-drawn underline. Touching one opens an
overlay. The page stays exactly where it was; closing returns you to the
same line.

This has been regressed to "◇ The Science" end-cards more than once. Do not.

---

## THE THREE TYPES

| Type | Mark in the prose | Opens | Scope |
|---|---|---|---|
| **Etymology** | a single **gold glowing word** (always glowing) | crystal overlay: the word's root chain | ~1–2 per chapter |
| **Code** | a **gold highlighter** over a phrase | dark glassmorphic "lab" overlay + Explore refs | exactly 1 per movement |
| **Lore** | a **charcoal-teal pen underscribble** under a sentence | warm sepia paper overlay (real scanned paper) | exactly 1 per movement |

**Code** = the science. Neuroscience / prediction-engine research, cited,
each with a real "Explore" reading list.
**Lore** = the tradition. Cross-cultural convergence — many peoples
arriving independently at the same truth.
**Etymology** = a word the prose already lingers on, traced to its root.

Marks **draw once**, as you scroll to them (highlighter sweeps, underline
draws). Etymology glows permanently.

---

## MARKER SYNTAX

Written directly into `Movement.body` in `src/chapters-v2.ts`:

```
{code}the phrase that gets the highlighter{/code}

{lore}the sentence that gets the underscribble.{/lore}

{ety:persona|Persona}
```

- `{ety:KEY|DISPLAY}` — `KEY` must exist in that chapter's `etymologies`
  map; `DISPLAY` is what appears inline (so it can be capitalized/inflected).
- **Exactly ONE `{code}` and ONE `{lore}` per movement.** The Codex cards
  are fixed 1:1 to movements — a movement has one Code and one Lore, so the
  prose gets one of each mark.
- Mark the phrase the idea *already lives in*. Don't bolt a marker onto a
  sentence that isn't about that idea.

---

## DATA MODEL (`src/chapters-v2.ts`)

```ts
Chapter {
  roman, title, art, artSubtitle, tagline, palette,
  etymologies?: Record<string, Etymology>,   // keyed by the {ety:KEY}
  movements: Movement[],                     // always 4
  threshold: Threshold,
  outro: Outro,
}

Movement {
  slug, title, focus,
  body,      // essay prose WITH the inline markers
  prompt,    // the writing prompt
  key,       // localStorage key for the reader's writing
  code?: Codex,   // { kind:'code', title, body, explore?: Reference[] }
  lore?: Codex,   // { kind:'lore', title, body }
}

Etymology { word, chain: [{ lang, form, gloss }], note }
Reference { who, what, where?, note? }   // the Explore list on a Code
```

`code`/`lore` are optional **only** because Chapters II–VII aren't tagged
yet. Every movement should end up with both.

---

## HOW IT RENDERS

1. `chaptersAdapter.ts` maps a v2 Chapter → the legacy Scene model the app
   already runs on, and **paginates** each movement's prose into
   one-screen pages (one passage per page, like turning pages in a book).
   The writing prompt + desk appear on the movement's **last** page.
2. `Scene.tsx` → `renderV2Prose()` parses the markers out of the body and
   wraps each in `PortalCode` / `PortalLore` / `PortalEty`.
3. `Portal.tsx` renders the mark inline, and the overlay through
   `createPortal(document.body)` — required, because the beat engine uses
   transforms and a transformed ancestor traps `position: fixed`.
4. Draw-once is an `IntersectionObserver` (`usePortalMark`) that sets
   `data-drawn="true"` on the mark.

**Pagination consequence:** a movement's `code`/`lore` are passed to all of
its pages, but the portal only renders on the page whose text actually
contains the marker. So it doesn't matter which page a marker lands on.

Lore paper texture: `public/textures/lore-paper.jpg` (Indieground vintage
paper #01, downscaled to 1400px @ q68 ≈ 192KB — never ship the 15MB
originals).

---

## CURRENT STATUS

| Chapter | Prose | Hypertext tagged |
|---|---|---|
| I · The Opening | older worksheet version — **needs updating to FINAL** | ✅ 4 Code + 4 Lore + `persona` etymology |
| II–VII | ✅ from the FINAL .md files | ❌ **not tagged yet** |

The full Codex is **56 cards: 28 Code + 28 Lore**, 1:1 with the 28
movements (7 chapters × 4). Chapter I's 8 are authored; 48 remain.

Also still untagged: etymologies for II–VII (~1–2 per chapter, chosen from
words the prose already dwells on).

---

## AUTHORING RULES

1. **Never invent copy.** The chapter .md files are canon. Don't paraphrase
   a line into a new one, don't write new labels, don't restate an
   instruction "more clearly." If a field would need invented text, leave
   it empty.
2. **Inline only** — see THE ONE RULE.
3. One Code + one Lore per movement, no more.
4. Etymology only for words the prose already lingers on.
5. Code needs real citations in `explore` — actual papers/books, with
   author, title, venue/year, and a short note on why it matters.
