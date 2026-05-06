import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUser } from '@clerk/react';
import CHAPTERS, { Chapter } from './chapters';
import {
  getTileIdx, setTileIdx as saveTileIdx,
  isChapterComplete, getReading, getCumulative, saveCumulative,
  extractChapterBeats, load,
} from './storage';
import { fetchMorpho, fetchSage } from './api/readings';
import { pullAll, pushAll, pushTileIdx } from './api/userApi';
import AuthBar from './components/AuthBar';
import SceneComponent from './components/Scene';
import JournalOverlay from './components/JournalOverlay';
import BodyOverlay from './components/BodyOverlay';
import StreamOverlay from './components/StreamOverlay';
import HorizonOverlay from './components/HorizonOverlay';
import { ButterflyIcon, CompassIcon } from './components/MorphoCompassIcons';

/* ─── Types ──────────────────────────────────────────── */
interface PreludeTile { kind: 'prelude' }
interface EpilogueTile { kind: 'epilogue' }
interface OpenerTile { kind: 'opener'; ch: number }
interface SceneTileData { kind: 'scene'; ch: number; sc: number }
type Tile = PreludeTile | EpilogueTile | OpenerTile | SceneTileData;

function buildTiles(chapters: Chapter[]): Tile[] {
  const tiles: Tile[] = [];
  tiles.push({ kind: 'prelude' });
  chapters.forEach((ch, ci) => {
    tiles.push({ kind: 'opener', ch: ci });
    ch.scenes.forEach((_, si) => {
      tiles.push({ kind: 'scene', ch: ci, sc: si });
    });
  });
  tiles.push({ kind: 'epilogue' });
  return tiles;
}

function CompassGlyph({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="26" fill="none" stroke="currentColor" strokeWidth=".4" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      {[0, 60, 120, 180, 240, 300].map(a => {
        const r1 = 26, r2 = 54;
        const rad = (a * Math.PI) / 180;
        return <line key={a}
          x1={60 + Math.cos(rad) * r1} y1={60 + Math.sin(rad) * r1}
          x2={60 + Math.cos(rad) * r2} y2={60 + Math.sin(rad) * r2}
          stroke="currentColor" strokeWidth=".4" />;
      })}
    </svg>
  );
}

function Backdrop({ territoryKey }: { territoryKey: string }) {
  return (
    <div className="backdrop" data-territory={territoryKey}>
      <div className="backdrop-base" />
      <div className="veil veil-1" />
      <div className="veil veil-2" />
      <div className="veil veil-3" />
      <div className="grain" />
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e4a1" />
            <stop offset="18%" stopColor="#fff3c4" />
            <stop offset="40%" stopColor="#f2d27a" />
            <stop offset="55%" stopColor="#c89838" />
            <stop offset="72%" stopColor="#8b6218" />
            <stop offset="90%" stopColor="#f2d27a" />
            <stop offset="100%" stopColor="#f5e4a1" />
          </linearGradient>
          <radialGradient id="tealGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ff0d6" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#2dd4c2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2dd4c2" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Spine({ chapters, current, onJump }: {
  chapters: Chapter[];
  current: number;
  onJump: (i: number) => void;
}) {
  return (
    <nav className="spine" aria-label="chapters">
      {chapters.map((c, i) => {
        const state = i === current ? 'active' : i < current ? 'past' : 'future';
        const complete = isChapterComplete(c);
        const r = getReading(i);
        return (
          <button
            key={i}
            className={'spine-node spine-' + state + (complete ? ' spine-complete' : '')}
            onClick={() => onJump(i)}
            title={`${c.roman} · ${c.title}${complete ? ' · complete' : ''}`}
          >
            <span className="spine-dot" />
            <span className="spine-roman">{c.roman}</span>
            <span className="spine-name">{c.title}</span>
            {(r.morpho || r.sage) && (
              <span className="spine-reading-glyphs" aria-hidden="true">
                {r.morpho && <ButterflyIcon size={10} glowing />}
                {r.sage && <CompassIcon size={10} glowing />}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function PreludeTileView({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="tile tile-prelude">
      <div className="tile-inner">
        <div className="prelude-glyph">
          <CompassGlyph size={120} />
        </div>
        <div className="prelude-eyebrow">a guide for becoming the author of your reality</div>
        <h1 className="prelude-title">THE ORIGIN</h1>
        <div className="prelude-sub">seven chapters · seven codes · seven thresholds</div>
        <p className="prelude-body">
          The world is made of stories. Inside your head, your brain is generating one right now about who you are and what's real and what's possible, so continuously and so seamlessly that you have probably never noticed it happening. The same neural circuits fire whether you're living something or remembering it, planning something or imagining it. To your nervous system, the story you tell is the world you live in.
        </p>
        <p className="prelude-body">
          And the story is rarely yours. It was written by people you didn't choose, in conditions you didn't design, and most of it was installed before you had the language to question it. By the time you become old enough to wonder why your life feels the way it does, the story is already producing your reality from underneath, generating the thoughts you call yours, the choices you call free, the limits you call real.
        </p>
        <p className="prelude-body">
          The people who change their lives, change their stories. The people who change the world, change the story everyone is living inside.
        </p>
        <p className="prelude-body dim">
          This is a guide for becoming the author of yours. Seven chapters that walk the oldest pattern human beings have ever walked: the descent into what made you, the discovery of what survived it, and the return as someone who can wield it. The character. The tension. The gift. The source. The narrator. The dream. The ending. By the end you will not just have a new story. You will be living inside one. And from inside an authored life, the same machinery that has been running you, the brain's narrative system, becomes the instrument you use to author what comes next. Reality is story shaped. Stories change. So can we.
        </p>
        <div className="prelude-before">
          <div className="before-head">before we begin · how to use this</div>
          <div className="before-row">
            <div className="before-num">I</div>
            <div className="before-text">tell this in the past tense — speaking your life as something that already happened shifts you from inside the story to outside it, from a person reliving the pain to the narrator of a character's journey.</div>
          </div>
          <div className="before-row">
            <div className="before-num">II</div>
            <div className="before-text">speak aloud when you can — the story lives in the voice and the breath.</div>
          </div>
          <div className="before-row">
            <div className="before-num">III</div>
            <div className="before-text">stay with what surfaces — a raw emotion, fully felt, moves through the body in about ninety seconds. longer than that, and a story is holding it in place.</div>
          </div>
        </div>
        <div className="prelude-toc">
          <div className="toc-head">the seven chapters</div>
          <ol className="toc-list">
            <li><span className="toc-roman">I</span> The Prologue · Everything you have lived is the opening chapter of a story only you can tell.</li>
            <li><span className="toc-roman">II</span> The Tension · The more tension in your story, the more powerful the resolution.</li>
            <li><span className="toc-roman">III</span> The Gift · Make what happened to you happen for you.</li>
            <li><span className="toc-roman">IV</span> The Source · The mind that built every god can make your life sacred.</li>
            <li><span className="toc-roman">V</span> The Narrator · Your entire reality is a story, and the one telling it is the one you mistook for yourself.</li>
            <li><span className="toc-roman">VI</span> The Dream · Remember the power to dream worlds into being.</li>
            <li><span className="toc-roman">VII</span> The Ending · A story told aloud to another nervous system becomes real in a way no thought can.</li>
          </ol>
        </div>
        <button className="primary-btn" onClick={onEnter}>
          <span className="label">begin</span>
        </button>
      </div>
    </div>
  );
}

function EpilogueTileView({ onRestart, onCumulative, hasCumulative, generating }: {
  onRestart: () => void;
  onCumulative: () => void;
  hasCumulative: boolean;
  generating: boolean;
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
          The Origin opened a door. You have been working at the level of identity — the narrative layer where who you believe yourself to be is constructed and reconstructed. Every chapter moved something at that level. The character shifted. The meaning shifted. The body shifted. The source was named. The narrator was caught. The dream was spoken. And now you are living inside a different story than the one you walked in with.
        </p>
        <p className="prelude-body">
          But a story lived only for yourself is a story with a ceiling. The wound that shaped you shaped your understanding of a specific territory. The gift that survived is your qualification to be useful in that territory. The source you named is what gives the work its weight. The dream you authored has other people in it — because every dream that grows from real suffering and real genius and real belonging naturally reaches beyond the one who carries it.
        </p>
        <p className="prelude-body dim">
          The Metamyth Journey is where the personal story meets the larger one. Where the identity you authored becomes the foundation for something that reaches further than your own life. Where the wounds become your methodology, the gift becomes your offering, the source becomes your ground, and the dream becomes something others can enter and help build.
        </p>

        <div className="epilogue-fire">
          <p>
            You are part of the great story — the one that started around the first fires, when the first storytellers gathered the first listeners and spoke the first worlds into being. It continued through every grandmother who passed wisdom forward, every elder who painted pictures in young minds, every ordinary person who refused to let the light go out. It is still being told, right now, through you.
          </p>
        </div>

        <p className="prelude-body epilogue-tagline">The future we dream is one story away.</p>

        <div className="epilogue-actions">
          <button
            className="primary-btn"
            onClick={onCumulative}
            disabled={generating}
            title="A reading across the whole arc"
          >
            <ButterflyIcon size={18} />
            <CompassIcon size={18} />
            <span className="label">
              {generating ? 'reading the whole arc…' : (hasCumulative ? 'open the cumulative reading' : 'receive the cumulative reading')}
            </span>
          </button>
          <button className="btn-ghost" onClick={onRestart}>
            <span className="label">return to the origin</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OpenerTileView({ chapter, idx, total }: { chapter: Chapter; idx: number; total: number }) {
  const paragraphs = chapter.invocation.split('\n\n');
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 120),
      setTimeout(() => setPhase(2), 420),
      setTimeout(() => setPhase(3), 720),
      ...paragraphs.map((_, i) => setTimeout(() => setPhase(4 + i), 1050 + i * 280)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [chapter.title]); // eslint-disable-line

  return (
    <div className="tile tile-opener">
      <div className="tile-inner">
        <div className={`opener-meta opener-phase${phase >= 1 ? ' opener-phase--in' : ''}`}>
          <span>chapter {String(idx + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}</span>
          <span className="opener-rule" />
          <span>territory · {chapter.title.toLowerCase()}</span>
        </div>
        <div className={`opener-roman opener-phase${phase >= 1 ? ' opener-phase--in' : ''}`} style={{ transitionDelay: '60ms' }}>{chapter.roman}</div>
        <h1 className={`opener-title opener-phase${phase >= 2 ? ' opener-phase--in' : ''}`}>{chapter.title}</h1>
        <div className={`opener-sub opener-phase${phase >= 3 ? ' opener-phase--in' : ''}`}>{chapter.subtitle}</div>
        <blockquote className="opener-invocation">
          {paragraphs.map((para, i) => (
            <p key={i} className={`opener-invocation-para opener-phase${phase >= 4 + i ? ' opener-phase--in' : ''}`} style={{ transitionDelay: `${i * 40}ms` }}>{para}</p>
          ))}
        </blockquote>
      </div>
    </div>
  );
}


function SceneTileView({ scene, sceneIdx, totalScenes, chapterRoman, chapterTitle, chapterIdx }: {
  scene: Chapter['scenes'][number];
  sceneIdx: number;
  totalScenes: number;
  chapterRoman: string;
  chapterTitle: string;
  chapterIdx: number;
}) {
  return (
    <div className={'tile tile-scene tile-kind-' + scene.kind}>
      <div className="tile-inner">
        <div className="tile-header">
          <span className="tile-chapter">{chapterRoman} · {chapterTitle.toLowerCase()}</span>
          <span className="tile-progress">
            <span>{String(sceneIdx + 1).padStart(2, '0')}</span>
            <span className="sep">/</span>
            <span>{String(totalScenes).padStart(2, '0')}</span>
          </span>
        </div>
        <SceneComponent scene={scene} idx={sceneIdx} total={totalScenes} chapterIdx={chapterIdx} />
      </div>
    </div>
  );
}

function renderTile(
  tile: Tile, chapters: Chapter[],
  onEnter: () => void, onRestart: () => void,
  onCumulative: () => void, hasCumulative: boolean, generatingCumulative: boolean,
) {
  if (tile.kind === 'prelude') return <PreludeTileView onEnter={onEnter} />;
  if (tile.kind === 'epilogue') return <EpilogueTileView
    onRestart={onRestart}
    onCumulative={onCumulative}
    hasCumulative={hasCumulative}
    generating={generatingCumulative}
  />;
  if (tile.kind === 'opener') return <OpenerTileView chapter={chapters[tile.ch]} idx={tile.ch} total={chapters.length} />;
  if (tile.kind === 'scene') {
    const ch = chapters[tile.ch];
    return (
      <SceneTileView
        scene={ch.scenes[tile.sc]}
        sceneIdx={tile.sc}
        totalScenes={ch.scenes.length}
        chapterRoman={ch.roman}
        chapterTitle={ch.title}
        chapterIdx={tile.ch}
      />
    );
  }
  return null;
}

function DeckNav({ tileIdx, total, go, tiles, onStream, onBody, onJournal }: {
  tileIdx: number;
  total: number;
  go: (i: number) => void;
  tiles: Tile[];
  onStream: () => void;
  onBody: () => void;
  onJournal: () => void;
}) {
  const tile = tiles[tileIdx];
  const next = tiles[tileIdx + 1];
  let label = 'continue';
  if (!next) label = 'complete';
  else if (tile?.kind === 'prelude') label = 'enter chapter I';
  else if (tile?.kind === 'opener') label = 'begin';
  else if (next.kind === 'opener') label = 'cross the threshold';
  else if (next.kind === 'epilogue') label = 'complete the origin';

  return (
    <div className="deck-nav">
      <button className="nav-btn nav-back" onClick={() => go(tileIdx - 1)} disabled={tileIdx === 0}>
        <svg width="14" height="10" viewBox="0 0 14 10">
          <polyline points="5,1 1,5 5,9" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="1" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="label">back</span>
      </button>
      <div className="nav-center">
        <div className="nav-progress">
          <div className="nav-track">
            <div className="nav-track-fill" style={{ width: ((tileIdx + 1) / total) * 100 + '%' }} />
          </div>
        </div>
        <div className="nav-tools" role="group" aria-label="Tools">
          <button className="nav-tool" onClick={onStream} aria-label="Stream of consciousness">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M5 10 Q9 7 16 10 T27 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M5 16 Q9 13 16 16 T27 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".75" />
              <path d="M5 22 Q9 19 16 22 T27 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".5" />
            </svg>
            <span className="nav-tool-label">stream</span>
          </button>
          <button className="nav-tool" onClick={onBody} aria-label="Where does this live in your body">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 19 Q10 15 16 14.5 Q22 15 24 19" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 19 L10 27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M22 19 L22 27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="nav-tool-label">body</span>
          </button>
          <button className="nav-tool" onClick={onJournal} aria-label="Open journal">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="4" width="18" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M6 13.5h18M6 18h12M6 22h9" stroke="currentColor" strokeWidth="1.2" strokeOpacity=".55" />
            </svg>
            <span className="nav-tool-label">journal</span>
          </button>
        </div>
      </div>
      <button className="nav-btn nav-fwd primary" onClick={() => go(tileIdx + 1)} disabled={tileIdx === total - 1}>
        <span className="label">{label}</span>
        <svg width="14" height="10" viewBox="0 0 14 10">
          <line x1="0" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1" />
          <polyline points="9,1 13,5 9,9" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}

function Deck({ tiles, tileIdx, advance, chapters, onEnter, onRestart,
  onCumulative, hasCumulative, generatingCumulative, onStream, onBody, onJournal }: {
  tiles: Tile[];
  tileIdx: number;
  advance: (i: number) => void;
  chapters: Chapter[];
  onEnter: () => void;
  onRestart: () => void;
  onCumulative: () => void;
  hasCumulative: boolean;
  generatingCumulative: boolean;
  onStream: () => void;
  onBody: () => void;
  onJournal: () => void;
}) {
  const [dir, setDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const tileWrapRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);
  const touchRef = useRef<{
    x: number; y: number; t: number;
    lockAxis: 'h' | 'v' | null; active: boolean;
  } | null>(null);

  const go = useCallback((nextIdx: number, fromSwipe = false) => {
    if (nextIdx < 0 || nextIdx >= tiles.length) return;
    if (pendingRef.current) return;
    pendingRef.current = true;
    const forward = nextIdx > tileIdx;
    setDir(forward ? 1 : -1);

    const wrap = tileWrapRef.current;
    const W = wrap?.offsetWidth || window.innerWidth;

    if (fromSwipe && wrap) {
      // Animate from current drag position to exit
      wrap.style.transition = 'transform 260ms cubic-bezier(.4,0,1,1), opacity 220ms ease';
      wrap.style.opacity = '0.2';
      wrap.style.transform = `translateX(${forward ? -W * 0.6 : W * 0.6}px)`;
      setTimeout(() => {
        pendingRef.current = false;
        if (wrap) { wrap.style.transition = ''; wrap.style.transform = ''; wrap.style.opacity = ''; }
        advance(nextIdx);
        setAnimKey(k => k + 1);
      }, 240);
    } else {
      // Button / keyboard: instant exit then entrance
      if (wrap) {
        wrap.style.transition = 'transform 200ms cubic-bezier(.4,0,1,1), opacity 180ms ease';
        wrap.style.opacity = '0';
        wrap.style.transform = `translateX(${forward ? -30 : 30}px)`;
      }
      setTimeout(() => {
        pendingRef.current = false;
        if (wrap) { wrap.style.transition = ''; wrap.style.transform = ''; wrap.style.opacity = ''; }
        advance(nextIdx);
        setAnimKey(k => k + 1);
      }, 200);
    }
  }, [tileIdx, tiles.length, advance]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault(); go(tileIdx + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); go(tileIdx - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go, tileIdx]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (pendingRef.current) return;
    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      t: Date.now(),
      lockAxis: null,
      active: false,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = touchRef.current;
    if (!touch || pendingRef.current) return;
    const dx = e.touches[0].clientX - touch.x;
    const dy = e.touches[0].clientY - touch.y;

    if (touch.lockAxis === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      touch.lockAxis = Math.abs(dx) > Math.abs(dy) * 1.1 ? 'h' : 'v';
    }
    if (touch.lockAxis === 'v') return;

    e.preventDefault();
    touch.active = true;

    // Rubber band at edges
    let eff = dx;
    if (dx > 0 && tileIdx === 0) eff = dx * 0.22;
    if (dx < 0 && tileIdx === tiles.length - 1) eff = dx * 0.22;

    const wrap = tileWrapRef.current;
    if (wrap) {
      wrap.style.transition = 'none';
      wrap.style.transform = `translateX(${eff}px)`;
    }
  }, [tileIdx, tiles.length]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = touchRef.current;
    touchRef.current = null;
    if (!touch || !touch.active) {
      const wrap = tileWrapRef.current;
      if (wrap) { wrap.style.transition = ''; wrap.style.transform = ''; }
      return;
    }
    const dx = e.changedTouches[0].clientX - touch.x;
    const dt = Math.max(Date.now() - touch.t, 1);
    const velocity = Math.abs(dx) / dt;
    const W = tileWrapRef.current?.offsetWidth || window.innerWidth;
    const DIST = W * 0.26;
    const VEL = 0.38;

    if ((dx < -DIST || (dx < -18 && velocity > VEL)) && tileIdx < tiles.length - 1) {
      go(tileIdx + 1, true);
    } else if ((dx > DIST || (dx > 18 && velocity > VEL)) && tileIdx > 0) {
      go(tileIdx - 1, true);
    } else {
      // Spring back
      const wrap = tileWrapRef.current;
      if (wrap) {
        wrap.style.transition = 'transform 400ms cubic-bezier(.25,1,.3,1)';
        wrap.style.transform = 'translateX(0)';
        setTimeout(() => { if (wrap) wrap.style.transition = ''; }, 400);
      }
    }
  }, [tileIdx, tiles.length, go]);

  const tile = tiles[tileIdx];
  return (
    <div
      className="deck" data-kind={tile?.kind}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div key={animKey} ref={tileWrapRef} className={'tile-wrap dir-' + (dir > 0 ? 'fwd' : 'back')}>
        {tile && renderTile(tile, chapters, onEnter, onRestart, onCumulative, hasCumulative, generatingCumulative)}
      </div>
      <DeckNav tileIdx={tileIdx} total={tiles.length} go={go} tiles={tiles} onStream={onStream} onBody={onBody} onJournal={onJournal} />
    </div>
  );
}

function hasLocalData(): boolean {
  try {
    const d = load();
    return Object.keys(d).length > 0 || getTileIdx() > 0;
  } catch { return false; }
}

export default function App() {
  const chapters = CHAPTERS;
  const { user, isLoaded: authLoaded } = useUser();
  const [tileIdx, setTileIdxState] = useState<number>(() => getTileIdx());
  const [journalOpen, setJournalOpen] = useState(false);
  const [bodyOpen, setBodyOpen] = useState(false);
  const [streamOpen, setStreamOpen] = useState(false);
  const [horizon, setHorizon] = useState<{ ch: number; nextIdx: number; cycles?: number } | null>(null);
  const [hasCumulative, setHasCumulative] = useState<boolean>(() => !!getCumulative());
  const [generatingCumulative, setGeneratingCumulative] = useState(false);
  const [cumulativeError, setCumulativeError] = useState<string | null>(null);
  const [journalInitialTab, setJournalInitialTab] = useState<'reading' | 'spine' | 'body' | 'stream' | 'archive' | undefined>(undefined);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const sessionHorizonsRef = useRef<Set<number>>(new Set());
  const prevUserIdRef = useRef<string | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Gate all server writes behind initial pull completing — prevents a fresh
  // device (tileIdx=0) from overwriting existing server state on sign-in.
  const hydratedRef = useRef(false);

  useEffect(() => { saveTileIdx(tileIdx); }, [tileIdx]);

  // Server sync: push tileIdx only after hydration is complete so a fresh
  // device login never clobbers existing progress pulled from the server.
  useEffect(() => {
    if (user && hydratedRef.current) {
      pushTileIdx(tileIdx).catch(() => {});
    }
  }, [tileIdx, user]);

  // Auth state transitions: pull on sign-in, push on sign-out
  useEffect(() => {
    if (!authLoaded) return;
    const currentId = user?.id ?? null;
    const prevId = prevUserIdRef.current;

    if (currentId && currentId !== prevId) {
      // User just signed in — snapshot guest state BEFORE pull merges server
      // data, so migration prompt fires only for genuine pre-auth local journeys.
      const hadLocalData = hasLocalData();
      hydratedRef.current = false;
      pullAll().then(() => {
        hydratedRef.current = true;
        // Hydrate all in-memory state from storage after server data is merged
        // so a new device immediately shows the user's last position.
        setTileIdxState(getTileIdx());
        setHasCumulative(!!getCumulative());
        if (hadLocalData && prevId === null) {
          setShowMigrationPrompt(true);
        }
      });
      // Periodic background push — starts 30s after sign-in, by which time
      // hydration will always have completed.
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = setInterval(() => {
        if (hydratedRef.current) pushAll().catch(() => {});
      }, 30_000);
    } else if (!currentId && prevId) {
      // User just signed out — flush data to server, then stop sync
      if (hydratedRef.current) pushAll().catch(() => {});
      hydratedRef.current = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    prevUserIdRef.current = currentId;
  }, [user, authLoaded]);

  // Flush to server whenever the tab is hidden (tab switch, app close, etc.)
  // and on beforeunload. keepalive=true lets beforeunload fetches survive page unload.
  useEffect(() => {
    const flush = (keepalive = false) => {
      if (user && hydratedRef.current) pushAll(keepalive).catch(() => {});
    };
    const handleVisibility = () => { if (document.hidden) flush(); };
    const handleUnload = () => flush(true);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const handleMigrate = useCallback(() => {
    setShowMigrationPrompt(false);
    pushAll().catch(() => {});
  }, []);

  const restartToPrelude = () => {
    sessionHorizonsRef.current.clear();
    setTileIdxState(0);
  };
  const enterBegin = () => setTileIdxState(1);
  const tiles = useMemo(() => buildTiles(chapters), [chapters]);

  // Clamp persisted tile index against the current deck (the deck graph
  // changed when chapter-level code/lore tiles were removed, so an old
  // saved index could land out of range or on the wrong tile).
  useEffect(() => {
    if (tileIdx < 0) setTileIdxState(0);
    else if (tileIdx >= tiles.length) setTileIdxState(tiles.length - 1);
  }, [tileIdx, tiles.length]);

  const currentTile = tiles[tileIdx];

  let currentCh = 0;
  if (currentTile?.kind === 'opener') currentCh = (currentTile as OpenerTile).ch;
  else if (currentTile?.kind === 'scene') currentCh = (currentTile as SceneTileData).ch;
  else if (currentTile?.kind === 'epilogue') currentCh = chapters.length - 1;

  const reachedCh = useMemo(() => {
    let max = 0;
    for (let i = 0; i <= tileIdx && i < tiles.length; i++) {
      const t = tiles[i];
      if (t && 'ch' in t) max = Math.max(max, (t as OpenerTile).ch);
    }
    if (currentTile?.kind === 'epilogue') max = chapters.length - 1;
    return max;
  }, [tileIdx, tiles, chapters, currentTile]);

  const isOutside = currentTile?.kind === 'prelude' || currentTile?.kind === 'epilogue';
  const palette = chapters[currentCh].palette;

  const rootStyle = {
    '--bg': palette.bg,
    '--ink': palette.ink,
    '--accent': palette.accent,
    '--veil': palette.veil,
    '--glow': palette.glow,
    '--shadow': palette.shadow || '#6b1e28'
  } as React.CSSProperties;

  const jumpToChapter = (ci: number) => {
    const i = tiles.findIndex(t => t.kind === 'opener' && (t as OpenerTile).ch === ci);
    if (i >= 0) setTileIdxState(i);
  };

  // Intercepted advance: triggers Horizon when crossing into next chapter
  // from a completed one (and we haven't already shown it this session).
  const advance = useCallback((nextIdx: number) => {
    if (nextIdx > tileIdx) {
      const cur = tiles[tileIdx];
      const nxt = tiles[nextIdx];
      const fromCh = cur && 'ch' in cur ? (cur as OpenerTile).ch : -1;
      const enteringNextCh =
        (nxt?.kind === 'opener' && (nxt as OpenerTile).ch !== fromCh) ||
        nxt?.kind === 'epilogue';
      if (
        fromCh >= 0 &&
        enteringNextCh &&
        isChapterComplete(chapters[fromCh]) &&
        !sessionHorizonsRef.current.has(fromCh)
      ) {
        sessionHorizonsRef.current.add(fromCh);
        const cycles = nxt?.kind === 'epilogue' ? 12 : 6;
        setHorizon({ ch: fromCh, nextIdx, cycles });
        return;
      }
    }
    setTileIdxState(nextIdx);
  }, [tileIdx, tiles, chapters]);

  const onHorizonComplete = () => {
    if (horizon) {
      const next = horizon.nextIdx;
      setHorizon(null);
      setTileIdxState(next);
    }
  };

  const onCumulative = async () => {
    if (hasCumulative) {
      setJournalInitialTab('archive');
      setJournalOpen(true);
      return;
    }
    setCumulativeError(null);
    setGeneratingCumulative(true);
    try {
      const previousChapters = chapters
        .map((ch, i) => ({ i, ch }))
        .filter(({ ch }) => isChapterComplete(ch))
        .map(({ ch, i }) => ({
          chapterNumber: i + 1,
          chapterTitle: ch.title,
          beats: extractChapterBeats(ch),
          morpho: getReading(i).morpho,
          sage: getReading(i).sage,
        }));

      // Use the final chapter's beats as the "current" payload for cumulative.
      const finalCh = chapters.length - 1;
      const morpho = await fetchMorpho({
        chapterNumber: finalCh + 1,
        chapterTitle: chapters[finalCh].title,
        beats: extractChapterBeats(chapters[finalCh]),
        previousChapters: previousChapters.slice(0, -1),
        cumulative: true,
      });
      const sage = await fetchSage({
        chapterNumber: finalCh + 1,
        chapterTitle: chapters[finalCh].title,
        beats: extractChapterBeats(chapters[finalCh]),
        morpho,
        previousChapters: previousChapters.slice(0, -1),
        cumulative: true,
      });
      saveCumulative({ morpho, sage, generatedAt: Date.now() });
      setHasCumulative(true);
      setJournalInitialTab('archive');
      setJournalOpen(true);
    } catch (e) {
      setCumulativeError(e instanceof Error ? e.message : String(e));
    } finally {
      setGeneratingCumulative(false);
    }
  };

  const territory = currentTile?.kind === 'scene'
    ? chapters[(currentTile as SceneTileData).ch].scenes[(currentTile as SceneTileData).sc].kind
    : currentTile?.kind || 'prelude';

  return (
    <div className="app" style={rootStyle} data-stage={currentTile?.kind} data-chapter={currentCh} data-dark={palette.dark ? "true" : "false"}>
      <Backdrop territoryKey={territory} />

      {!isOutside && (
        <Spine chapters={chapters} current={currentCh} onJump={jumpToChapter} />
      )}

      <header className="topbar">
        <button className="mark" onClick={restartToPrelude}>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth=".8" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span>THE · ORIGIN</span>
        </button>
        <div className="topbar-right">
          {!isOutside && (
            <div className="chapter-count">
              {chapters[currentCh].roman} · {chapters[currentCh].title}
            </div>
          )}
          <AuthBar
            hasMigrationPrompt={showMigrationPrompt}
            onMigrate={handleMigrate}
          />
        </div>
      </header>

      <main className="stage">
        <Deck
          tiles={tiles}
          tileIdx={tileIdx}
          advance={advance}
          chapters={chapters}
          onEnter={enterBegin}
          onRestart={restartToPrelude}
          onCumulative={onCumulative}
          hasCumulative={hasCumulative}
          generatingCumulative={generatingCumulative}
          onStream={() => setStreamOpen(true)}
          onBody={() => setBodyOpen(true)}
          onJournal={() => setJournalOpen(true)}
        />
      </main>

      {cumulativeError && (
        <div className="cumulative-error" role="alert">
          {cumulativeError}
          <button className="btn-ghost small" onClick={() => setCumulativeError(null)}>dismiss</button>
        </div>
      )}

      {streamOpen && (
        <StreamOverlay onClose={() => setStreamOpen(false)} chapters={chapters} currentCh={currentCh} />
      )}
      {bodyOpen && (
        <BodyOverlay onClose={() => setBodyOpen(false)} chapters={chapters} currentCh={currentCh} />
      )}
      {journalOpen && (
        <JournalOverlay
          onClose={() => { setJournalOpen(false); setJournalInitialTab(undefined); }}
          chapters={chapters}
          currentCh={currentCh}
          reachedCh={reachedCh}
          initialTab={journalInitialTab}
        />
      )}
      {horizon && (
        <HorizonOverlay
          chapter={chapters[horizon.ch]}
          chapterIdx={horizon.ch}
          cycles={horizon.cycles}
          onComplete={onHorizonComplete}
          onCancel={() => setHorizon(null)}
        />
      )}
    </div>
  );
}
