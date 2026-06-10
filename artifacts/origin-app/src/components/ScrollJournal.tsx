import {
  useRef, useEffect, useMemo, forwardRef, useImperativeHandle, useCallback, useState,
} from 'react';
import { Chapter } from '../chapters';
import SceneComponent from './Scene';
import Journal from './Journal';
import ChapterGate from './sections/ChapterGate';
import AiReadingSection from './sections/AiReadingSection';
import ChapterTransition from './sections/ChapterTransition';
import InlineStreamSection from './sections/InlineStreamSection';
import InlineBodySection from './sections/InlineBodySection';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';
import MetamythInvite from './MetamythInvite';
import { isChapterComplete, getReading } from '../storage';

/* ─── Section data model ─────────────────────────────────────── */
type SectionData =
  | { id: string; kind: 'prelude' }
  | { id: string; kind: 'chapter-gate'; chapterIdx: number }
  | { id: string; kind: 'scene'; chapterIdx: number; sceneIdx: number }
  | { id: string; kind: 'stream-section'; chapterIdx: number }
  | { id: string; kind: 'body-section'; chapterIdx: number }
  | { id: string; kind: 'ai-reading'; chapterIdx: number }
  | { id: string; kind: 'chapter-transition'; chapterIdx: number }
  | { id: string; kind: 'epilogue' };

function buildSections(chapters: Chapter[]): SectionData[] {
  const out: SectionData[] = [{ id: 'sj-prelude', kind: 'prelude' }];
  chapters.forEach((ch, ci) => {
    out.push({ id: `sj-gate-${ci}`, kind: 'chapter-gate', chapterIdx: ci });
    if (!ch.locked) {
      ch.scenes.forEach((__, si) => {
        out.push({ id: `sj-scene-${ci}-${si}`, kind: 'scene', chapterIdx: ci, sceneIdx: si });
      });
      out.push({ id: `sj-stream-${ci}`, kind: 'stream-section', chapterIdx: ci });
      out.push({ id: `sj-body-${ci}`, kind: 'body-section', chapterIdx: ci });
      out.push({ id: `sj-reading-${ci}`, kind: 'ai-reading', chapterIdx: ci });
      if (ci < chapters.length - 1) {
        out.push({ id: `sj-trans-${ci}`, kind: 'chapter-transition', chapterIdx: ci });
      }
    }
  });
  out.push({ id: 'sj-epilogue', kind: 'epilogue' });
  return out;
}

/* ─── Compass glyph ─────────────────────────────────────────── */
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

/* ─── Prelude section ───────────────────────────────────────── */
function PreludeSection({ onScrollToJourney }: { onScrollToJourney: () => void }) {
  return (
    <div className="sj-prelude-inner">
      <div className="prelude-glyph">
        <CompassGlyph size={90} />
      </div>
      <div className="prelude-eyebrow">A guide for becoming the author of your reality.</div>
      <h1 className="prelude-title">THE ORIGIN</h1>
      <p className="prelude-body">
        The magic of story is the power to create worlds with words. Since humans gathered around the fire at the dawn of time and spoke all that came to pass into motion. We all live and breathe stories, to get through the bad times and immortalize the good. We tell stories, all day every day.
      </p>
      <p className="prelude-body">
        Your mind is telling a story right now.
      </p>
      <p className="prelude-body">
        Authoring the next moment before it arrives. Running a story so vivid and so constant that you believed it, and it became the world.
      </p>
      <p className="prelude-body">
        The same process that makes you laugh and cry at a movie creates your mind, your moods, your life. The same operating system runs the money, the nations, the news, the whole towering production of human civilization.
      </p>
      <p className="prelude-body">
        You will learn how by practicing on the most precious story ever told: you.
      </p>
      <p className="prelude-body">
        The promise of this book is exact. Rewrite your life. Reprogram your nervous system around a story you actually choose. Then live it, until the story and the life are the same thing.
      </p>
      <p className="prelude-body">
        Seven chapters. Seven arts of storytelling: film, the novel, poetry, scripture, mythology, adventure, the spoken word. The journey moves backward through the history of how humans learned to tell stories, from the screen to the fire. Each one ancient. Each one dangerous. At every layer, a deeper truth about how story creates reality. By the end you hold all seven, proven in your body, braided into a voice that cannot be faked: yours.
      </p>
      <p className="prelude-body">
        You cannot change what happened to you. You decide what it means, and the meaning changes everything downstream.
      </p>
      <p className="prelude-body prelude-body--closing">
        The pen has been in your hand the whole time.
      </p>
      <p className="prelude-body prelude-body--closing">
        Let this be an ending. And a beginning.
      </p>
      <div className="prelude-rule" />
      <div className="prelude-note-block">
        <p className="prelude-note-heading">A note before you begin</p>
        <p className="prelude-body">
          Stories make the world and they can break it too. Everyone who has walked this path has been changed by it. The only thing between you and that power is shame, doubt, and your own resistance to the size of what you actually are. Name it. Keep going.
        </p>
      </div>
      <div className="prelude-rule" />
      <div className="prelude-road-block">
        <p className="prelude-road-heading">The Road</p>
        <ol className="prelude-road-list">
          <li><span className="prelude-road-roman">I</span><span className="prelude-road-text">The Opening — See the story you have been living inside.</span></li>
          <li><span className="prelude-road-roman">II</span><span className="prelude-road-text prelude-road-locked">The Conflict — Face the challenges that make the story interesting.</span></li>
          <li><span className="prelude-road-roman">III</span><span className="prelude-road-text prelude-road-locked">The Twist — Turn everything you survived into gold.</span></li>
          <li><span className="prelude-road-roman">IV</span><span className="prelude-road-text prelude-road-locked">The Source — Touch the source code of what you are.</span></li>
          <li><span className="prelude-road-roman">V</span><span className="prelude-road-text prelude-road-locked">The Reality — See through the mythology and rewrite it.</span></li>
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

/* ─── Epilogue section ──────────────────────────────────────── */
function EpilogueSection({
  onRestart, onCumulative, hasCumulative, generatingCumulative, sharingShown,
}: {
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
        <p className="prelude-body dim">
          The Metamyth Journey is where the personal story meets the larger one.
        </p>
        <div className="epilogue-fire">
          <p>
            You are part of the great story — the one that started around the first fires, when the first storytellers gathered the first listeners and spoke the first worlds into being.
          </p>
        </div>
        <p className="prelude-body epilogue-tagline">The future we dream is one story away.</p>
        <div className="epilogue-actions">
          <button
            className="primary-btn"
            onClick={onCumulative}
            disabled={generatingCumulative}
          >
            <ButterflyIcon size={18} />
            <CompassIcon size={18} />
            <span className="label">
              {generatingCumulative
                ? 'reading the whole arc…'
                : hasCumulative
                  ? 'open the cumulative reading'
                  : 'receive the cumulative reading'}
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

/* ─── SavedPulse indicator ───────────────────────────────────── */
function SavedPulse({ visible }: { visible: boolean }) {
  return (
    <span className={`saved-pulse${visible ? ' saved-pulse--show' : ''}`} aria-live="polite">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M1.5 6.5L4.5 9.5L10.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      saved
    </span>
  );
}

/* ─── Scene section (own state for SavedPulse) ───────────────── */
function SceneSection({
  section,
  chapters,
  isVisible,
}: {
  section: { id: string; kind: 'scene'; chapterIdx: number; sceneIdx: number };
  chapters: Chapter[];
  isVisible: boolean;
}) {
  const [savedVisible, setSavedVisible] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = useCallback(() => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    setSavedVisible(true);
    savedTimerRef.current = setTimeout(() => setSavedVisible(false), 1600);
  }, []);

  useEffect(() => () => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, []);

  const ci = section.chapterIdx;
  const si = section.sceneIdx;
  const ch = chapters[ci];
  const scene = ch.scenes[si];
  const baseClass = `sj-section${isVisible ? ' sj-section--visible' : ''}`;

  return (
    <div key={section.id} id={section.id} className={`${baseClass} sj-section--scene`}>
      <div className="sj-scene-header">
        <span className="sj-scene-chapter">
          {ch.roman} · {ch.title.toLowerCase()}
        </span>
        <span className="sj-scene-progress">
          <span>{String(si + 1).padStart(2, '0')}</span>
          <span className="sep">/</span>
          <span>{String(ch.scenes.length).padStart(2, '0')}</span>
        </span>
      </div>
      <div className="sj-scene-content">
        <SceneComponent
          scene={scene}
          idx={si}
          total={ch.scenes.length}
          chapterIdx={ci}
          instantReveal
          onSaveJournal={handleSave}
        />
      </div>
      <div className="sj-scene-footer">
        <SavedPulse visible={savedVisible} />
      </div>
    </div>
  );
}

/* ─── Chapter transition section (with Horizon breath CTA) ─── */
function TransitionSection({
  section,
  chapters,
  isVisible,
  onHorizon,
}: {
  section: { id: string; kind: 'chapter-transition'; chapterIdx: number };
  chapters: Chapter[];
  isVisible: boolean;
  onHorizon: (chapterIdx: number) => void;
}) {
  const ci = section.chapterIdx;
  const chapter = chapters[ci];
  const hasReading = !!(getReading(ci).morpho || getReading(ci).sage);
  const complete = isChapterComplete(chapter);
  const baseClass = `sj-section${isVisible ? ' sj-section--visible' : ''}`;

  return (
    <div id={section.id} className={`${baseClass} sj-section--transition`}>
      <ChapterTransition chapter={chapter} />
      {(complete || hasReading) && (
        <div className="sj-horizon-cta">
          <button
            className="sj-horizon-btn"
            onClick={() => onHorizon(ci)}
            title="Coherence breath between chapters"
          >
            <span className="sj-horizon-orb" />
            <span className="sj-horizon-label">coherence breath</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Public handle ─────────────────────────────────────────── */
export interface ScrollJournalHandle {
  scrollToChapter: (idx: number) => void;
  scrollToStart: () => void;
}

/* ─── Props ─────────────────────────────────────────────────── */
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

/* ─── ScrollJournal ─────────────────────────────────────────── */
const ScrollJournal = forwardRef<ScrollJournalHandle, Props>(({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const gateEls = useRef<Map<number, HTMLElement>>(new Map());
  const epilogueRef = useRef<HTMLElement | null>(null);
  const sections = useMemo(() => buildSections(chapters), [chapters]);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  /* ── Imperative handle ─────────────────────────────────────── */
  useImperativeHandle(ref, () => ({
    scrollToChapter: (idx: number) => {
      const el = gateEls.current.get(idx);
      if (el && containerRef.current) {
        containerRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      }
    },
    scrollToStart: () => {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    },
  }));

  /* ── Gate ref setter ────────────────────────────────────────── */
  const setGateRef = useCallback((ci: number) => (el: HTMLElement | null) => {
    if (el) gateEls.current.set(ci, el);
  }, []);

  /* ── Scroll → active chapter tracking ─────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const viewH = container.clientHeight;
        const docH = container.scrollHeight;

        if (scrollTop < viewH * 0.5) {
          onChapterChange(0, 'prelude');
          return;
        }
        if (scrollTop + viewH >= docH - 60) {
          onChapterChange(chapters.length - 1, 'epilogue');
          return;
        }
        const triggerLine = scrollTop + viewH * 0.2;
        let active = 0;
        for (const [ci, el] of gateEls.current.entries()) {
          if (el.offsetTop <= triggerLine) active = ci;
        }
        onChapterChange(active, 'in-journey');
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [chapters.length, onChapterChange]);

  /* ── Section fade-in via IntersectionObserver ──────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const newVisible: string[] = [];
        entries.forEach(entry => {
          if (entry.isIntersecting) newVisible.push(entry.target.id);
        });
        if (newVisible.length > 0) {
          setVisibleSections(prev => {
            const next = new Set(prev);
            newVisible.forEach(id => next.add(id));
            return next;
          });
        }
      },
      { root: container, threshold: 0.04 }
    );

    const sectionEls = container.querySelectorAll('.sj-section');
    sectionEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  /* ── Restore scroll position on mount ─────────────────────── */
  useEffect(() => {
    if (initialChapterIdx > 0) {
      const t = setTimeout(() => {
        const el = gateEls.current.get(initialChapterIdx);
        if (el && containerRef.current) {
          containerRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'instant' as ScrollBehavior });
        }
      }, 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []); // eslint-disable-line

  /* ── Scroll to first chapter on prelude CTA ────────────────── */
  const scrollToJourney = useCallback(() => {
    const el = gateEls.current.get(0);
    if (el && containerRef.current) {
      containerRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  }, []);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="scroll-journal" ref={containerRef}>
      {sections.map(section => {
        const isVisible = visibleSections.has(section.id);
        const baseClass = `sj-section${isVisible ? ' sj-section--visible' : ''}`;

        switch (section.kind) {
          case 'prelude':
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--prelude`}
              >
                <PreludeSection onScrollToJourney={scrollToJourney} />
              </div>
            );

          case 'chapter-gate': {
            const ci = section.chapterIdx;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--gate`}
                ref={setGateRef(ci)}
                data-chapter-idx={ci}
              >
                <ChapterGate
                  chapter={chapters[ci]}
                  chapterIdx={ci}
                  total={chapters.length}
                  locked={chapters[ci].locked}
                />
              </div>
            );
          }

          case 'scene':
            return (
              <SceneSection
                key={section.id}
                section={section}
                chapters={chapters}
                isVisible={isVisible}
              />
            );

          case 'stream-section': {
            const ci = section.chapterIdx;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--stream`}
              >
                <InlineStreamSection chapterIdx={ci} chapters={chapters} />
              </div>
            );
          }

          case 'body-section': {
            const ci = section.chapterIdx;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--body`}
              >
                <InlineBodySection chapterIdx={ci} chapters={chapters} />
              </div>
            );
          }

          case 'ai-reading': {
            const ci = section.chapterIdx;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--reading`}
              >
                <AiReadingSection chapters={chapters} chapterIdx={ci} />
              </div>
            );
          }

          case 'chapter-transition':
            return (
              <TransitionSection
                key={section.id}
                section={section}
                chapters={chapters}
                isVisible={isVisible}
                onHorizon={onHorizon}
              />
            );

          case 'epilogue':
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--epilogue`}
                ref={(el) => { epilogueRef.current = el; }}
              >
                <EpilogueSection
                  onRestart={onRestart}
                  onCumulative={onCumulative}
                  hasCumulative={hasCumulative}
                  generatingCumulative={generatingCumulative}
                  sharingShown={sharingShown}
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
});

ScrollJournal.displayName = 'ScrollJournal';
export default ScrollJournal;
