import { useState, useEffect } from 'react';
import { UserStore } from './store/userStore';
import type { ChapterDef } from './content/types';
import ChapterEngine from './components/ChapterEngine';

import ch01 from './content/chapters/01-prologue';
import ch02 from './content/chapters/02-wound';
import ch03 from './content/chapters/03-gift';
import ch04 from './content/chapters/04-source';
import ch05 from './content/chapters/05-narrator';
import ch06 from './content/chapters/06-dream';
import ch07 from './content/chapters/07-ending';

const ALL_CHAPTERS: ChapterDef[] = [ch01, ch02, ch03, ch04, ch05, ch06, ch07];

interface Palette {
  bg: string; ink: string; accent: string;
  veil: string; glow: string; shadow: string; dark?: boolean;
}

const PALETTES: Record<string, Palette> = {
  prologue: { bg: '#ece1c3', ink: '#4a3a24', accent: '#c89838', veil: '#e3d6b2', glow: '#4ff0d6', shadow: '#8a5a24', dark: false },
  wound:    { bg: '#3a1020', ink: '#f0d4c4', accent: '#d47060', veil: '#5c2030', glow: '#e07060', shadow: '#a03040', dark: true },
  gift:     { bg: '#102a14', ink: '#c8e0c4', accent: '#60b868', veil: '#1a4024', glow: '#40d878', shadow: '#186030', dark: true },
  source:   { bg: '#0a1838', ink: '#c4dcf8', accent: '#5090e0', veil: '#122040', glow: '#70b0f8', shadow: '#204080', dark: true },
  narrator: { bg: '#09090b', ink: '#e0d8cc', accent: '#c89838', veil: '#161410', glow: '#e0b840', shadow: '#2c2010', dark: true },
  dream:    { bg: '#c8ede0', ink: '#0d2e24', accent: '#2aaa8a', veil: '#a4dcc8', glow: '#3ecaaa', shadow: '#0a4832', dark: false },
  ending:   { bg: '#f0e8d8', ink: '#3c3020', accent: '#a89868', veil: '#e0d4b8', glow: '#c8b880', shadow: '#6a5030', dark: false },
};

type Screen = 'opening' | 'chapter' | 'epilogue';

function CompassGlyph({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="26" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      {[0, 60, 120, 180, 240, 300].map(a => {
        const r1 = 26, r2 = 54, rad = (a * Math.PI) / 180;
        return <line key={a}
          x1={60 + Math.cos(rad) * r1} y1={60 + Math.sin(rad) * r1}
          x2={60 + Math.cos(rad) * r2} y2={60 + Math.sin(rad) * r2}
          stroke="currentColor" strokeWidth=".4" />;
      })}
    </svg>
  );
}

const CHAPTER_SUBTITLES: Record<string, string> = {
  prologue: 'everything you have lived is the opening chapter of a story only you can tell',
  wound:    'what you carry as who you are is the story your brain made out of what happened',
  gift:     'the meaning you give your life is the life you get to live',
  source:   'the mind that built every god can make your life sacred',
  narrator: 'your entire reality is a story, and the one telling it is the one you mistook for yourself',
  dream:    'the world you want to live in does not exist yet, and you are the one dreaming it into being',
  ending:   'a story told aloud to another nervous system becomes real in a way no thought can',
};

function OpeningScreen({ onEnter, completedChapters }: {
  onEnter: () => void;
  completedChapters: string[];
}) {
  const firstIncomplete = ALL_CHAPTERS.findIndex(c => !completedChapters.includes(c.id));
  const nextIdx = firstIncomplete === -1 ? ALL_CHAPTERS.length : firstIncomplete;
  const allDone = completedChapters.length === ALL_CHAPTERS.length;

  return (
    <div className="opening-screen">
      <div className="opening-inner">
        <div className="opening-glyph"><CompassGlyph size={100} /></div>
        <div className="opening-eyebrow">a guided excavation for the metamyth journey</div>
        <h1 className="opening-title">THE ORIGIN</h1>
        <div className="opening-sub">seven chapters · seven codes · seven thresholds</div>

        <p className="opening-body">
          Before you can author the story of your life, you have to understand how life has been authoring you.
          You have been living inside a story. The story running in your head generates your reality. If you can reach the story, you can change what is real.
        </p>
        <p className="opening-body opening-body--dim">
          The posture you practice here is meaning-making: holding every experience in the question "what was this preparing me for?" instead of "why did this happen to me?" That single shift changes what you find when you dig.
        </p>

        <div className="opening-before">
          <div className="before-head">before we begin</div>
          <div className="before-row"><div className="before-num">I</div><div className="before-text">stay with what surfaces — a raw emotion moves through the body in about ninety seconds.</div></div>
          <div className="before-row"><div className="before-num">II</div><div className="before-text">tell this in the past tense — shift from living it to narrating it.</div></div>
          <div className="before-row"><div className="before-num">III</div><div className="before-text">speak aloud if you can — the story lives in the voice and the breath.</div></div>
        </div>

        <nav className="toc" aria-label="Journey chapters">
          {ALL_CHAPTERS.map((ch, i) => {
            const done = completedChapters.includes(ch.id);
            const inProgress = !done && i < nextIdx;
            const locked = !done && !inProgress && i > nextIdx;
            const available = !done && !locked;
            return (
              <div
                key={ch.id}
                className={[
                  'toc-row',
                  done ? 'toc-row--done' : '',
                  inProgress ? 'toc-row--progress' : '',
                  locked ? 'toc-row--locked' : '',
                ].join(' ')}
              >
                <span className="toc-roman">{ch.number}</span>
                <span className="toc-title">{ch.title}</span>
                <span className="toc-sub">{CHAPTER_SUBTITLES[ch.id]}</span>
                {locked && <span className="toc-lock" aria-label="locked">·</span>}
                {done && <span className="toc-check" aria-label="completed">✓</span>}
                {available && !done && i === nextIdx && (
                  <span className="toc-current">→</span>
                )}
              </div>
            );
          })}
        </nav>

        <button className="primary-btn opening-cta" onClick={onEnter}>
          <span className="label">
            {allDone ? 'revisit the origin' : nextIdx === 0 ? 'begin' : `continue — chapter ${ALL_CHAPTERS[nextIdx]?.number}`}
          </span>
        </button>

        <p className="opening-care">
          One word of care. This work touches real psychological material. If you have a history of mental illness, psychotic episodes, or acute psychological crisis, proceed with the support of a qualified professional.
        </p>
      </div>
    </div>
  );
}

function EpilogueScreen({ onReturn }: { onReturn: () => void }) {
  return (
    <div className="opening-screen epilogue-screen">
      <div className="opening-inner">
        <div className="opening-glyph">
          <svg viewBox="0 0 120 120" width="100" height="100">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth=".4" />
            <circle cx="60" cy="60" r="3" fill="currentColor" />
            <path d="M20 60 Q60 20 100 60 Q60 100 20 60" fill="none" stroke="currentColor" strokeWidth=".4" />
          </svg>
        </div>
        <div className="opening-eyebrow">the beginning</div>
        <h1 className="opening-title">CHAPTER ONE</h1>
        <div className="opening-sub">everything you uncovered is chapter one</div>
        <p className="opening-body">
          You have walked the Origin. Seven chapters. Seven codes. Seven thresholds crossed. The old story honored, felt, and closed.
        </p>
        <p className="opening-body">
          The power you just accessed is real. It is as real as the wound that was using it against you. The Origin opened the door. The metamyth is the container. Bring your Origin. Come as you are.
        </p>
        <p className="opening-body opening-body--dim">The future we dream is one story away.</p>
        <button className="primary-btn opening-cta" onClick={onReturn}>
          <span className="label">return to the origin</span>
        </button>
      </div>
    </div>
  );
}

function Backdrop({ palette }: { palette: Palette }) {
  return (
    <div className="backdrop">
      <div className="backdrop-base" />
      <div className="veil veil-1" />
      <div className="veil veil-2" />
      <div className="veil veil-3" />
      <div className="grain" />
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e4a1" /><stop offset="18%" stopColor="#fff3c4" />
            <stop offset="40%" stopColor="#f2d27a" /><stop offset="55%" stopColor="#c89838" />
            <stop offset="72%" stopColor="#8b6218" /><stop offset="90%" stopColor="#f2d27a" />
            <stop offset="100%" stopColor="#f5e4a1" />
          </linearGradient>
          <radialGradient id="tealGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.6" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function ChapterNav({ chapters, currentIdx, completedChapters, onJump, onOpeningClick }: {
  chapters: ChapterDef[];
  currentIdx: number;
  completedChapters: string[];
  onJump: (i: number) => void;
  onOpeningClick: () => void;
}) {
  return (
    <nav className="spine" aria-label="chapters">
      <button className="spine-home" onClick={onOpeningClick} title="Opening">
        <span className="spine-dot" />
      </button>
      {chapters.map((c, i) => {
        const done = completedChapters.includes(c.id);
        const locked = !done && i > 0 && !completedChapters.includes(chapters[i - 1]?.id) && i !== 0;
        const isCurrent = i === currentIdx;
        const state = isCurrent ? 'active' : done ? 'past' : locked ? 'locked' : 'future';
        return (
          <button
            key={c.id}
            className={'spine-node spine-' + state}
            onClick={() => !locked && onJump(i)}
            disabled={locked && !done && !isCurrent}
            title={`${c.number} · ${c.title}`}
          >
            <span className="spine-dot" />
            <span className="spine-roman">{c.number}</span>
            <span className="spine-name">{c.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ChapterProgressBar({ chapterId }: { chapterId: string }) {
  const ch = ALL_CHAPTERS.find(c => c.id === chapterId);
  if (!ch) return null;
  const prompts = ch.elements.filter(e => e.type === 'prompt' || e.type === 'threshold' || e.type === 'gather');
  const answered = prompts.filter(el => {
    if (el.type === 'prompt') return !!UserStore.getResponse(el.id);
    if (el.type === 'threshold' && el.promptId) return !!UserStore.getResponse(el.promptId);
    if (el.type === 'gather') return el.lines.some(l => l.promptId && !!UserStore.getResponse(l.promptId));
    return false;
  });
  const pct = prompts.length === 0 ? 0 : (answered.length / prompts.length) * 100;

  return (
    <div className="chapter-progress-bar">
      <div className="chapter-progress-fill" style={{ width: pct + '%' }} />
    </div>
  );
}

const OPENING_PALETTE: Palette = {
  bg: '#ece1c3', ink: '#4a3a24', accent: '#c89838',
  veil: '#e3d6b2', glow: '#4ff0d6', shadow: '#8a5a24', dark: false
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('opening');
  const [chapterIdx, setChapterIdx] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<string[]>(() =>
    UserStore.getCompletedChapters()
  );

  useEffect(() => {
    const firstIncomplete = ALL_CHAPTERS.findIndex(c => !completedChapters.includes(c.id));
    if (firstIncomplete > 0) setChapterIdx(firstIncomplete);
  }, []);

  const currentChapter = ALL_CHAPTERS[chapterIdx];
  const palette = screen === 'chapter' ? (PALETTES[currentChapter?.id] || OPENING_PALETTE) : OPENING_PALETTE;

  const rootStyle = {
    '--bg': palette.bg, '--ink': palette.ink, '--accent': palette.accent,
    '--veil': palette.veil, '--glow': palette.glow, '--shadow': palette.shadow,
  } as React.CSSProperties;

  const enterJourney = () => {
    const firstIncomplete = ALL_CHAPTERS.findIndex(c => !completedChapters.includes(c.id));
    setChapterIdx(firstIncomplete === -1 ? 0 : firstIncomplete);
    setScreen('chapter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onChapterComplete = () => {
    const updated = UserStore.getCompletedChapters();
    setCompletedChapters(updated);
    if (chapterIdx < ALL_CHAPTERS.length - 1) {
      setChapterIdx(chapterIdx + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setScreen('epilogue');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const jumpToChapter = (i: number) => {
    setChapterIdx(i);
    setScreen('chapter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goOpening = () => {
    setScreen('opening');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    if (confirm('Reset your entire journey? This cannot be undone.')) {
      UserStore.reset();
      setCompletedChapters([]);
      setChapterIdx(0);
      setScreen('opening');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="app" style={rootStyle} data-dark={palette.dark ? 'true' : 'false'}>
      <Backdrop palette={palette} />

      <header className="topbar">
        <button className="mark" onClick={goOpening}>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth=".8" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span>THE · ORIGIN</span>
        </button>
        <div className="topbar-right">
          {screen === 'chapter' && (
            <div className="chapter-count">{currentChapter?.number} · {currentChapter?.title}</div>
          )}
          <button className="btn-ghost small reset-btn" onClick={reset} title="Reset journey">
            <span className="label">reset</span>
          </button>
        </div>
      </header>

      {screen === 'chapter' && (
        <ChapterNav
          chapters={ALL_CHAPTERS}
          currentIdx={chapterIdx}
          completedChapters={completedChapters}
          onJump={jumpToChapter}
          onOpeningClick={goOpening}
        />
      )}

      {screen === 'chapter' && <ChapterProgressBar chapterId={currentChapter?.id} />}

      <main className="stage stage--scroll">
        {screen === 'opening' && (
          <OpeningScreen onEnter={enterJourney} completedChapters={completedChapters} />
        )}
        {screen === 'chapter' && currentChapter && (
          <ChapterEngine
            key={currentChapter.id}
            chapter={currentChapter}
            chapterIdx={chapterIdx}
            totalChapters={ALL_CHAPTERS.length}
            onComplete={onChapterComplete}
            completed={completedChapters.includes(currentChapter.id)}
          />
        )}
        {screen === 'epilogue' && (
          <EpilogueScreen onReturn={goOpening} />
        )}
      </main>
    </div>
  );
}
