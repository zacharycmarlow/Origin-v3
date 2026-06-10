import {
  useRef, useEffect, useMemo, forwardRef, useImperativeHandle, useCallback, useState,
} from 'react';
import { Chapter } from '../chapters';
import SceneComponent from './Scene';
import ChapterGate from './sections/ChapterGate';
import AiReadingSection from './sections/AiReadingSection';
import ChapterTransition from './sections/ChapterTransition';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';
import MetamythInvite from './MetamythInvite';

/* ─── Section data model ─────────────────────────────────────── */
type SectionData =
  | { id: string; kind: 'prelude' }
  | { id: string; kind: 'chapter-gate'; chapterIdx: number }
  | { id: string; kind: 'scene'; chapterIdx: number; sceneIdx: number }
  | { id: string; kind: 'ai-reading'; chapterIdx: number }
  | { id: string; kind: 'chapter-transition'; chapterIdx: number }
  | { id: string; kind: 'epilogue' };

function buildSections(chapters: Chapter[]): SectionData[] {
  const out: SectionData[] = [{ id: 'sj-prelude', kind: 'prelude' }];
  chapters.forEach((_, ci) => {
    out.push({ id: `sj-gate-${ci}`, kind: 'chapter-gate', chapterIdx: ci });
    chapters[ci].scenes.forEach((__, si) => {
      out.push({ id: `sj-scene-${ci}-${si}`, kind: 'scene', chapterIdx: ci, sceneIdx: si });
    });
    out.push({ id: `sj-reading-${ci}`, kind: 'ai-reading', chapterIdx: ci });
    if (ci < chapters.length - 1) {
      out.push({ id: `sj-trans-${ci}`, kind: 'chapter-transition', chapterIdx: ci });
    }
  });
  out.push({ id: 'sj-epilogue', kind: 'epilogue' });
  return out;
}

/* ─── Compass glyph (local copy to avoid App.tsx coupling) ─── */
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
      <div className="prelude-eyebrow">seven chapters · seven thresholds</div>
      <h1 className="prelude-title">THE ORIGIN</h1>
      <p className="prelude-body">
        The world is made of stories. The one running in your head right now — about who you are, what's real, what's possible — has been producing your reality since before you had the language to question it. This is a guide for becoming the author of yours.
      </p>
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

/* ─── Public handle ─────────────────────────────────────────── */
export interface ScrollJournalHandle {
  scrollToChapter: (idx: number) => void;
  scrollToStart: () => void;
}

/* ─── Scene tools strip ─────────────────────────────────────── */
function SceneTools({ onStream, onBody }: { onStream: () => void; onBody: () => void }) {
  return (
    <div className="sj-scene-tools">
      <button className="sj-tool-btn" onClick={onStream} title="Open stream of consciousness">
        <svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 4h14M2 8h10M2 12h12M2 16h8" strokeLinecap="round" />
        </svg>
        <span>stream</span>
      </button>
      <button className="sj-tool-btn" onClick={onBody} title="Body check-in">
        <svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="9" cy="3.5" r="1.5" />
          <path d="M9 5.5v5m-3 0 1 4h4l1-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 8.5h5" strokeLinecap="round" />
        </svg>
        <span>body</span>
      </button>
    </div>
  );
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
  onStream: () => void;
  onBody: () => void;
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
  onStream,
  onBody,
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
          if (entry.isIntersecting) {
            newVisible.push(entry.target.id);
          }
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
      // Defer so layout is settled
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
                />
              </div>
            );
          }

          case 'scene': {
            const ci = section.chapterIdx;
            const si = section.sceneIdx;
            const ch = chapters[ci];
            const scene = ch.scenes[si];
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--scene`}
              >
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
                  />
                </div>
                <SceneTools onStream={onStream} onBody={onBody} />
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

          case 'chapter-transition': {
            const ci = section.chapterIdx;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`${baseClass} sj-section--transition`}
              >
                <ChapterTransition chapter={chapters[ci]} />
              </div>
            );
          }

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
