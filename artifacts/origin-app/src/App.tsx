import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUser } from '@clerk/react';
import CHAPTERS, { Chapter } from './chapters';
import CHAPTERS_V2 from './chapters-v2';
import { adaptV2Chapter } from './chaptersAdapter';
import {
  getTileIdx, setTileIdx as saveTileIdx,
  isChapterComplete, getCumulative, saveCumulative,
  extractChapterBeats, getReading,
} from './storage';
import { fetchMorpho, fetchSage } from './api/readings';
import {
  pullAll, pushAll, pushSnapshot,
  captureLocalSnapshot, hasSubstantialLocalData,
  type LocalSnapshot,
} from './api/userApi';
import AuthBar from './components/AuthBar';
import JournalOverlay from './components/JournalOverlay';
import HorizonOverlay from './components/HorizonOverlay';
import SharingConsent from './components/SharingConsent';
import BeatStage, { BeatStageHandle } from './components/BeatStage';
import { ButterflyIcon, CompassIcon } from './components/MorphoCompassIcons';

/* ─── Tile types (kept for server-sync position mapping) ─────── */
interface PreludeTile { kind: 'prelude' }
interface PreludeTwoTile { kind: 'prelude2' }
interface EpilogueTile { kind: 'epilogue' }
interface OpenerTile { kind: 'opener'; ch: number }
interface SceneTileData { kind: 'scene'; ch: number; sc: number }
type Tile = PreludeTile | PreludeTwoTile | EpilogueTile | OpenerTile | SceneTileData;

function buildTiles(chapters: Chapter[]): Tile[] {
  const tiles: Tile[] = [{ kind: 'prelude' }];
  chapters.forEach((ch, ci) => {
    tiles.push({ kind: 'opener', ch: ci });
    if (ci === 0) tiles.push({ kind: 'prelude2' });
    ch.scenes.forEach((_, si) => { tiles.push({ kind: 'scene', ch: ci, sc: si }); });
  });
  tiles.push({ kind: 'epilogue' });
  return tiles;
}

/* ─── Backdrop ───────────────────────────────────────────────── */
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

/* ─── Spine ──────────────────────────────────────────────────── */
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

/* ─── App ─────────────────────────────────────────────────────── */
export default function App() {
  /* All seven chapters now run on the v2 worksheet model, migrated verbatim
     from the FINAL markdown. Chapter I additionally carries the authored
     Codex + etymology hypertext; II–VII await that inline-tagging pass. */
  const chapters = useMemo<Chapter[]>(
    () => CHAPTERS_V2.map(adaptV2Chapter),
    [],
  );
  const { user, isLoaded: authLoaded } = useUser();

  /* Navigation state */
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [activeSectionKind, setActiveSectionKind] = useState<'prelude' | 'in-journey' | 'epilogue'>('prelude');
  const scrollJournalRef = useRef<BeatStageHandle>(null);

  /* Track max chapter reached (for JournalOverlay reachedCh) */
  const maxChapterReachedRef = useRef<number>(activeChapterIdx);

  /* Server-sync tile index (derived from active chapter for resume) */
  const tiles = useMemo(() => buildTiles(chapters), [chapters]);
  const [tileIdx, setTileIdxState] = useState<number>(() => getTileIdx());

  /* Overlay states */
  const [journalOpen, setJournalOpen] = useState(false);
  const [mode, setMode] = useState<'color' | 'paper'>(
    () => (localStorage.getItem('origin.mode') === 'paper' ? 'paper' : 'color'),
  );
  const toggleMode = useCallback(() => {
    setMode(m => {
      const next = m === 'color' ? 'paper' : 'color';
      localStorage.setItem('origin.mode', next);
      return next;
    });
  }, []);
  const [journalInitialTab, setJournalInitialTab] = useState<'readings' | 'work' | 'codex' | undefined>(undefined);
  const [horizonTarget, setHorizonTarget] = useState<{ chapterIdx: number } | null>(null);

  /* Cumulative reading */
  const [hasCumulative, setHasCumulative] = useState<boolean>(() => !!getCumulative());
  const [generatingCumulative, setGeneratingCumulative] = useState(false);
  const [cumulativeError, setCumulativeError] = useState<string | null>(null);

  /* Auth/migration */
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hydratedRef = useRef(false);
  const migrationPendingRef = useRef(false);
  const localSnapshotRef = useRef<LocalSnapshot | null>(null);

  /* Sharing consent */
  const [sharingShown, setSharingShown] = useState<boolean>(() =>
    !!localStorage.getItem('origin.sharing.skipped') || !!localStorage.getItem('origin.sharing.done')
  );
  const [epilogueReady, setEpilogueReady] = useState(false);

  /* ── Sync tileIdx to server when chapter changes ─────────────── */
  useEffect(() => {
    const openerIdx = tiles.findIndex(
      t => t.kind === 'opener' && (t as OpenerTile).ch === activeChapterIdx
    );
    const syncIdx =
      activeSectionKind === 'epilogue' ? tiles.length - 1
      : activeSectionKind === 'prelude' ? 0
      : openerIdx >= 0 ? openerIdx : 0;
    setTileIdxState(syncIdx);
  }, [activeChapterIdx, activeSectionKind, tiles]);

  useEffect(() => { saveTileIdx(tileIdx); }, [tileIdx]);

  /* ── Track max chapter reached ───────────────────────────────── */
  useEffect(() => {
    if (activeChapterIdx > maxChapterReachedRef.current) {
      maxChapterReachedRef.current = activeChapterIdx;
    }
  }, [activeChapterIdx]);

  /* ── Epilogue ready (gate SharingConsent) ────────────────────── */
  useEffect(() => {
    if (activeSectionKind !== 'epilogue') {
      setEpilogueReady(false);
      return;
    }
    const t = setTimeout(() => setEpilogueReady(true), 2500);
    return () => clearTimeout(t);
  }, [activeSectionKind]);

  /* ── Auth state machine ──────────────────────────────────────── */
  useEffect(() => {
    if (!authLoaded) return;

    const currentUserId = user?.id ?? null;
    const wasSignedIn = !!prevUserIdRef.current;
    const isSignedIn = !!currentUserId;

    if (isSignedIn && !wasSignedIn) {
      // Fresh sign-in: capture local snapshot for potential migration
      const snap = captureLocalSnapshot();
      const hasMeaningfulData = hasSubstantialLocalData();

      pullAll()
        .then(() => {
          hydratedRef.current = true;
          if (hasMeaningfulData && snap.tileIdx > 1) {
            // Only prompt if they have meaningful journey progress locally
            localSnapshotRef.current = snap;
            migrationPendingRef.current = true;
            setShowMigrationPrompt(true);
          }
        })
        .catch(() => { hydratedRef.current = false; });
    } else if (!isSignedIn && wasSignedIn) {
      // Signed out: clear sync state
      hydratedRef.current = false;
      migrationPendingRef.current = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    if (isSignedIn) {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = setInterval(() => {
        if (!migrationPendingRef.current && hydratedRef.current) {
          pushAll().catch(() => {});
        }
      }, 30_000);
    }

    prevUserIdRef.current = currentUserId;
  }, [user?.id, authLoaded]);

  /* ── Visibility / unload pushes ─────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const flush = (sync = false) => {
      if (!migrationPendingRef.current && hydratedRef.current) {
        if (sync) {
          void pushAll();
        } else {
          pushAll().catch(() => {});
        }
      }
    };
    const handleVisibility = () => { if (document.hidden) flush(); };
    const handleUnload = () => flush(true);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user]);

  /* ── Cleanup interval on unmount ────────────────────────────── */
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  /* ── Migration ───────────────────────────────────────────────── */
  const handleMigrate = useCallback(() => {
    migrationPendingRef.current = false;
    setShowMigrationPrompt(false);
    const snap = localSnapshotRef.current;
    localSnapshotRef.current = null;
    if (snap) {
      pushSnapshot(snap).catch(() => {});
    } else {
      pushAll().catch(() => {});
    }
  }, []);

  /* ── Navigation ──────────────────────────────────────────────── */
  const handleChapterChange = useCallback((idx: number, kind: 'prelude' | 'in-journey' | 'epilogue') => {
    setActiveChapterIdx(idx);
    setActiveSectionKind(kind);
  }, []);

  const jumpToChapter = useCallback((ci: number) => {
    scrollJournalRef.current?.scrollToChapter(ci);
  }, []);

  const restartToPrelude = useCallback(() => {
    scrollJournalRef.current?.scrollToStart();
  }, []);

  /* ── Cumulative reading ──────────────────────────────────────── */
  const onCumulative = useCallback(async () => {
    if (hasCumulative) {
      setJournalInitialTab('codex');
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
      setJournalInitialTab('codex');
      setJournalOpen(true);
    } catch (e) {
      setCumulativeError(e instanceof Error ? e.message : String(e));
    } finally {
      setGeneratingCumulative(false);
    }
  }, [hasCumulative, chapters]);

  /* ── Derived ─────────────────────────────────────────────────── */
  const isOutside = activeSectionKind === 'prelude';
  const allChaptersComplete = chapters.every(ch => isChapterComplete(ch));
  const showSharing = activeSectionKind === 'epilogue' && epilogueReady && allChaptersComplete && !sharingShown;
  const palette = chapters[activeChapterIdx]?.palette || chapters[0].palette;
  const hasMorpho = !!getReading(activeChapterIdx).morpho;
  const reachedCh = maxChapterReachedRef.current;

  /* Two moods, one system:
     color — the chapter palettes bleed as you scroll (the cinematic world)
     paper — one clean papery-white ground; chapters speak through accent only */
  const paperGround = { bg: '#f7f2e6', ink: '#3c3226', veil: '#ede5d1' };
  const effective = mode === 'paper'
    ? { ...palette, ...paperGround, dark: false }
    : palette;

  const rootStyle = {
    '--bg': effective.bg,
    '--ink': effective.ink,
    '--accent': effective.accent,
    '--veil': effective.veil,
    '--glow': effective.glow,
    '--shadow': mode === 'paper' ? '#8a6f42' : (palette.shadow || '#6b1e28'),
  } as React.CSSProperties;

  /* ── Restore initial chapter from persisted tile index ─────── */
  const initialChapterIdx = useMemo(() => {
    const savedTile = getTileIdx();
    const savedTileObj = tiles[savedTile];
    if (!savedTileObj) return 0;
    if (savedTileObj.kind === 'opener') return (savedTileObj as OpenerTile).ch;
    if (savedTileObj.kind === 'scene') return (savedTileObj as SceneTileData).ch;
    if (savedTileObj.kind === 'epilogue') return chapters.length - 1;
    return 0;
  }, []); // eslint-disable-line

  return (
    <div
      className="app"
      style={rootStyle}
      data-chapter={activeChapterIdx}
      data-stage={activeSectionKind}
      data-dark={effective.dark ? 'true' : 'false'}
      data-mode={mode}
    >
      <Backdrop territoryKey="scroll" />

      {!isOutside && (
        <Spine chapters={chapters} current={activeChapterIdx} onJump={jumpToChapter} />
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
              {chapters[activeChapterIdx].roman} · {chapters[activeChapterIdx].title}
            </div>
          )}
          <button
            className="mode-toggle"
            onClick={toggleMode}
            aria-label={mode === 'color' ? 'Switch to paper mode' : 'Switch to color mode'}
            title={mode === 'color' ? 'paper mode' : 'color mode'}
          >
            <span className={`mode-dot mode-dot--color${mode === 'color' ? ' on' : ''}`} />
            <span className={`mode-dot mode-dot--paper${mode === 'paper' ? ' on' : ''}`} />
            <span className="mode-label">{mode}</span>
          </button>
          <button
            className={`instr-btn topbar-journal-btn${hasMorpho ? ' instr-btn--lit' : ''}`}
            onClick={() => { setJournalInitialTab(undefined); setJournalOpen(true); }}
            aria-label="Open journal archive"
            title="Journal & readings"
          >
            <ButterflyIcon size={18} glowing={hasMorpho} />
          </button>
          <AuthBar
            hasMigrationPrompt={showMigrationPrompt}
            onMigrate={handleMigrate}
          />
        </div>
      </header>

      <main className="stage">
        <BeatStage
          ref={scrollJournalRef}
          chapters={chapters}
          initialChapterIdx={initialChapterIdx}
          onChapterChange={handleChapterChange}
          onRestart={restartToPrelude}
          onCumulative={onCumulative}
          hasCumulative={hasCumulative}
          generatingCumulative={generatingCumulative}
          sharingShown={sharingShown}
          onHorizon={(idx) => setHorizonTarget({ chapterIdx: idx })}
        />
      </main>

      {cumulativeError && (
        <div className="cumulative-error" role="alert">
          {cumulativeError}
          <button className="btn-ghost small" onClick={() => setCumulativeError(null)}>dismiss</button>
        </div>
      )}

      {horizonTarget && (
        <HorizonOverlay
          chapter={chapters[horizonTarget.chapterIdx]}
          chapterIdx={horizonTarget.chapterIdx}
          cycles={6}
          onComplete={() => setHorizonTarget(null)}
          onCancel={() => setHorizonTarget(null)}
        />
      )}

      {journalOpen && (
        <JournalOverlay
          onClose={() => { setJournalOpen(false); setJournalInitialTab(undefined); }}
          chapters={chapters}
          currentCh={activeChapterIdx}
          reachedCh={reachedCh}
          initialTab={journalInitialTab}
        />
      )}

      {showSharing && (
        <SharingConsent
          onDone={() => setSharingShown(true)}
          onSkip={() => setSharingShown(true)}
        />
      )}
    </div>
  );
}
