import { useState, useEffect, useMemo, useCallback } from 'react';
import CHAPTERS, { Chapter } from './chapters';
import { getTileIdx, setTileIdx as saveTileIdx, resetAll } from './storage';
import SceneComponent from './components/Scene';

/* ─── Types ──────────────────────────────────────────── */
interface PreludeTile { kind: 'prelude' }
interface EpilogueTile { kind: 'epilogue' }
interface OpenerTile { kind: 'opener'; ch: number }
interface CodeTile { kind: 'code'; ch: number }
interface SceneTileData { kind: 'scene'; ch: number; sc: number }
type Tile = PreludeTile | EpilogueTile | OpenerTile | CodeTile | SceneTileData;

function buildTiles(chapters: Chapter[]): Tile[] {
  const tiles: Tile[] = [];
  tiles.push({ kind: 'prelude' });
  chapters.forEach((ch, ci) => {
    tiles.push({ kind: 'opener', ch: ci });
    tiles.push({ kind: 'code', ch: ci });
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

function CodeGlyph() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth=".5" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth=".5" />
      <circle cx="24" cy="24" r="5" fill="none" stroke="currentColor" strokeWidth=".8" />
      <line x1="24" y1="2" x2="24" y2="10" stroke="currentColor" strokeWidth=".5" />
      <line x1="24" y1="38" x2="24" y2="46" stroke="currentColor" strokeWidth=".5" />
      <line x1="2" y1="24" x2="10" y2="24" stroke="currentColor" strokeWidth=".5" />
      <line x1="38" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth=".5" />
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
        return (
          <button
            key={i}
            className={'spine-node spine-' + state}
            onClick={() => onJump(i)}
            title={`${c.roman} · ${c.title}`}
          >
            <span className="spine-dot" />
            <span className="spine-roman">{c.roman}</span>
            <span className="spine-name">{c.title}</span>
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
        <div className="prelude-eyebrow">a guided excavation for the metamyth journey</div>
        <h1 className="prelude-title">THE ORIGIN</h1>
        <div className="prelude-sub">seven chapters · seven codes · seven thresholds</div>
        <p className="prelude-body">
          The world is made of stories. Your mind is creating one right now, so seamlessly you mistake the story for the world itself.
          The story running in your head is generating your reality. If you can reach the story, you can change what is real.
        </p>
        <p className="prelude-body dim">
          The north star: everything that happened to you happened for a reason — even if you are the one who makes that reason.
          The only adversary is shame. Each time it shows up, recognize it: the old story's immune system. Proof you are approaching something real.
        </p>
        <div className="prelude-before">
          <div className="before-head">before we begin</div>
          <div className="before-row">
            <div className="before-num">I</div>
            <div className="before-text">stay with what surfaces — a raw emotion moves through the body in about ninety seconds.</div>
          </div>
          <div className="before-row">
            <div className="before-num">II</div>
            <div className="before-text">tell this in the past tense — shift from living it to narrating it.</div>
          </div>
          <div className="before-row">
            <div className="before-num">III</div>
            <div className="before-text">speak aloud if you can — the story lives in the voice and the breath.</div>
          </div>
        </div>
        <button className="primary-btn" onClick={onEnter}>
          <span className="label">begin</span>
        </button>
      </div>
    </div>
  );
}

function EpilogueTileView({ onRestart }: { onRestart: () => void }) {
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
        <div className="prelude-eyebrow">the beginning</div>
        <h1 className="prelude-title">CHAPTER ONE</h1>
        <div className="prelude-sub">everything you uncovered is chapter one</div>
        <p className="prelude-body">
          The power you just accessed is real. The Origin opened the door. The metamyth is the container — where your wounds reveal themselves as your qualification, where meaning sharpens into purpose, purpose rises into vision, and vision becomes a path you can walk.
        </p>
        <p className="prelude-body">
          Find one person and tell them your story. Then ask about theirs. That exchange is the oldest technology on earth.
        </p>
        <p className="prelude-body dim">The future we dream is one story away.</p>
        <button className="primary-btn" onClick={onRestart}>
          <span className="label">return to the origin</span>
        </button>
      </div>
    </div>
  );
}

function OpenerTileView({ chapter, idx, total }: { chapter: Chapter; idx: number; total: number }) {
  return (
    <div className="tile tile-opener">
      <div className="tile-inner">
        <div className="opener-meta">
          <span>chapter {String(idx + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}</span>
          <span className="opener-rule" />
          <span>territory · {chapter.title.toLowerCase()}</span>
        </div>
        <div className="opener-roman">{chapter.roman}</div>
        <h1 className="opener-title">{chapter.title}</h1>
        <div className="opener-sub">{chapter.subtitle}</div>
        <blockquote className="opener-invocation">{chapter.invocation}</blockquote>
      </div>
    </div>
  );
}

/* ─── Code card manuscript frame ────────────────────────── */
function CodeCornerSvg() {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer circle ring at pivot */}
      <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.55" />
      {/* Inner circle */}
      <circle cx="11" cy="11" r="5.5" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.35" />
      {/* Diamond inset */}
      <polygon points="11,6.5 14.2,11 11,15.5 7.8,11" fill="currentColor" fillOpacity="0.8" />
      {/* Compass ticks: north + east */}
      <line x1="11" y1="0.5" x2="11" y2="-3.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.45" />
      <line x1="20.5" y1="11" x2="24.5" y2="11" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.45" />
      {/* Small diagonal accents at 45° */}
      <line x1="3.5" y1="3.5" x2="1" y2="1" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.3" />
      {/* Right arm */}
      <line x1="21" y1="11" x2="69" y2="11" stroke="currentColor" strokeWidth="0.85" strokeOpacity="0.45" />
      {/* Arm decoration 1 — ring·dot at 1/3 */}
      <circle cx="37" cy="11" r="3" fill="none" stroke="currentColor" strokeWidth="0.65" strokeOpacity="0.4" />
      <circle cx="37" cy="11" r="1.1" fill="currentColor" fillOpacity="0.6" />
      {/* Arm decoration 2 — tick at 2/3 */}
      <line x1="52" y1="8" x2="52" y2="14" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35" />
      <line x1="50" y1="11" x2="54" y2="11" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" />
      {/* Arm terminal */}
      <circle cx="69" cy="11" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.42" />
      <circle cx="69" cy="11" r="1.4" fill="currentColor" fillOpacity="0.55" />
      {/* Down arm */}
      <line x1="11" y1="21" x2="11" y2="69" stroke="currentColor" strokeWidth="0.85" strokeOpacity="0.45" />
      {/* Arm decoration 1 — ring·dot */}
      <circle cx="11" cy="37" r="3" fill="none" stroke="currentColor" strokeWidth="0.65" strokeOpacity="0.4" />
      <circle cx="11" cy="37" r="1.1" fill="currentColor" fillOpacity="0.6" />
      {/* Arm decoration 2 — tick */}
      <line x1="8" y1="52" x2="14" y2="52" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35" />
      <line x1="11" y1="50" x2="11" y2="54" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25" />
      {/* Arm terminal */}
      <circle cx="11" cy="69" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.42" />
      <circle cx="11" cy="69" r="1.4" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

function CodeFrame() {
  return (
    <div className="code-frame" aria-hidden="true">
      <span className="code-corner code-corner--tl"><CodeCornerSvg /></span>
      <span className="code-corner code-corner--tr"><CodeCornerSvg /></span>
      <span className="code-corner code-corner--bl"><CodeCornerSvg /></span>
      <span className="code-corner code-corner--br"><CodeCornerSvg /></span>
    </div>
  );
}

function CodeTileView({ chapter }: { chapter: Chapter }) {
  return (
    <div className="tile tile-code">
      <div className="tile-inner">
        <div className="code-card">
          <CodeFrame />
          <div className="code-head">
            <div className="code-mark"><CodeGlyph /></div>
            <div className="code-label">{chapter.code.title}</div>
            <div className="code-num">ch · {chapter.roman}</div>
          </div>
          <div className="code-body">{chapter.code.body}</div>
        </div>
      </div>
    </div>
  );
}

function SceneTileView({ scene, sceneIdx, totalScenes, chapterRoman, chapterTitle }: {
  scene: Chapter['scenes'][number];
  sceneIdx: number;
  totalScenes: number;
  chapterRoman: string;
  chapterTitle: string;
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
        <SceneComponent scene={scene} idx={sceneIdx} total={totalScenes} />
      </div>
    </div>
  );
}

function renderTile(tile: Tile, chapters: Chapter[], onEnter: () => void, onRestart: () => void) {
  if (tile.kind === 'prelude') return <PreludeTileView onEnter={onEnter} />;
  if (tile.kind === 'epilogue') return <EpilogueTileView onRestart={onRestart} />;
  if (tile.kind === 'opener') return <OpenerTileView chapter={chapters[tile.ch]} idx={tile.ch} total={chapters.length} />;
  if (tile.kind === 'code') return <CodeTileView chapter={chapters[tile.ch]} />;
  if (tile.kind === 'scene') {
    const ch = chapters[tile.ch];
    return (
      <SceneTileView
        scene={ch.scenes[tile.sc]}
        sceneIdx={tile.sc}
        totalScenes={ch.scenes.length}
        chapterRoman={ch.roman}
        chapterTitle={ch.title}
      />
    );
  }
  return null;
}

function DeckNav({ tileIdx, total, go, tiles }: {
  tileIdx: number;
  total: number;
  go: (i: number) => void;
  tiles: Tile[];
}) {
  const tile = tiles[tileIdx];
  const next = tiles[tileIdx + 1];
  let label = 'continue';
  if (!next) label = 'complete';
  else if (tile?.kind === 'prelude') label = 'enter chapter I';
  else if (tile?.kind === 'opener') label = 'receive the code';
  else if (tile?.kind === 'code') label = 'begin';
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
      <div className="nav-progress">
        <div className="nav-track">
          <div className="nav-track-fill" style={{ width: ((tileIdx + 1) / total) * 100 + '%' }} />
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

function Deck({ tiles, tileIdx, setTileIdxState, chapters, onEnter, onRestart }: {
  tiles: Tile[];
  tileIdx: number;
  setTileIdxState: (i: number) => void;
  chapters: Chapter[];
  onEnter: () => void;
  onRestart: () => void;
}) {
  const [dir, setDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  const go = useCallback((nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= tiles.length) return;
    setDir(nextIdx > tileIdx ? 1 : -1);
    setTileIdxState(nextIdx);
    setAnimKey(k => k + 1);
  }, [tileIdx, tiles.length, setTileIdxState]);

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

  const tile = tiles[tileIdx];
  return (
    <div className="deck" data-kind={tile?.kind}>
      <div key={animKey} className={'tile-wrap dir-' + (dir > 0 ? 'fwd' : 'back')}>
        {tile && renderTile(tile, chapters, onEnter, onRestart)}
      </div>
      <DeckNav tileIdx={tileIdx} total={tiles.length} go={go} tiles={tiles} />
    </div>
  );
}

export default function App() {
  const chapters = CHAPTERS;
  const [tileIdx, setTileIdxState] = useState<number>(() => getTileIdx());

  useEffect(() => { saveTileIdx(tileIdx); }, [tileIdx]);

  const restartToPrelude = () => setTileIdxState(0);
  const enterBegin = () => setTileIdxState(1);
  const tiles = useMemo(() => buildTiles(chapters), [chapters]);

  const currentTile = tiles[tileIdx];

  let currentCh = 0;
  if (currentTile?.kind === 'opener') currentCh = (currentTile as OpenerTile).ch;
  else if (currentTile?.kind === 'code') currentCh = (currentTile as CodeTile).ch;
  else if (currentTile?.kind === 'scene') currentCh = (currentTile as SceneTileData).ch;
  else if (currentTile?.kind === 'epilogue') currentCh = chapters.length - 1;

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
          <button
            className="btn-ghost small reset-btn"
            onClick={() => { if (confirm('Reset your entire journey? This cannot be undone.')) { resetAll(); setTileIdxState(0); } }}
            title="Reset journey"
          >
            <span className="label">reset</span>
          </button>
        </div>
      </header>

      <main className="stage">
        <Deck
          tiles={tiles}
          tileIdx={tileIdx}
          setTileIdxState={setTileIdxState}
          chapters={chapters}
          onEnter={enterBegin}
          onRestart={restartToPrelude}
        />
      </main>
    </div>
  );
}
