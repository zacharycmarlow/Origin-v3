/* ═══════════════════════════════════════════════════════════════
   Adapter — v2 Chapter (Movement model) → legacy Chapter (Scene model).

   Lets the whole existing app (App.tsx, BeatStage, Spine, completion,
   cumulative reading, palette) keep working unchanged while the new
   worksheet content + inline-portal reading model flows through it.

   A v2 chapter becomes a legacy chapter whose scenes are:
     [ movement×4 (kind 'prompt', v2 body with markers),
       threshold (kind 'threshold', v2 voice/action) ]
   and whose `transition` is the chapter outro.
   ═══════════════════════════════════════════════════════════════ */

import { Chapter as LegacyChapter, Scene as LegacyScene } from './chapters';
import { Chapter as V2Chapter } from './chapters-v2';

/* Split a movement's essay into ONE-SCREEN pages.

   This is the fix for "it just scrolls through bullshit." A movement body
   runs 1700–5500 characters, which rendered as a single 2300px beat in a
   714px viewport — three screens tall. Beats that don't fit one screen are
   marked `.beat--tall`, and tall beats are EXCLUDED from the melt and from
   scroll-snap-stop, so every actual chapter beat had no transition and no
   landing: an endless scroll through a wall of text.

   The melt only works on content that fits one screen (that constraint is
   inherent to the approved reference — fixed content dissolved by its own
   section's scroll progress). So instead of exempting long prose, we
   paginate it: one paragraph per page, like turning pages in a book. Each
   page is its own beat, so each one lands, holds, and melts into the next.

   Only the LAST page of a movement carries the writing prompt + desk, so
   the reader finishes the passage before being asked to write. */
function paginate(body: string): string[] {
  const paras = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const pages: string[] = [];
  let buf = '';
  const BUDGET = 620;   // conservative: comfortably inside one screen
  for (const p of paras) {
    if (!buf) { buf = p; continue; }
    if (buf.length + p.length + 2 <= BUDGET) buf += '\n\n' + p;
    else { pages.push(buf); buf = p; }
  }
  if (buf) pages.push(buf);
  return pages.length ? pages : [body];
}

export function adaptV2Chapter(v2: V2Chapter): LegacyChapter {
  const movementScenes: LegacyScene[] = v2.movements.flatMap((m) => {
    const pages = paginate(m.body);
    return pages.map((page, pi) => {
      const last = pi === pages.length - 1;
      return {
        kind: 'prompt',
        /* title/eyebrow only on the opening page — continuation pages are
           the same movement continuing, not a new one */
        title: pi === 0 ? m.title : undefined,
        subtitle: pi === 0 ? m.focus : undefined,
        body: page,                       // carries {code}/{lore}/{ety} markers
        code: m.code,                     // portal renders only if its marker is on THIS page
        lore: m.lore,
        /* the desk waits for the end of the passage */
        ask: last ? m.prompt : undefined,
        key: last ? m.key : undefined,
        v2: true,
        etymologies: v2.etymologies,
        codeCite: 'code · the science',
        loreCite: 'lore · the tradition',
      } as LegacyScene;
    });
  });

  const thresholdScene: LegacyScene = {
    kind: 'threshold',
    label: 'Threshold',
    body: v2.threshold.body,
    ask: v2.threshold.prompt,
    key: `${v2.roman.toLowerCase()}_threshold`,
    v2: true,
    // carry the threshold kind so the renderer can pick the right affordance
    subtitle: v2.threshold.kind,
  };

  return {
    roman: v2.roman,
    title: v2.title,
    subtitle: v2.tagline,
    palette: v2.palette,
    invocation: v2.invocation ?? '',
    transition: v2.outro.body,
    scenes: [...movementScenes, thresholdScene],
    locked: v2.locked,
  };
}
