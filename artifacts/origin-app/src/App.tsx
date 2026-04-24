import { useState, useEffect, useMemo, useCallback } from 'react';
import CHAPTERS, { Chapter } from './chapters';
import { getTileIdx, setTileIdx as saveTileIdx, resetAll } from './storage';
import SceneComponent from './components/Scene';
import JournalOverlay from './components/JournalOverlay';
import BodyOverlay from './components/BodyOverlay';
import StreamOverlay from './components/StreamOverlay';

/* ─── Types ──────────────────────────────────────────── */
interface PreludeTile { kind: 'prelude' }
interface EpilogueTile { kind: 'epilogue' }
interface OpenerTile { kind: 'opener'; ch: number }
interface CodeTile { kind: 'code'; ch: number }
interface LoreTile { kind: 'lore'; ch: number }
interface SceneTileData { kind: 'scene'; ch: number; sc: number }
type Tile = PreludeTile | EpilogueTile | OpenerTile | CodeTile | LoreTile | SceneTileData;

function buildTiles(chapters: Chapter[]): Tile[] {
  const tiles: Tile[] = [];
  tiles.push({ kind: 'prelude' });
  chapters.forEach((ch, ci) => {
    tiles.push({ kind: 'opener', ch: ci });
    tiles.push({ kind: 'code', ch: ci });
    tiles.push({ kind: 'lore', ch: ci });
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
          Before you can author the story of your life, you have to understand how life has been authoring you.
          You have been living inside a story. The story running in your head generates your reality. If you can reach the story, you can change what is real.
        </p>
        <p className="prelude-body dim">
          The posture you practice here is meaning-making: holding every experience in the question "what was this preparing me for?" instead of "why did this happen to me?" That single shift changes what you find when you dig.
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
          You have walked the Origin. Seven chapters. Seven codes. Seven thresholds crossed. The old story honored, felt, and closed.
          Everything you uncovered is Chapter One.
        </p>
        <p className="prelude-body">
          The power you just accessed is real. It is as real as the wound that was using it against you.
          The Origin opened the door. The metamyth is the container. Bring your Origin. Come as you are.
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
  /* Precision alchemical/astronomical ornament — centered at (26,26).
     Geometric language only: circles, a 4-point diamond, crosshair ticks.
     No arms — the CSS border on .code-frame provides the connecting lines. */
  return (
    <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" overflow="visible">
      {/* Outer ring */}
      <circle cx="26" cy="26" r="15" fill="none" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.52" />
      {/* Middle ring */}
      <circle cx="26" cy="26" r="10" fill="none" stroke="currentColor" strokeWidth="0.45" strokeOpacity="0.32" />
      {/* Inner ring */}
      <circle cx="26" cy="26" r="6" fill="none" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.25" />
      {/* 4-point diamond — solid, central emblem */}
      <polygon points="26,19 32,26 26,33 20,26" fill="currentColor" fillOpacity="0.78" />
      {/* Center void */}
      <circle cx="26" cy="26" r="2.2" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.35" />
      {/* Cardinal crosshair ticks — short, sharp, extend beyond the outer ring */}
      <line x1="26" y1="9" x2="26" y2="5"  stroke="currentColor" strokeWidth="0.85" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="26" y1="43" x2="26" y2="47" stroke="currentColor" strokeWidth="0.85" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="9"  y1="26" x2="5"  y2="26" stroke="currentColor" strokeWidth="0.85" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="43" y1="26" x2="47" y2="26" stroke="currentColor" strokeWidth="0.85" strokeOpacity="0.5" strokeLinecap="round" />
      {/* Diagonal register dots at 45° on the outer ring */}
      <circle cx="36.6" cy="15.4" r="1"  fill="currentColor" fillOpacity="0.42" />
      <circle cx="15.4" cy="15.4" r="1"  fill="currentColor" fillOpacity="0.42" />
      <circle cx="36.6" cy="36.6" r="1"  fill="currentColor" fillOpacity="0.42" />
      <circle cx="15.4" cy="36.6" r="1"  fill="currentColor" fillOpacity="0.42" />
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
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="tile tile-code">
      <div className="tile-inner">
        <div className={'code-card' + (expanded ? ' code-card--expanded' : '')}>
          <CodeFrame />
          <div className="code-head">
            <div className="code-mark"><CodeGlyph /></div>
            <div className="code-label">{chapter.code.title}</div>
            <div className="code-num">ch · {chapter.roman}</div>
          </div>
          <div className="code-essence">{chapter.code.essence}</div>
          {expanded && (
            <div className="code-expanded">
              <div className="code-body code-body--detail">{chapter.code.body}</div>
              <button className="code-collapse" onClick={() => setExpanded(false)}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <polyline points="1,5 5,1 9,5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                collapse
              </button>
            </div>
          )}
          {!expanded && (
            <button className="code-explore" onClick={() => setExpanded(true)}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <polyline points="1,1 5,5 9,1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              explore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Lore card organic frame ───────────────────────────── */
function LoreCornerSvg() {
  /* Botanical eye-of-antiquity ornament — centered at (26,26).
     Organic language only: almond-eye outline (bezier), iris, leaf tips, curved lash strokes.
     No straight lines anywhere. The CSS border on .lore-frame provides the connecting lines. */
  return (
    <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" overflow="visible">
      {/* Outer almond / mandorla — the eye of antiquity */}
      <path
        d="M4 26 C4 15 26 4 26 4 C26 4 48 15 48 26 C48 37 26 48 26 48 C26 48 4 37 4 26 Z"
        fill="none" stroke="currentColor" strokeWidth="0.78" strokeOpacity="0.52"
      />
      {/* Inner iris ring */}
      <circle cx="26" cy="26" r="9.5" fill="none" stroke="currentColor" strokeWidth="0.48" strokeOpacity="0.32" />
      {/* Solid pupil */}
      <circle cx="26" cy="26" r="6" fill="currentColor" fillOpacity="0.68" />
      {/* Subtle inner glint — off-center */}
      <circle cx="23.5" cy="23.5" r="1.8" fill="currentColor" fillOpacity="0.28" />
      {/* Leaf tips at the four almond cardinal points — organic, not geometric */}
      <path d="M26 4   C24 7   28 7   26 4"   fill="currentColor" fillOpacity="0.5" />
      <path d="M26 48  C24 45  28 45  26 48"  fill="currentColor" fillOpacity="0.5" />
      <path d="M4  26  C7  24  7  28  4  26"  fill="currentColor" fillOpacity="0.38" />
      <path d="M48 26  C45 24  45 28  48 26"  fill="currentColor" fillOpacity="0.38" />
      {/* Upper eyelash curves — 3 short organic strokes arcing outward */}
      <path d="M17 13 C15 9  18 8  19 11"  fill="none" stroke="currentColor" strokeWidth="0.55" strokeOpacity="0.38" strokeLinecap="round" />
      <path d="M26 5  C25 1  27 1  28 5"   fill="none" stroke="currentColor" strokeWidth="0.55" strokeOpacity="0.35" strokeLinecap="round" />
      <path d="M35 13 C37 9  34 8  33 11"  fill="none" stroke="currentColor" strokeWidth="0.55" strokeOpacity="0.38" strokeLinecap="round" />
    </svg>
  );
}

function LoreGlyph() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
      {/* Outer leaf/eye shape */}
      <path d="M 6 24 C 6 14, 24 6, 24 6 C 24 6, 42 14, 42 24 C 42 34, 24 42, 24 42 C 24 42, 6 34, 6 24 Z"
        fill="none" stroke="currentColor" strokeWidth=".7" strokeOpacity=".5" />
      {/* Inner pupil rings */}
      <circle cx="24" cy="24" r="9" fill="none" stroke="currentColor" strokeWidth=".6" strokeOpacity=".4" />
      <circle cx="24" cy="24" r="4.5" fill="currentColor" fillOpacity=".75" />
      <circle cx="24" cy="24" r="1.8" fill="currentColor" fillOpacity=".35" />
      {/* Small leaf accents at cardinal points */}
      <path d="M 24 6 C 22 10, 26 10, 24 6" fill="currentColor" fillOpacity=".3" />
      <path d="M 24 42 C 22 38, 26 38, 24 42" fill="currentColor" fillOpacity=".3" />
    </svg>
  );
}

function LoreFrame() {
  return (
    <div className="lore-frame" aria-hidden="true">
      <span className="lore-corner lore-corner--tl"><LoreCornerSvg /></span>
      <span className="lore-corner lore-corner--tr"><LoreCornerSvg /></span>
      <span className="lore-corner lore-corner--bl"><LoreCornerSvg /></span>
      <span className="lore-corner lore-corner--br"><LoreCornerSvg /></span>
    </div>
  );
}

function LoreTileView({ chapter }: { chapter: Chapter }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="tile tile-lore">
      <div className="tile-inner">
        <div className={'lore-card' + (expanded ? ' lore-card--expanded' : '')}>
          <LoreFrame />
          <div className="lore-head">
            <div className="lore-mark"><LoreGlyph /></div>
            <div className="lore-label">The Lore</div>
            <div className="lore-num">ch · {chapter.roman}</div>
          </div>
          <div className="lore-essence">{chapter.lore.essence}</div>
          {expanded && (
            <div className="lore-expanded">
              <div className="lore-body">{chapter.lore.expandedContent}</div>
              <button className="lore-collapse" onClick={() => setExpanded(false)}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <polyline points="1,5 5,1 9,5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                collapse
              </button>
            </div>
          )}
          {!expanded && (
            <button className="lore-explore" onClick={() => setExpanded(true)}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <polyline points="1,1 5,5 9,1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              explore
            </button>
          )}
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
  if (tile.kind === 'lore') return <LoreTileView chapter={chapters[tile.ch]} />;
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
  else if (tile?.kind === 'code') label = 'explore the lore';
  else if (tile?.kind === 'lore') label = 'begin';
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
  const [journalOpen, setJournalOpen] = useState(false);
  const [bodyOpen, setBodyOpen] = useState(false);
  const [streamOpen, setStreamOpen] = useState(false);

  useEffect(() => { saveTileIdx(tileIdx); }, [tileIdx]);

  const restartToPrelude = () => setTileIdxState(0);
  const enterBegin = () => setTileIdxState(1);
  const tiles = useMemo(() => buildTiles(chapters), [chapters]);

  const currentTile = tiles[tileIdx];

  let currentCh = 0;
  if (currentTile?.kind === 'opener') currentCh = (currentTile as OpenerTile).ch;
  else if (currentTile?.kind === 'code') currentCh = (currentTile as CodeTile).ch;
  else if (currentTile?.kind === 'lore') currentCh = (currentTile as LoreTile).ch;
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

      <div className="floating-toolbar">
        <button
          className="toolbar-btn stream-btn"
          onClick={() => setStreamOpen(true)}
          aria-label="Open stream"
          title="Stream"
        >
          {/* Three flowing ripples — water/breath glyph */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M4 9 Q8 6 14 9 T24 9" stroke="#C4A265" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M4 14 Q8 11 14 14 T24 14" stroke="#C4A265" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M4 19 Q8 16 14 19 T24 19" stroke="#C4A265" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
          </svg>
        </button>
        <button
          className="toolbar-btn body-btn"
          onClick={() => setBodyOpen(true)}
          aria-label="Open body"
          title="Body"
        >
          {/* Minimal human silhouette icon — head + shoulders + torso line art */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="7" r="3.2" fill="none" stroke="#C4A265" strokeWidth="1.2" />
            <path d="M7 17 Q9 13 14 12.5 Q19 13 21 17" fill="none" stroke="#C4A265" strokeWidth="1.2" />
            <path d="M9 17 L9 24" stroke="#C4A265" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M19 17 L19 24" stroke="#C4A265" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M14 13 L14 20" stroke="#C4A265" strokeWidth="0.8" strokeOpacity=".55" strokeDasharray="1 2" />
          </svg>
        </button>
        <button
          className="toolbar-btn journal-btn"
          onClick={() => setJournalOpen(true)}
          aria-label="Open journal"
          title="Journal"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="5" y="4" width="16" height="20" rx="1.5" fill="none" stroke="#C4A265" strokeWidth="1.4" />
            <path d="M5 7.5h16" stroke="#C4A265" strokeWidth="1" strokeOpacity=".5" />
            <path d="M5 11h16M5 14.5h10M5 18h8" stroke="#C4A265" strokeWidth="1" strokeOpacity=".35" />
            <path d="M21 4v20" stroke="#C4A265" strokeWidth="1.4" strokeOpacity=".4" />
            <rect x="22.5" y="5" width="1.5" height="18" rx=".75" fill="#C4A265" fillOpacity=".25" />
          </svg>
        </button>
      </div>

      {streamOpen && (
        <StreamOverlay
          onClose={() => setStreamOpen(false)}
          chapters={chapters}
          currentCh={currentCh}
        />
      )}

      {bodyOpen && (
        <BodyOverlay
          onClose={() => setBodyOpen(false)}
          chapters={chapters}
          currentCh={currentCh}
        />
      )}

      {journalOpen && (
        <JournalOverlay
          onClose={() => setJournalOpen(false)}
          chapters={chapters}
          currentCh={currentCh}
          reachedCh={reachedCh}
        />
      )}
    </div>
  );
}
