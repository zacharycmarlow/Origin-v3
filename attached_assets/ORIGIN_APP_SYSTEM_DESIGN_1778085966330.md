# THE ORIGIN — APP SYSTEM DESIGN
## Architecture, Interface, Prompts, and Character Interactions

---

## THE EXPERIENCE FLOW

### Overview

The person moves through seven chapters. Each chapter has four beats. Each beat follows a fixed rhythm. After completing a chapter's four beats, the person enters a reading and integration sequence before the next chapter opens.

The full flow for one chapter:

```
CHAPTER OPENS → chapter intro text

  BEAT 1 → setup · code · practice prompt · lore · story prompt → WRITE
  BEAT 2 → setup · code · practice prompt · lore · story prompt → WRITE
  BEAT 3 → setup · code · practice prompt · lore · story prompt → WRITE
  BEAT 4 → setup · code · practice prompt · lore · story prompt → WRITE

MINI-JOURNAL VIEW → all four responses visible together for the first time
  🦋 MORPHO → marginal notes + through-line + subtext
  🧭 SAGE → resonance + personalized codes/lore
  🌅 HORIZON → coherence breath + integration

NEXT CHAPTER OPENS
```

After Chapter VII, the cumulative reading replaces the standard chapter reading.

---

## CHAPTER EXPERIENCE

### Beat Flow

Each beat is a tile or card the person swipes through. The content loads progressively — the person doesn't see the whole beat at once. They move through it:

**1. Section title and thread label**
The evocative title (large, clear) with the thread and brief orienting sentence below (small, quiet). This tells the person where they are and what thread they're in.

**2. Setup prose**
The voice of the guide orienting them to this specific territory. This scrolls naturally — the person reads at their own pace.

**3. [CODE]**
The Code appears as a distinct visual element — teal left border, the label in small caps. In light mode (default), the Code is the 2-3 sentence version from v9. A subtle expand indicator shows there's more available.

If the person taps to expand, the full 300-500 word version from the archive loads inline — the deep science, multiple studies, the full mechanism explained. This collapses back when tapped again.

**4. Practice prompt**
After the Code, a practice prompt — the perceptual shift or skill application that lets them embody what the Code just taught. This is distinct from the story prompt. It's a doing prompt, not a writing prompt. "Breathe into where the tension lives." "Pick one chapter that felt like a disaster. Hold it in the question: what was this steering them toward?"

**5. [LORE]**
The Lore appears as a distinct visual element — gold left border, the label in small caps. Same expand/collapse as the Code. Light mode shows the 2-3 sentence version. Expand shows the full 300-500 word version from the archive.

**6. Story prompt**
The writing prompt. Open, inviting, specific enough to direct but broad enough to allow. This is what the person writes in response to.

**7. [WRITE HERE]**
The writing space. Full screen available. The person writes as much as they want. Auto-saves.

### Navigation

The person can move back and forth between beats within a chapter. They can return to previous chapters. Writing is preserved and editable at any time. The mini-journal view is accessible at any point for any completed chapter.

---

## THE MINI-JOURNAL VIEW

When a chapter's four beats are complete, the interface shifts. The four responses appear together — stacked vertically, each one labeled with its section title and thread. For the first time the person sees what they wrote across the four beats as a unified document.

This view is editable. The person can revise, add, fill gaps they now see. The writing is live.

Two icons appear in the interface:

🦋 (butterfly) — activates the Morpho
🧭 (compass) — activates the Sage

The person can activate either or both, in any order. They can also simply read their four responses without activating either character.

---

## 🦋 THE MORPHO

### When Activated

The person taps the butterfly icon from the mini-journal view.

### What It Receives (API call)

```json
{
  "system": "[MORPHO SYSTEM PROMPT]",
  "messages": [
    {
      "role": "user",
      "content": "Chapter [N]: [Chapter Title]\n\nBeat 1 — [Section Title] ([Thread]):\n[person's writing]\n\nBeat 2 — [Section Title] ([Thread]):\n[person's writing]\n\nBeat 3 — [Section Title] ([Thread]):\n[person's writing]\n\nBeat 4 — [Section Title] ([Thread]):\n[person's writing]\n\n[If chapters 2-7, include previous chapter writings and Morpho readings for cross-chapter memory]"
    }
  ]
}
```

### What It Produces

**Marginal notes** (3-6 per chapter)
Each note has:
- A citation: the exact phrase from the person's writing being responded to
- An insight: 1-3 sentences on what the Morpho sees in that phrase

**The Through-line** (3-5 sentences)
The unifying force running through the four pieces. What the chapter is actually about underneath what was written.

**The Subtext** (2-4 sentences)
What the writing is really about when the writer doesn't know yet. Gaps, avoidances, contradictions between beats.

### How It Displays

The marginal notes appear alongside the person's writing in the mini-journal view — positioned next to the specific passages they reference. They appear with a subtle animation, as if annotations are being written in real time.

The Through-line and Subtext appear below the mini-journal as a synthesis, under the 🦋 header.

### Interface Behavior

- The Morpho reading is saved and accessible whenever the person returns to that chapter's mini-journal
- If the person edits their writing after the Morpho reading, a subtle indicator suggests re-running the Morpho to reflect the updated writing
- The Morpho reading feeds into the Sage as input (the Sage receives both the writing and the Morpho's reading)

---

## 🧭 THE SAGE

### When Activated

The person taps the compass icon from the mini-journal view. The Sage can be activated before or after the Morpho, but produces richer output when the Morpho has already run (because it receives the Morpho's reading as additional input).

### What It Receives (API call)

```json
{
  "system": "[SAGE SYSTEM PROMPT]",
  "messages": [
    {
      "role": "user", 
      "content": "Chapter [N]: [Chapter Title]\n\nBeat 1 — [Section Title] ([Thread]):\n[person's writing]\n\nBeat 2 — [Section Title] ([Thread]):\n[person's writing]\n\nBeat 3 — [Section Title] ([Thread]):\n[person's writing]\n\nBeat 4 — [Section Title] ([Thread]):\n[person's writing]\n\n---\n\nMorpho Reading:\nThrough-line: [Morpho's through-line]\nSubtext: [Morpho's subtext]\n\n[If chapters 2-7, include previous Sage readings for cross-chapter continuity]"
    }
  ]
}
```

### What It Produces

**The Resonance** (150-250 words)
The specific mythic patterns, traditions, and scientific mechanisms that speak to what this person wrote. Science and myth woven together. Dense, precise, drawing from encyclopedic knowledge. The Sage goes beyond any listed reference set — if the person's writing resonates with an obscure Polynesian navigation practice or a specific piece of intergenerational epigenetics research, it goes there.

**Personalized Code** (1-2 entries, 50-100 words each)
The specific scientific finding or mechanism most relevant to this person right now. May come from the archive or from the Sage's broader knowledge. Includes the finding, the researcher, and why it matters for this specific person.

**Personalized Lore** (1-2 entries, 50-100 words each)
The specific tradition, myth, or practice that carries the deepest resonance. Same — may come from the archive or beyond. Includes the tradition entered with enough depth to feel it, and why it matters for this person.

### How It Displays

The Sage's output appears in a distinct visual space from the Morpho's — a different section of the reading view, with the compass icon as header. The visual treatment reflects the different register: denser typography, more weight, the feel of a scholar's annotation rather than a friend's margin note.

The Personalized Code and Lore entries display as expandable cards below the Resonance. Each card shows the title and the one-sentence personal relevance line. Tapping expands to the full entry.

### Interface Behavior

- The Sage reading is saved alongside the Morpho reading
- Over seven chapters, the personalized Codes and Lore accumulate into a "Personal Codex" — a tab or section where all the Sage's personalized recommendations are collected as the person's curated library
- The Sage reading feeds into the Horizon integration

### The Sage's Voice in the Interface

The Sage's text should feel visually different from the Morpho's. Consider:
- Slightly different typography (denser, more weight)
- Different background treatment (subtle texture, depth)
- The compass icon as a persistent marker
- The register difference should be felt before a word is read — the visual design signals "this is a different kind of intelligence speaking"

---

## 🌅 THE HORIZON

### What It Is

The Horizon is the integration moment between chapters. It is an embodied practice, not a reading. It comes after the Morpho and Sage have delivered their insights and uses the coherence breath to install those insights in the body.

### When It Activates

After the person has received the Morpho and/or Sage readings and is ready to move forward. The Horizon can be:
- Automatically triggered when the person navigates toward the next chapter
- Manually activated via the Horizon icon
- Skippable (but encouraged)

### The Experience

**1. Visual transition**
The interface shifts. The reading view fades. Something opens — a wider visual field, a gradient, a sky, a horizon line. The feel changes from interior (reading, reflecting) to expansive (integrating, settling).

**2. Coherence breath — guided**
A visual breath guide appears — an expanding/contracting circle, a pulse of light, or a wave. The rhythm: 5 seconds in, 5 seconds out. The person breathes with it for several cycles (suggested: 6-10 cycles, roughly 60-100 seconds).

No text during the breathing. Just the visual guide and the breath.

**3. Integration prompt**
After the breathing cycles complete, a brief personalized integration text appears. This is generated by a light API call that receives the Morpho and Sage outputs and produces 2-4 sentences of integration framing.

The voice is neither the Morpho's nor the Sage's. It is quieter than both. Intimate. The whisper after the conversation, not a new conversation.

**4. Silence**
A pause. The screen holds. The person sits in what arrived. When they are ready, they move forward.

**5. Threshold**
The next chapter opens.

### The Integration Prompt (API call)

This is a lightweight call — not a full character, just a tonal instruction.

```json
{
  "system": "You generate a brief integration prompt for someone who has just completed a chapter of The Origin guide and received readings from the Morpho (reflective mirror) and the Sage (mythic/scientific resonance). They are now doing coherence breathing (5 in, 5 out) to integrate what they learned.\n\nYour output is 2-4 sentences. Intimate, quiet, embodied. Not analytical, not prophetic. The register of a whisper after a deep conversation. You reference one specific thing from the Morpho's through-line or the Sage's resonance and invite the person to feel where it lives in the body. You are helping them take what was intellectual and make it somatic.\n\nExamples:\n'Breathe into the word you kept returning to. Feel where the through-line lives in the body. Let it settle before you name it.'\n'The pattern the Sage named has been running longer than your biography. As you breathe, feel the weight of that — how much older this is than what happened to you. Let the body hold what the mind just understood.'\n'The subtext is always in the body first. Breathe into the gap the Morpho found. Not to fill it. To feel what lives there.'",
  "messages": [
    {
      "role": "user",
      "content": "Chapter just completed: [N] — [Title]\n\nMorpho Through-line: [text]\nMorpho Subtext: [text]\nSage Resonance summary: [1-2 key points]\n\nGenerate the integration prompt."
    }
  ]
}
```

### Interface Design Notes for the Horizon

- The breath guide should be beautiful. This is the most designed moment in the app. The visual quality here communicates: this matters.
- No skip option during the breath (or the skip is deliberately inconvenient — you have to hold to skip). The breath is the work.
- The integration text appears slowly — word by word or line by line — at a reading pace that matches the coherence breath rhythm.
- The transition into the next chapter should feel like a threshold being crossed, not a page being turned. A fade, a dissolve, a slow opening.

---

## AFTER CHAPTER VII — THE CUMULATIVE READING

After the final chapter's four beats are complete and the person has seen their mini-journal, a different experience begins. This is the full reading — the human-design-chart output. Both characters produce their cumulative versions.

### Cumulative Morpho (400-600 words)

Receives: all 28 pieces of writing, all 7 chapter Morpho readings.

Produces:
- **The Character Arc** — who this person has been across the full journey, drawn from their words
- **The Subtext** — the patterns across all seven chapters that the person consistently wrote around
- **The Thread** — the single thread from Prologue through Ending. One paragraph. The synthesis.

### Cumulative Sage (600-800 words)

Receives: all 28 pieces of writing, all 7 Morpho readings, all 7 Sage readings.

Produces:
- **The Mythic Pattern** — which archetypal story their life is following. This is the "chart." Deep, specific, connecting to particular traditions and figures. The recognition the person has been waiting for without knowing they were waiting.
- **The Authored Narrative** — the narrative system their writing reveals. The source they named, the dream they authored, the framework for meaning emerging. Seen through the lens of traditions and science.
- **The Personal Codex** — the full curated collection of all personalized Codes and Lore from across seven chapters, organized as a curriculum. The person's specific pathway through the archive.

### Cumulative Horizon

A final integration breath. Longer — perhaps 10-15 cycles. The integration prompt references the full arc rather than a single chapter. The person sits in the silence after the whole journey. Then the Ending section of the guide loads — the "What Comes Next" passage about the Metamyth Journey.

---

## THE JOURNAL

### What It Is

The complete record of the person's Origin work. Always accessible. Always editable.

### Contents

- All 28 pieces of writing, organized by chapter and beat
- All 7 Morpho readings (marginal notes, through-lines, subtexts)
- All 7 Sage readings (resonances, personalized codes/lore)
- The cumulative Morpho reading
- The cumulative Sage reading
- The Personal Codex (all personalized entries accumulated across chapters)

### The Last Page

The last page of the journal is the gathering — the full origin story from the Ending chapter's second beat. This page is prominently editable. The person can see their full arc story here and revise it, refine it, add to it. This is the living document — the origin story they carry forward.

### Export

The journal exports as a PDF or docx. Clean formatting. The person's writing with the readings interspersed. The Personal Codex as an appendix. The gathering story as the final page.

---

## LIGHT MODE / HEAVY MODE

### Light Mode (Default)

The guide text from v9. Codes are 2-3 sentences. Lore is 2-3 sentences. The experience moves. The person can complete the whole guide in 60-90 minutes.

### Heavy Mode (Expandable)

Each Code and Lore has an expand indicator. Tapping opens the full 300-500 word version from the archive. The person goes deeper on whatever interests them without being required to read everything.

### Implementation

This is not a global toggle. It is per-element expansion. Each Code and each Lore has its own expand/collapse. The person is in light mode by default and dives into heavy mode on any individual element that catches them. This is the most natural reading behavior — scan, catch interest, dive in, return to flow.

---

## CONTENT ARCHITECTURE

### Static Content (loaded with the app)

- Guide text: v9 (opening, chapter intros, section setups, practice prompts, story prompts, transitions)
- Light Codes: 28 entries, 2-3 sentences each
- Light Lore: 28 entries, 2-3 sentences each
- Expanded Codes: 28 entries, 300-500 words each (archive)
- Expanded Lore: 28 entries, 300-500 words each (archive)

### Dynamic Content (generated per user)

- Morpho readings: 7 chapter readings + 1 cumulative (API calls)
- Sage readings: 7 chapter readings + 1 cumulative (API calls)
- Horizon integration prompts: 7 between chapters + 1 final (API calls)
- Total API calls per complete journey: approximately 23

### Data Stored Per User

- 28 writing responses
- 7 Morpho readings
- 7 Sage readings
- 7 integration prompts
- 1 cumulative Morpho reading
- 1 cumulative Sage reading
- 1 final integration prompt
- Personal Codex (accumulated personalized entries)
- Edit history (if implemented)

---

## PROMPT SUMMARY

### Morpho System Prompt
See: MORPHO_SYSTEM_PROMPT.md
Voice: Warm, specific, reflective. A wise friend reading your journal.
Outputs: Marginal notes, Through-line, Subtext.

### Sage System Prompt  
See: THE_SAGE_SYSTEM_PROMPT.md
Voice: Dense, fierce, prophetic. McCarthy/Faulkner register. Science and myth in the same breath.
Outputs: Resonance, Personalized Codes, Personalized Lore.

### Horizon Integration Prompt
Lightweight inline prompt (see above). 
Voice: Intimate, quiet, embodied. A whisper after a deep conversation.
Output: 2-4 sentences of integration framing.

### Cumulative Prompts
Extended versions of the Morpho and Sage prompts with instructions for full-journey synthesis. Same voices, wider scope, deeper synthesis. These are appended to the standard system prompts when the cumulative reading is triggered after Chapter VII.

---

## CHARACTER INTERACTION MAP

```
PERSON'S WRITING
      │
      ├──→ 🦋 MORPHO (reads writing)
      │         │
      │         ├──→ Marginal Notes
      │         ├──→ Through-line  
      │         └──→ Subtext
      │                │
      │                ▼
      └──→ 🧭 SAGE (reads writing + Morpho output)
                │
                ├──→ Resonance
                ├──→ Personalized Codes
                └──→ Personalized Lore
                       │
                       ▼
              🌅 HORIZON (receives Morpho + Sage summaries)
                │
                ├──→ Coherence Breath (5 in / 5 out)
                ├──→ Integration Prompt (2-4 sentences)
                └──→ Silence → Threshold → Next Chapter
```

The Morpho runs first. The Sage receives the Morpho's output as context. The Horizon receives summaries from both. Each builds on the previous, creating a layered reading experience that deepens as it progresses.

---

## DESIGN PRINCIPLES

**The guide moves. The readings land. The breath integrates.** Three different speeds, three different modes of engagement. The guide is forward momentum. The readings are vertical depth. The breath is somatic integration. The app should feel different in each mode — kinetic during the beats, contemplative during the readings, still during the breath.

**Two voices, not one.** The Morpho and Sage should feel like encountering two different intelligences. The visual design should support this before a word is read. Different typography, different spacing, different background treatment. When the person moves from the Morpho to the Sage, they should feel the register shift in the design before they feel it in the language.

**The breath is the most important moment.** Everything builds toward it. The writing is raw material. The readings are insight. The breath is installation. Without the breath, the insights stay cognitive. With it, they become somatic. The breath guide should be the most beautiful, most carefully designed element in the entire app.

**The journal is alive.** The person can return to any chapter, any response, any reading at any time. The journal is not an artifact produced at the end. It is a living document that evolves as the person revises, adds, and deepens their responses. The cumulative reading updates if the person significantly revises their writing.

**The Personal Codex accumulates.** Each Sage reading adds entries to the person's codex. By the end of the journey, they have a curated library of 7-14 personalized Codes and Lore entries that speak specifically to their arc. This is the "take-home" — the personalized curriculum they carry forward.

**Earn every API call.** Each of the ~23 API calls produces something the person receives as valuable. No wasted computation. No generated text that exists for structural reasons but doesn't serve the person. Every output should make the person feel more seen, more connected, or more ready.
