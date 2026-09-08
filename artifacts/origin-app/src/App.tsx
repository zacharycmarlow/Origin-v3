import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAuth } from './auth/AuthContext';
import { useStorageNamespace, migrateGuestToUser } from './hooks/useUserStorage';
import CHAPTERS, { Chapter } from './chapters';
import CHAPTERS_V2 from './chapters-v2';
import { adaptV2Chapter } from './chaptersAdapter';
import {
  getTileIdx, setTileIdx as saveTileIdx,
  isChapterComplete, getCumulative, saveCumulative,
  extractChapterBeats, getReading,
  initStorage, isStorageHydrated,
} from './storage';
import { fetchMorpho, fetchSage } from './api/readings';
import {
  pullAll, pushAll, pushSnapshot,
  captureLocalSnapshot, hasSubstantialLocalData,
  type LocalSnapshot,
} from './api/userApi';
import AuthBar from './components/AuthBar';
import ArtifactsPanel from './components/ArtifactsPanel';
import BeatStage, { BeatStageHandle } from './components/BeatStage';
import { ButterflyIcon, CompassIcon } from './components/MorphoCompassIcons';
import { exportJSON } from './lib/export';
import { savePosition, getPosition, clearPosition } from './lib/lastPosition';

/* ─── PWA install prompt typing ─────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/* ─── Export payload: gather chapter responses, readings, journey ─── */
const EXPORT_KEYS = [
  'origin.v1', 'origin.tile', 'origin.readings', 'origin.codex',
  'origin.cumulative', 'origin.archive.unlocked', 'origin.body',
  'origin.stream', 'origin.margins', 'origin.synthesis', 'origin.story',
  'origin.birth', 'origin.pace', 'origin.daily', 'origin.lastPosition',
  'origin.mode', 'origin-theme',
];

function gatherExportPayload(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of EXPORT_KEYS) {
    const v = localStorage.getItem(k);
    if (v !== null) out[k] = v;
  }
  out.__exportedAt = new Date().toISOString();
  out.__app = 'origin';
  return out;
}

function restoreImportPayload(data: Record<string, unknown>): void {
  for (const k of EXPORT_KEYS) {
    if (k in data) {
      const v = data[k];
      if (typeof v === 'string') localStorage.setItem(k, v);
    }
  }
}
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const JournalOverlay = lazy(() => import('./components/JournalOverlay'));
const HorizonOverlay = lazy(() => import('./components/HorizonOverlay'));
const SharingConsent = lazy(() => import('./components/SharingConsent'));
const SharePrompt = lazy(() => import('./components/SharePrompt'));

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
  const { t } = useTranslation();
  return (
    <nav className="spine" aria-label={t('nav.chapters')}>
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
  const { t } = useTranslation();
  const chapters = useMemo<Chapter[]>(
    () => CHAPTERS_V2.map(adaptV2Chapter),
    [],
  );
  const { user, ready: authLoaded, authenticated } = useAuth();
  const storageNamespace = useStorageNamespace();

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

  /* Theme (dark/light) — overrides the chapter palette's dark flag */
  const [dark, setDark] = useState<boolean>(() => {
    const s = localStorage.getItem('origin-theme');
    if (s === 'light') return false;
    if (s === 'dark') return true;
    return true; // default to the manuscript dark palette
  });
  const toggleTheme = useCallback(() => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('origin-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  /* Export / Import */
  const importFileRef = useRef<HTMLInputElement>(null);
  const handleExport = useCallback(() => {
    exportJSON(gatherExportPayload(), `origin-journey-${new Date().toISOString().slice(0, 10)}`);
  }, []);
  const handleImportClick = useCallback(() => {
    importFileRef.current?.click();
  }, []);

  const handleOpenJournal = useCallback(() => {
    setJournalInitialTab(undefined);
    setJournalOpen(true);
  }, []);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data && typeof data === 'object' && data.__app === 'origin') {
          restoreImportPayload(data as Record<string, unknown>);
          // Reload so the restored state takes effect across the app.
          window.location.reload();
        }
      } catch {
        /* ignore malformed import */
      }
    };
    reader.readAsText(file);
    // reset so the same file can be re-selected later
    e.target.value = '';
  }, []);

  /* Continue where you left off prompt */
  const [continuePrompt, setContinuePrompt] = useState<{ tileIdx: number } | null>(null);

  /* PWA install prompt */
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt]);

  /* Cumulative reading */
  const [hasCumulative, setHasCumulative] = useState<boolean>(() => !!getCumulative());
  const [generatingCumulative, setGeneratingCumulative] = useState(false);
  const [cumulativeError, setCumulativeError] = useState<string | null>(null);

  /* ── Hydrate IndexedDB-backed storage into the in-memory cache ─── */
  const [storageReady, setStorageReady] = useState<boolean>(() => isStorageHydrated());
  useEffect(() => {
    if (storageReady) return;
    let cancelled = false;
    initStorage().then(() => {
      if (cancelled) return;
      // Re-derive state that was read before hydration completed.
      setHasCumulative(!!getCumulative());
      setStorageReady(true);
    });
    return () => { cancelled = true; };
  }, [storageReady]);

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

  /* Share card prompt */
  const [sharePayload, setSharePayload] = useState<{ text: string; title?: string; eyebrow?: string } | null>(null);
  const handleShareRequest = useCallback((text: string, title?: string, eyebrow?: string) => {
    setSharePayload({ text, title, eyebrow });
  }, []);
  const closeSharePrompt = useCallback(() => setSharePayload(null), []);

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

  /* ── Persist last position for "continue" prompt ─────────────── */
  useEffect(() => { savePosition(tileIdx); }, [tileIdx]);

  /* ── On mount, offer to resume a saved position ──────────────── */
  useEffect(() => {
    const saved = getPosition();
    if (saved !== null && saved !== tileIdx && tiles[saved]) {
      setContinuePrompt({ tileIdx: saved });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── PWA beforeinstallprompt ─────────────────────────────────── */
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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
      // Fresh sign-in: migrate guest data to user namespace
      if (currentUserId) {
        migrateGuestToUser(currentUserId);
      }

      // Capture local snapshot for potential server migration
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
  }, [user?.id, authLoaded, storageNamespace]);

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

  /* ── Resume a saved tile position ────────────────────────────── */
  const resumePosition = useCallback((targetTile: number) => {
    const tile = tiles[targetTile];
    if (!tile) return;
    if (tile.kind === 'prelude' || tile.kind === 'prelude2') {
      handleChapterChange(0, 'prelude');
    } else if (tile.kind === 'epilogue') {
      handleChapterChange(chapters.length - 1, 'epilogue');
    } else if (tile.kind === 'opener') {
      handleChapterChange((tile as OpenerTile).ch, 'in-journey');
    } else if (tile.kind === 'scene') {
      handleChapterChange((tile as SceneTileData).ch, 'in-journey');
    }
  }, [tiles, chapters.length, handleChapterChange]);

  /* ── Keyboard shortcuts ─────────────────────────────────────── */
  const goToNextChapter = useCallback(() => {
    setActiveChapterIdx(idx => Math.min(idx + 1, chapters.length - 1));
    setActiveSectionKind('in-journey');
  }, [chapters.length]);

  const goToPrevChapter = useCallback(() => {
    setActiveChapterIdx(idx => Math.max(idx - 1, 0));
    setActiveSectionKind('in-journey');
  }, []);

  const handleSave = useCallback(() => {
    pushAll().catch(() => {});
  }, []);

  const handleCloseOverlay = useCallback(() => {
    if (horizonTarget) setHorizonTarget(null);
    else if (journalOpen) { setJournalOpen(false); setJournalInitialTab(undefined); }
    else if (sharePayload) setSharePayload(null);
  }, [horizonTarget, journalOpen, sharePayload]);

  useKeyboardShortcuts({
    onNext: goToNextChapter,
    onPrev: goToPrevChapter,
    onSave: handleSave,
    onClose: handleCloseOverlay,
  });

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
    : { ...palette, dark };

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
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Helmet>
        <title>{t('app.title')}</title>
        <meta name="description" content={t('app.tagline')} />
        <meta property="og:title" content={t('app.title')} />
        <meta property="og:description" content={t('app.tagline')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/favicon.svg" />
        <meta property="og:url" content="https://mymetamyth.templeearth.cc" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/favicon.svg" />
        <link rel="canonical" href="https://mymetamyth.templeearth.cc" />
      </Helmet>
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
          <span>{t('app.brand')}</span>
        </button>
        <div className="topbar-right topbar-right--minimal">
          {!isOutside && (
            <div className="chapter-count">
              {chapters[activeChapterIdx].roman} · {chapters[activeChapterIdx].title}
            </div>
          )}
        </div>
      </header>

      {/* Desktop: Artifacts side panel (≥1024px) */}
      <ArtifactsPanel
        mode={mode}
        onToggleMode={toggleMode}
        onOpenJournal={handleOpenJournal}
        onExport={handleExport}
        onImportClick={handleImportClick}
        installPrompt={installPrompt}
        onInstall={handleInstall}
        hasMorpho={hasMorpho}
        t={t}
      />

      {/* Mobile / tablet: compact action bar (<1024px) */}
      <div className="action-bar" role="toolbar" aria-label="Quick actions">
        <AuthBar
          hasMigrationPrompt={showMigrationPrompt}
          onMigrate={handleMigrate}
        />
        <button
          className="mode-toggle action-bar-btn"
          onClick={toggleMode}
          aria-label={mode === 'color' ? t('mode.switchToPaper') : t('mode.switchToColor')}
          title={mode === 'color' ? t('mode.paper') : t('mode.color')}
        >
          <span className={`mode-dot mode-dot--color${mode === 'color' ? ' on' : ''}`} />
          <span className={`mode-dot mode-dot--paper${mode === 'paper' ? ' on' : ''}`} />
        </button>
        <button
          className={`instr-btn action-bar-btn${hasMorpho ? ' instr-btn--lit' : ''}`}
          onClick={handleOpenJournal}
          aria-label={t('nav.openJournal')}
          title={t('nav.journal')}
        >
          <ButterflyIcon size={18} glowing={hasMorpho} />
        </button>
        <button
          className="instr-btn action-bar-btn"
          onClick={handleExport}
          aria-label="Export journey data"
          title="Export"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className="instr-btn action-bar-btn"
          onClick={handleImportClick}
          aria-label="Import / restore journey data"
          title="Import"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21V9m0 0l-4 4m4-4l4 4M5 3h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {installPrompt && (
          <button
            className="instr-btn action-bar-btn"
            onClick={handleInstall}
            aria-label="Install Origin as an app"
            title="Install Origin"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v6m-3-3l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <a
          href="https://github.com/zacharycmarlow/Origin-v3"
          target="_blank"
          rel="noopener noreferrer"
          className="instr-btn action-bar-btn"
          aria-label="View source on GitHub"
          title="GitHub"
          style={{ textDecoration: 'none' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </div>

      <main className="stage" id="main-content">
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
          onShare={handleShareRequest}
        />
      </main>

      {cumulativeError && (
        <div className="cumulative-error" role="alert">
          {cumulativeError}
          <button className="btn-ghost small" onClick={() => setCumulativeError(null)}>{t('common.dismiss')}</button>
        </div>
      )}

      {horizonTarget && (
        <Suspense fallback={null}>
          <HorizonOverlay
            chapter={chapters[horizonTarget.chapterIdx]}
            chapterIdx={horizonTarget.chapterIdx}
            cycles={6}
            onComplete={() => setHorizonTarget(null)}
            onCancel={() => setHorizonTarget(null)}
          />
        </Suspense>
      )}

      {journalOpen && (
        <Suspense fallback={null}>
          <JournalOverlay
            onClose={() => { setJournalOpen(false); setJournalInitialTab(undefined); }}
            chapters={chapters}
            currentCh={activeChapterIdx}
            reachedCh={reachedCh}
            initialTab={journalInitialTab}
          />
        </Suspense>
      )}

      {showSharing && (
        <Suspense fallback={null}>
          <SharingConsent
            onDone={() => setSharingShown(true)}
            onSkip={() => setSharingShown(true)}
          />
        </Suspense>
      )}

      {sharePayload && (
        <Suspense fallback={null}>
          <SharePrompt
            open={!!sharePayload}
            onClose={closeSharePrompt}
            text={sharePayload.text}
            title={sharePayload.title}
            eyebrow={sharePayload.eyebrow}
          />
        </Suspense>
      )}

      {/* Hidden file input for import/restore */}
      <input
        ref={importFileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      {/* Continue where you left off prompt */}
      {continuePrompt && (
        <div
          role="dialog"
          aria-label="Continue where you left off"
          style={{
            position: 'fixed',
            left: '50%',
            top: '5rem',
            transform: 'translateX(-50%)',
            zIndex: 9500,
            background: 'rgba(26, 21, 16, 0.92)',
            color: '#f7f2e6',
            border: '1px solid var(--accent, #c89838)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            fontSize: 13,
            backdropFilter: 'blur(6px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <span>Continue where you left off?</span>
          <button
            className="btn-ghost small"
            onClick={() => {
              resumePosition(continuePrompt.tileIdx);
              setContinuePrompt(null);
            }}
          >Yes</button>
          <button
            className="btn-ghost small"
            onClick={() => {
              clearPosition();
              setContinuePrompt(null);
            }}
          >No</button>
        </div>
      )}

      {/* Floating theme toggle (dark/light) */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={dark ? 'light theme' : 'dark theme'}
      >
        {dark ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              const x1 = 12 + Math.cos(a) * 7;
              const y1 = 12 + Math.sin(a) * 7;
              const x2 = 12 + Math.cos(a) * 9.5;
              const y2 = 12 + Math.sin(a) * 9.5;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />;
            })}
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
