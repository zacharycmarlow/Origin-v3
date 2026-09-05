import {
  useRef, useEffect, useMemo, forwardRef, useImperativeHandle, useCallback, useState,
} from 'react';
import { Chapter } from '../chapters';
import SceneComponent from './Scene';
import ChapterGate from './sections/ChapterGate';
import AiReadingSection from './sections/AiReadingSection';
import ChapterTransition from './sections/ChapterTransition';
import InlineStreamSection from './sections/InlineStreamSection';
import InlineBodySection from './sections/InlineBodySection';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';
import MetamythInvite from './MetamythInvite';
import OriginStoryReveal from './OriginStoryReveal';
import BirthGate from './BirthGate';
import SavedPulse from './SavedPulse';
import { isChapterComplete, getReading } from '../storage';

/* ═══════════════════════════════════════════════════════════════
   THE BEAT STAGE — the journey as discrete, crossed beats.

   Structural port of the old continuous ScrollJournal: same beat
   kinds, same external contract (props/ref) so App.tsx is
   untouched, but the container mechanics are the scroll-snap +
   view-timeline engine (see index.css "THE BEAT ENGINE") instead
   of one long scroll with an IntersectionObserver fade-in.

   Content refinement (splitting scenes into their own question-
   events, the chapter-end gate+reading, tool beats) is the next
   layer — this proves the engine with faithful content first.
   ═══════════════════════════════════════════════════════════════ */

type BeatData =
  | { id: string; kind: 'prelude-arrival' }
  | { id: string; kind: 'prelude-invocation' }
  | { id: string; kind: 'prelude-note' }
  | { id: string; kind: 'prelude-birth' }
  | { id: string; kind: 'prelude-road' }
  | { id: string; kind: 'chapter-gate'; chapterIdx: number }
  | { id: string; kind: 'scene'; chapterIdx: number; sceneIdx: number }
  | { id: string; kind: 'stream-section'; chapterIdx: number }
  | { id: string; kind: 'body-section'; chapterIdx: number }
  | { id: string; kind: 'ai-reading'; chapterIdx: number }
  | { id: string; kind: 'chapter-transition'; chapterIdx: number }
  | { id: string; kind: 'epilogue' };

const PRELUDE_KINDS = new Set<BeatData['kind']>([
  'prelude-arrival', 'prelude-invocation', 'prelude-note', 'prelude-birth', 'prelude-road',
]);

function buildBeats(chapters: Chapter[]): BeatData[] {
  const out: BeatData[] = [
    { id: 'beat-prelude-arrival', kind: 'prelude-arrival' },
    { id: 'beat-prelude-invocation', kind: 'prelude-invocation' },
    { id: 'beat-prelude-note', kind: 'prelude-note' },
    { id: 'beat-prelude-birth', kind: 'prelude-birth' },
    { id: 'beat-prelude-road', kind: 'prelude-road' },
  ];
  chapters.forEach((ch, ci) => {
    out.push({ id: `beat-gate-${ci}`, kind: 'chapter-gate', chapterIdx: ci });
    if (!ch.locked) {
      ch.scenes.forEach((__, si) => {
        out.push({ id: `beat-scene-${ci}-${si}`, kind: 'scene', chapterIdx: ci, sceneIdx: si });
      });
      // The free-form stream + body-check-in beats belong to the OLD
      // card-deck chapters — they have no connection to the v2 worksheet
      // model (movements → threshold → outro) and land as two orphaned,
      // disconnected beats right after a v2 chapter's threshold. Only
      // append them for chapters still on the legacy content model.
      const isV2 = ch.scenes.some(s => s.v2);
      if (!isV2) {
        out.push({ id: `beat-stream-${ci}`, kind: 'stream-section', chapterIdx: ci });
        out.push({ id: `beat-body-${ci}`, kind: 'body-section', chapterIdx: ci });
      }
      out.push({ id: `beat-reading-${ci}`, kind: 'ai-reading', chapterIdx: ci });
      if (ci < chapters.length - 1) {
        out.push({ id: `beat-trans-${ci}`, kind: 'chapter-transition', chapterIdx: ci });
      }
    }
  });
  out.push({ id: 'beat-epilogue', kind: 'epilogue' });
  return out;
}

/* ─── Compass glyph (unchanged) ───────────────────────────────── */
function CompassGlyph({ size = 100 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="26" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      {[0, 60, 120, 180, 240, 300].map(a => {
        const r1 = 26, r2 = 54;
        const rad = (a * Math.PI) / 180;
        return (
          <line key={a}
            x1={60 + Math.cos(rad) * r1} y1={60 + Math.sin(rad) * r1}
            x2={60 + Math.cos(rad) * r2} y2={60 + Math.sin(rad) * r2}
            stroke="currentColor" strokeWidth=".4" />
        );
      })}
    </svg>
  );
}

/* ─── Prelude beats — split into discrete crossings ──────────────
   arrival (the invocation) → note (the warning) → birth (the quiet
   archetype intake) → road (the map + begin) — four separate events
   instead of one long undifferentiated scroll. ───────────────────── */
function PreludeArrivalBeat() {
  return (
    <div className="sj-prelude-inner sj-prelude-inner--arrival">
      {/* The title card lands as impact, one clean screen — the invocation
          prose is its own beat now, so page one melts on the first scroll
          instead of trapping you in a wall of internal scroll. */}
      <div className="prelude-glyph"><CompassGlyph size={80} /></div>
      <div className="prelude-eyebrow">A guide for becoming the author of your reality.</div>
      <h1 className="prelude-title">THE ORIGIN</h1>
      <div className="op-big">The world is made of stories.</div>
      <div className="op-echo">So are you.</div>
      <div className="op-rule" />
      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-cue-label">scroll to begin</span>
        <span className="scroll-cue-arrow">⌄</span>
      </div>
    </div>
  );
}

function PreludeInvocationBeat() {
  return (
    <div className="sj-prelude-inner">
      {/* The full invocation, set as editorial prose. */}
      <div className="inv-prose">
        <p className="drop">
          The magic of story is the power to create worlds with words. Since humans gathered around the fire at the dawn of time and spoke all that came to pass into motion. We all live and breathe stories, to get through the bad times and immortalize the good. We tell stories, all day every day.
        </p>
        <p>
          Authoring the next moment before it arrives. Running a story so vivid and so constant that you believed it, and it became the world.
        </p>
        <p>
          The same process that makes you laugh and cry at a movie creates your mind, your moods, your life. The same operating system runs the money, the nations, the news, the whole towering production of human civilization.
        </p>
        <p>You will learn how by practicing on the most precious story ever told: you.</p>
        <p>
          The promise of this book is exact. Rewrite your life. Reprogram your nervous system around a story you actually choose. Then live it, until the story and the life are the same thing.
        </p>
        <p>
          Seven chapters. Seven arts of storytelling: film, the novel, poetry, scripture, mythology, adventure, the spoken word. The journey moves backward through the history of how humans learned to tell stories, from the screen to the fire. Each one ancient. Each one dangerous. At every layer, a deeper truth about how story creates reality. By the end you hold all seven, proven in your body, braided into a voice that cannot be faked: yours.
        </p>
        <p>
          You cannot change what happened to you. You decide what it means, and the meaning changes everything downstream.
        </p>
        <p className="weight">The pen has been in your hand the whole time.</p>
        <p>Let this be an ending. And a beginning.</p>
      </div>
    </div>
  );
}

function PreludeNoteBeat() {
  return (
    <div className="sj-prelude-inner">
      <div className="prelude-note-block">
        <p className="prelude-note-heading">A note before you begin</p>
        <p className="prelude-body">
          Stories make the world and they can break it too. Everyone who has walked this path has been changed by it. The power you are about to access runs on the same science as psychedelic experiences, religious conversion, and full nervous system rewiring. People have wept through these pages. Screamed. Found their purpose. Restructured their lives. Take it seriously.
        </p>
        <p className="prelude-body">
          The only thing between you and that power is shame, doubt, and your own resistance to the size of what you actually are. Shame will show up in every chapter wearing a different costume: minimizing, performing prior healing, retreating into privacy, collapsing into nihilism. Each time, it is the old story's immune system doing its job. Each time, it is proof you are close. Name it. Keep going.
        </p>
      </div>
    </div>
  );
}

function PreludeBirthBeat() {
  return (
    <div className="sj-prelude-inner">
      <BirthGate />
    </div>
  );
}

function PreludeRoadBeat({ onScrollToJourney }: { onScrollToJourney: () => void }) {
  return (
    <div className="sj-prelude-inner">
      <div className="prelude-road-block">
        <p className="prelude-road-heading">The Road</p>
        <ol className="prelude-road-list">
          <li><span className="prelude-road-roman">I</span><span className="prelude-road-text">The Opening — See the story you have been living inside.</span></li>
          <li><span className="prelude-road-roman">II</span><span className="prelude-road-text prelude-road-locked">The Conflict — Face the challenges that make the story interesting.</span></li>
          <li><span className="prelude-road-roman">III</span><span className="prelude-road-text prelude-road-locked">The Twist — Turn everything you survived into gold.</span></li>
          <li><span className="prelude-road-roman">IV</span><span className="prelude-road-text prelude-road-locked">The Source — Touch the source code of what you are.</span></li>
          <li><span className="prelude-road-roman">V</span><span className="prelude-road-text prelude-road-locked">The Reveal — See through the mythology and rewrite it.</span></li>
          <li><span className="prelude-road-roman">VI</span><span className="prelude-road-text prelude-road-locked">The Dream — Enter the adventure of your own future.</span></li>
          <li><span className="prelude-road-roman">VII</span><span className="prelude-road-text prelude-road-locked">The Return — Bring the story back and make it real.</span></li>
        </ol>
      </div>
      <button className="primary-btn" onClick={onScrollToJourney}>
        <span className="label">begin</span>
      </button>
    </div>
  );
}

/* ─── Epilogue beat ────────────────────────────────────────────── */
function EpilogueBeat({
  chapters, onRestart, onCumulative, hasCumulative, generatingCumulative, sharingShown,
}: {
  chapters: Chapter[];
  onRestart: () => void;
  onCumulative: () => void;
  hasCumulative: boolean;
  generatingCumulative: boolean;
  sharingShown: boolean;
}) {
  return (
    <div className="tile tile-epilogue">
      <div className="tile-inner">
        <div className="prelude-glyph">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth=".4" />
            <circle cx="60" cy="60" r="3" fill="currentColor" />
            <path d="M20 60 Q60 20 100 60 Q60 100 20 60" fill="none" stroke="currentColor" strokeWidth=".4" />
          </svg>
        </div>
        <div className="prelude-eyebrow">what comes next</div>
        <h1 className="prelude-title">CHAPTER ONE</h1>
        <div className="prelude-sub">everything you uncovered is chapter one</div>
        <p className="prelude-body">
          You have walked the Origin. Seven chapters. Seven codes. Seven thresholds crossed. The old story honored, felt, and closed.
        </p>
        <div className="epilogue-honest">
          <div className="epilogue-honest-label">a word of honesty</div>
          <p className="epilogue-honest-body">
            The power you just accessed — the capacity to see your life as sacred, to author the narrative that generates your identity, to dream with the kind of conviction that recruits biology — this power is real. And it is powerful enough to be dangerous. People who mythologize their own lives without a container can spiral. The distance between sacred purpose and delusion is shorter than it appears from the outside. Psychosis, inflation, narcissism, messianic thinking — these are not the opposite of what you just did. They are what happens when you do this work without community, without accountability, without a tradition or a teacher or a circle that can reflect you back to yourself when the story begins to serve the ego rather than the life. The work needs a container. That container is other people.
          </p>
        </div>
        <p className="prelude-body">
          The Origin opened a door. You have been working at the level of identity — the narrative layer where who you believe yourself to be is constructed and reconstructed.
        </p>
        <p className="prelude-body dim">The Metamyth Journey is where the personal story meets the larger one.</p>
        <div className="epilogue-fire">
          <p>You are part of the great story — the one that started around the first fires, when the first storytellers gathered the first listeners and spoke the first worlds into being.</p>
        </div>
        <p className="prelude-body epilogue-tagline">The future we dream is one story away.</p>
        <OriginStoryReveal chapters={chapters} />
        <div className="epilogue-actions">
          <button className="primary-btn" onClick={onCumulative} disabled={generatingCumulative}>
            <ButterflyIcon size={18} />
            <CompassIcon size={18} />
            <span className="label">
              {generatingCumulative ? 'reading the whole arc…' : hasCumulative ? 'open the cumulative reading' : 'receive the cumulative reading'}
            </span>
          </button>
          <button className="btn-ghost" onClick={onRestart}>
            <span className="label">return to the origin</span>
          </button>
        </div>
        {sharingShown && <MetamythInvite />}
      </div>
    </div>
  );
}

/* ─── Scene beat ──────────────────────────────────────────────── */
function SceneBeat({ chapterIdx, sceneIdx, chapters }: {
  chapterIdx: number; sceneIdx: number; chapters: Chapter[];
}) {
  const [savedTrigger, setSavedTrigger] = useState(0);
  const handleSave = useCallback(() => setSavedTrigger(t => t + 1), []);

  const ch = chapters[chapterIdx];
  const scene = ch.scenes[sceneIdx];

  return (
    <>
      <div className="sj-scene-header">
        <span className="sj-scene-chapter">{ch.roman} · {ch.title.toLowerCase()}</span>
        <span className="sj-scene-progress">
          <span>{String(sceneIdx + 1).padStart(2, '0')}</span>
          <span className="sep">/</span>
          <span>{String(ch.scenes.length).padStart(2, '0')}</span>
        </span>
      </div>
      <div className="sj-scene-content">
        <SceneComponent
          scene={scene}
          idx={sceneIdx}
          total={ch.scenes.length}
          chapterIdx={chapterIdx}
          instantReveal
          onSaveJournal={handleSave}
        />
      </div>
      <div className="sj-scene-footer">
        <SavedPulse trigger={savedTrigger} />
      </div>
    </>
  );
}

/* ─── Transition beat (with Horizon breath CTA) ──────────────────── */
function TransitionBeat({ chapterIdx, chapters, onHorizon }: {
  chapterIdx: number; chapters: Chapter[]; onHorizon: (chapterIdx: number) => void;
}) {
  const chapter = chapters[chapterIdx];
  const hasReading = !!(getReading(chapterIdx).morpho || getReading(chapterIdx).sage);
  const complete = isChapterComplete(chapter);

  return (
    <>
      <ChapterTransition chapter={chapter} />
      {(complete || hasReading) && (
        <div className="sj-horizon-cta">
          <button className="sj-horizon-btn" onClick={() => onHorizon(chapterIdx)} title="Coherence breath between chapters">
            <span className="sj-horizon-orb" />
            <span className="sj-horizon-label">coherence breath</span>
          </button>
        </div>
      )}
    </>
  );
}

/* ─── Public handle (same contract as ScrollJournal) ─────────────── */
export interface BeatStageHandle {
  scrollToChapter: (idx: number) => void;
  scrollToStart: () => void;
}

interface Props {
  chapters: Chapter[];
  initialChapterIdx?: number;
  onChapterChange: (idx: number, kind: 'prelude' | 'in-journey' | 'epilogue') => void;
  onRestart: () => void;
  onCumulative: () => void;
  hasCumulative: boolean;
  generatingCumulative: boolean;
  sharingShown: boolean;
  onHorizon: (chapterIdx: number) => void;
}

/* Beat kinds whose content can outgrow one screen — these scroll
   internally before the outer page crosses to the next beat. */
/* Beats that genuinely can't fit one screen fall back to plain scrolling
   with no melt. 'scene' is deliberately NOT here: movement prose is now
   paginated into one-screen pages (see paginate() in chaptersAdapter), so
   every chapter beat qualifies for the melt. Leaving 'scene' in this set
   was the bug behind "it just scrolls" — it exempted every single content
   beat from the transition and from scroll-snap-stop. */
const TALL_KINDS = new Set<BeatData['kind']>([
  'prelude-invocation', 'prelude-note', 'prelude-birth', 'prelude-road',
  'stream-section', 'body-section', 'ai-reading', 'epilogue',
]);

const BeatStage = forwardRef<BeatStageHandle, Props>(({
  chapters,
  initialChapterIdx = 0,
  onChapterChange,
  onRestart,
  onCumulative,
  hasCumulative,
  generatingCumulative,
  sharingShown,
  onHorizon,
}, ref) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const beatEls = useRef<Map<string, HTMLElement>>(new Map());
  const gateEls = useRef<Map<number, HTMLElement>>(new Map());
  const beats = useMemo(() => buildBeats(chapters), [chapters]);
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollToBeatEl = useCallback((el: HTMLElement | null, behavior: ScrollBehavior = 'smooth') => {
    if (el && stageRef.current) {
      el.scrollIntoView({ behavior, block: 'start' });
    }
  }, []);

  useImperativeHandle(ref, () => ({
    scrollToChapter: (idx: number) => {
      scrollToBeatEl(gateEls.current.get(idx) || null);
    },
    scrollToStart: () => {
      const first = beatEls.current.get(beats[0]?.id);
      scrollToBeatEl(first || null);
    },
  }));

  const setBeatRef = useCallback((id: string, ci?: number) => (el: HTMLDivElement | null) => {
    if (el) {
      beatEls.current.set(id, el);
      if (ci !== undefined) gateEls.current.set(ci, el);
    }
  }, []);

  /* Which beat is current: whichever crosses ~40% of viewport height —
     drives onChapterChange, the breath dots, and the back button. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const applyIdx = (idx: number) => {
      setActiveIdx(prev => (prev === idx ? prev : idx));
      const b = beats[idx];
      if (!b) return;
      if (PRELUDE_KINDS.has(b.kind)) onChapterChange(0, 'prelude');
      else if (b.kind === 'epilogue') onChapterChange(chapters.length - 1, 'epilogue');
      else if ('chapterIdx' in b) onChapterChange(b.chapterIdx, 'in-journey');
    };

    /* The DOCUMENT is the scroller (see the html rule in index.css) —
       exactly matching the verified reference. ZERO JavaScript drives
       scrolling: no wheel proxy, no touch proxy. Native scroll physics +
       scroll-snap ARE the feel; every JS gesture layer tried here
       (delta-proxying, one-swipe-per-beat paging, transform-as-containing-
       -block) either broke the tactile feel or didn't survive direct
       measurement. This effect only OBSERVES scroll to track the active
       beat — it never drives it. */
    const handleScroll = () => {
      const vh = window.innerHeight || 1;
      const mid = window.scrollY + vh / 2;
      const sections = Array.from(stage.querySelectorAll<HTMLElement>(':scope > .beat'));
      let idx = 0;
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].getBoundingClientRect().top + window.scrollY;
        if (top <= mid) idx = i; else break;
      }
      applyIdx(Math.min(beats.length - 1, Math.max(0, idx)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [beats, chapters.length, onChapterChange]);

  /* THE MELT is now pure CSS (index.css "THE BEAT ENGINE") — ported
     verbatim from the approved origin-scroll-melt.html reference:
     view-timeline on .beat, animation-timeline on the fixed
     .beat-content, no JS. Nothing to do here. */

  /* Restore position on mount (instant, no melt) */
  useEffect(() => {
    if (initialChapterIdx > 0) {
      const t = setTimeout(() => {
        scrollToBeatEl(gateEls.current.get(initialChapterIdx) || null, 'instant' as ScrollBehavior);
      }, 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []); // eslint-disable-line

  const scrollToJourney = useCallback(() => {
    scrollToBeatEl(gateEls.current.get(0) || null);
  }, [scrollToBeatEl]);

  const goBack = useCallback(() => {
    if (activeIdx > 0) {
      const prevId = beats[activeIdx - 1]?.id;
      scrollToBeatEl(prevId ? beatEls.current.get(prevId) || null : null);
    }
  }, [activeIdx, beats, scrollToBeatEl]);

  return (
    <div className="beat-stage" ref={stageRef}>
      {beats.map((beat) => {
        const tall = TALL_KINDS.has(beat.kind);
        const cls = `beat${tall ? ' beat--tall' : ''}`;

        switch (beat.kind) {
          case 'prelude-arrival':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><PreludeArrivalBeat /></div>
              </section>
            );

          case 'prelude-invocation':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><PreludeInvocationBeat /></div>
              </section>
            );

          case 'prelude-note':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><PreludeNoteBeat /></div>
              </section>
            );

          case 'prelude-birth':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><PreludeBirthBeat /></div>
              </section>
            );

          case 'prelude-road':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><PreludeRoadBeat onScrollToJourney={scrollToJourney} /></div>
              </section>
            );

          case 'chapter-gate':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id, beat.chapterIdx)}>
                <div className="beat-content">
                  <ChapterGate
                    chapter={chapters[beat.chapterIdx]}
                    chapterIdx={beat.chapterIdx}
                    total={chapters.length}
                    locked={chapters[beat.chapterIdx].locked}
                  />
                </div>
              </section>
            );

          case 'scene':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content">
                  <SceneBeat chapterIdx={beat.chapterIdx} sceneIdx={beat.sceneIdx} chapters={chapters} />
                </div>
              </section>
            );

          case 'stream-section':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><InlineStreamSection chapterIdx={beat.chapterIdx} chapters={chapters} /></div>
              </section>
            );

          case 'body-section':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><InlineBodySection chapterIdx={beat.chapterIdx} chapters={chapters} /></div>
              </section>
            );

          case 'ai-reading':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content"><AiReadingSection chapters={chapters} chapterIdx={beat.chapterIdx} /></div>
              </section>
            );

          case 'chapter-transition':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content">
                  <TransitionBeat chapterIdx={beat.chapterIdx} chapters={chapters} onHorizon={onHorizon} />
                </div>
              </section>
            );

          case 'epilogue':
            return (
              <section key={beat.id} id={beat.id} className={cls} ref={setBeatRef(beat.id)}>
                <div className="beat-content">
                  <EpilogueBeat
                    chapters={chapters}
                    onRestart={onRestart}
                    onCumulative={onCumulative}
                    hasCumulative={hasCumulative}
                    generatingCumulative={generatingCumulative}
                    sharingShown={sharingShown}
                  />
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      <button className="beat-back" style={{ display: activeIdx > 0 ? undefined : 'none' }} onClick={goBack} aria-label="Back">‹</button>
      <div className="beat-progress" aria-hidden="true">
        <span
          className="beat-progress-fill"
          style={{ transform: `scaleX(${beats.length > 1 ? activeIdx / (beats.length - 1) : 0})` }}
        />
      </div>
    </div>
  );
});

BeatStage.displayName = 'BeatStage';
export default BeatStage;
