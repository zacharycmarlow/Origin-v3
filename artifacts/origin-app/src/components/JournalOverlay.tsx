import { useState, useMemo } from 'react';
import {
  load,
  getBodyEntries, getStreamEntries, deleteStreamEntry,
  getCodex, getCumulative, isChapterComplete, getUnlockedArchive,
  BodyEntry, StreamEntry, CodexEntry, CumulativeReading,
} from '../storage';
import { Chapter } from '../chapters';
import { BodyFigure } from './BodyOverlay';
import MiniJournal from './MiniJournal';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';
import { ARCHIVE, ArchiveEntry } from '../archive';

type Tab = 'reading' | 'spine' | 'body' | 'stream' | 'archive';

interface Props {
  onClose: () => void;
  chapters: Chapter[];
  currentCh: number;
  reachedCh: number;
  initialTab?: Tab;
}

interface SpineEntry {
  title: string;
  promptText: string;
  response: string | null;
  chIdx: number;
}

function extractSpineEntries(chapters: Chapter[], chFilter: number | 'all'): SpineEntry[] {
  const stored = load();
  const entries: SpineEntry[] = [];

  const processChapter = (ch: Chapter, ci: number) => {
    for (const scene of ch.scenes) {
      if ((scene.kind === 'prompt' || scene.kind === 'broadcast') && scene.key) {
        entries.push({
          title: scene.title || scene.kind,
          promptText: scene.body || '',
          response: typeof stored[scene.key] === 'string' ? stored[scene.key] as string : null,
          chIdx: ci,
        });
      }
      if (scene.kind === 'threshold' && scene.prompt?.key) {
        entries.push({
          title: 'The Threshold',
          promptText: scene.body || scene.prompt.placeholder || '',
          response: typeof stored[scene.prompt.key] === 'string' ? stored[scene.prompt.key] as string : null,
          chIdx: ci,
        });
      }
      if (scene.kind === 'voices' && scene.key) {
        const raw = stored[scene.key];
        const voices = Array.isArray(raw) ? (raw as string[]) : [];
        if (voices.length > 0) {
          entries.push({
            title: scene.title || 'The Voices',
            promptText: scene.body || '',
            response: voices.join('\n'),
            chIdx: ci,
          });
        }
      }
      if (scene.kind === 'gratitude' && scene.keys && scene.items) {
        scene.keys.forEach((key, i) => {
          entries.push({
            title: scene.title || 'Gratitude',
            promptText: scene.items![i] || '',
            response: typeof stored[key] === 'string' ? stored[key] as string : null,
            chIdx: ci,
          });
        });
      }
      if (scene.kind === 'declaration' && scene.keys) {
        const hasAny = scene.keys.some(k => typeof stored[k] === 'string' && stored[k]);
        if (hasAny) {
          scene.keys.forEach((key) => {
            const resp = typeof stored[key] === 'string' ? stored[key] as string : null;
            entries.push({
              title: 'I Am',
              promptText: 'I am…',
              response: resp,
              chIdx: ci,
            });
          });
        }
      }
      if (scene.kind === 'gathering' && scene.lines) {
        scene.lines.forEach(line => {
          if (!line.key) return;
          entries.push({
            title: 'The Gathering',
            promptText: line.label,
            response: typeof stored[line.key] === 'string' ? stored[line.key] as string : null,
            chIdx: ci,
          });
        });
      }
    }
  };

  if (chFilter === 'all') {
    chapters.forEach((ch, ci) => processChapter(ch, ci));
  } else {
    processChapter(chapters[chFilter], chFilter);
  }
  return entries;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function SpineTab({ chapters, selectedCh }: { chapters: Chapter[]; selectedCh: number | 'all' }) {
  const entries = useMemo(() => extractSpineEntries(chapters, selectedCh), [chapters, selectedCh]);
  if (entries.length === 0) return <div className="jov-empty">Nothing written yet.</div>;
  let lastChIdx = -1;
  return (
    <div className="jov-spine">
      {entries.map((entry, i) => {
        const showChHeading = selectedCh === 'all' && entry.chIdx !== lastChIdx;
        if (showChHeading) lastChIdx = entry.chIdx;
        const accent = chapters[entry.chIdx]?.palette.accent || '#c89838';
        return (
          <div key={i}>
            {showChHeading && (
              <div className="jov-ch-heading" style={{ color: accent }}>
                {chapters[entry.chIdx].roman} · {chapters[entry.chIdx].title}
              </div>
            )}
            <div className="jov-spine-entry">
              <div className="jov-spine-prompt">{entry.promptText}</div>
              {entry.response ? (
                <div className="jov-spine-response" style={{ borderLeftColor: accent }}>
                  {entry.response}
                </div>
              ) : (
                <div className="jov-spine-empty">[not yet written]</div>
              )}
            </div>
            {i < entries.length - 1 && <div className="jov-divider" />}
          </div>
        );
      })}
    </div>
  );
}

function BodyTab({ entries, allEntries, chapters, selectedCh }: {
  entries: BodyEntry[]; allEntries: BodyEntry[]; chapters: Chapter[]; selectedCh: number | 'all';
}) {
  const figureEntries = allEntries;
  if (allEntries.length === 0) {
    return (
      <div className="jov-empty">
        No body notes yet.<br />
        <span>Tap the body icon during the journey to mark where the work lands in you.</span>
      </div>
    );
  }
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  let lastChIdx = -1;
  return (
    <div className="jov-body-tab">
      <div className="jov-body-figure-wrap" style={{ color: '#8a6e3a' }}>
        <BodyFigure entries={figureEntries} chapters={chapters} interactive={false} scale={0.7} />
      </div>
      {sorted.length === 0 ? (
        <div className="jov-empty" style={{ paddingTop: 12 }}>No notes for this chapter.</div>
      ) : (
        <div className="jov-body-list">
          {sorted.map(entry => {
            const showHeading = selectedCh === 'all' && entry.chapter !== lastChIdx;
            if (showHeading) lastChIdx = entry.chapter;
            const accent = chapters[entry.chapter]?.palette.accent || '#c89838';
            return (
              <div key={entry.id}>
                {showHeading && (
                  <div className="jov-ch-heading" style={{ color: accent }}>
                    {chapters[entry.chapter]?.roman} · {chapters[entry.chapter]?.title}
                  </div>
                )}
                <div className="jov-body-entry" style={{ borderLeftColor: accent }}>
                  <div className="jov-body-center" style={{ color: accent }}>{entry.energyCenter}</div>
                  <div className="jov-body-note">{entry.note}</div>
                  <div className="jov-body-time">{formatTime(entry.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StreamTab({ entries, chapters, selectedCh, onDelete, deletingId, onCancelDelete }: {
  entries: StreamEntry[]; chapters: Chapter[]; selectedCh: number | 'all';
  onDelete: (id: string) => void; deletingId: string | null; onCancelDelete: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  if (entries.length === 0) {
    return (
      <div className="jov-empty">
        No stream captures yet.<br />
        <span>Thoughts you capture during the journey will appear here.</span>
      </div>
    );
  }
  let lastChIdx = -1;
  return (
    <div className="jov-stream-list">
      {entries.map(entry => {
        const showHeading = selectedCh === 'all' && entry.chapter !== lastChIdx;
        if (showHeading) lastChIdx = entry.chapter;
        const accent = chapters[entry.chapter]?.palette.accent || '#c89838';
        const isLong = entry.text.length > 200;
        const isExpanded = expanded.has(entry.id);
        const displayText = isLong && !isExpanded ? entry.text.slice(0, 200) + '…' : entry.text;
        const isDeleting = deletingId === entry.id;
        return (
          <div key={entry.id}>
            {showHeading && (
              <div className="jov-ch-heading" style={{ color: accent }}>
                {chapters[entry.chapter]?.roman} · {chapters[entry.chapter]?.title}
              </div>
            )}
            <div className="jov-stream-entry">
              <div className="jov-stream-text">{displayText}</div>
              <div className="jov-stream-footer">
                <span className="jov-stream-time">{formatTime(entry.timestamp)}</span>
                <div className="jov-stream-actions">
                  {isLong && (
                    <button
                      className="jov-more-btn"
                      onClick={() => setExpanded(prev => {
                        const n = new Set(prev);
                        n.has(entry.id) ? n.delete(entry.id) : n.add(entry.id);
                        return n;
                      })}
                    >{isExpanded ? 'less' : 'more'}</button>
                  )}
                  {isDeleting ? (
                    <span className="jov-delete-confirm">
                      <span>Delete this?</span>
                      <button className="jov-delete-yes" onClick={() => onDelete(entry.id)}>yes</button>
                      <button className="jov-delete-no" onClick={onCancelDelete}>no</button>
                    </span>
                  ) : (
                    <button className="jov-trash-btn" onClick={() => onDelete(entry.id)} aria-label="Delete entry">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5.5 6v4.5M8.5 6v4.5M3 3.5l.7 7.5a.5.5 0 0 0 .5.5h5.6a.5.5 0 0 0 .5-.5L11 3.5"
                          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArchiveTab({ chapters, codex, cumulative }: {
  chapters: Chapter[]; codex: CodexEntry[]; cumulative: CumulativeReading | null;
}) {
  const [cumulativeOpen, setCumulativeOpen] = useState(true);
  const [openAccordions, setOpenAccordions] = useState<Set<number>>(new Set());
  const [codexFilter, setCodexFilter] = useState<number | 'all'>('all');

  const unlocked = useMemo(() => getUnlockedArchive(), []);
  const totalUnlocked = ARCHIVE.filter(e => unlocked.has(`${e.chapterIdx}|${e.kind}|${e.title}`)).length;

  const grouped: Record<number, ArchiveEntry[]> = {};
  for (const e of ARCHIVE) {
    (grouped[e.chapterIdx] ||= []).push(e);
  }

  const personalized = useMemo(
    () => [...codex].sort((a, b) => a.chapter - b.chapter || a.timestamp - b.timestamp),
    [codex]
  );

  const filteredCodex = useMemo(
    () => codexFilter === 'all' ? personalized : personalized.filter(e => e.chapter === codexFilter),
    [personalized, codexFilter]
  );

  const chaptersWithCodex = useMemo(
    () => [...new Set(personalized.map(e => e.chapter))].sort((a, b) => a - b),
    [personalized]
  );

  const toggleAccordion = (ci: number) => {
    setOpenAccordions(prev => {
      const next = new Set(prev);
      next.has(ci) ? next.delete(ci) : next.add(ci);
      return next;
    });
  };

  const LockIcon = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="3" y="5.5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5.5V4a1.5 1.5 0 1 1 3 0v1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
  const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}>
      <polyline points="2,4 6,8 10,4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );

  return (
    <div className="jov-archive-tab">

      {/* ── 1. Cumulative Reading ───────────────────────────── */}
      {cumulative && (
        <section className="arc-cumulative">
          <button
            className="arc-cumulative-head"
            onClick={() => setCumulativeOpen(o => !o)}
            aria-expanded={cumulativeOpen}
          >
            <span className="arc-cumulative-glyphs">
              <ButterflyIcon size={16} glowing />
              <CompassIcon size={16} glowing />
            </span>
            <span className="arc-cumulative-title">The Cumulative Reading</span>
            <ChevronIcon open={cumulativeOpen} />
          </button>
          {cumulativeOpen && (
            <div className="arc-cumulative-body">
              <div className="arc-field-label">through-line</div>
              <div className="arc-field-text">{cumulative.morpho.throughLine}</div>
              <div className="arc-field-label">subtext</div>
              <div className="arc-field-text">{cumulative.morpho.subtext}</div>
              <div className="arc-field-label">resonance</div>
              <div className="arc-field-text">{cumulative.sage.resonance}</div>
            </div>
          )}
        </section>
      )}

      {/* ── 2. Your Codex ───────────────────────────────────── */}
      {personalized.length > 0 && (
        <section className="arc-codex-section">
          <div className="arc-section-head">
            <span className="arc-section-title">Your Codex</span>
            <span className="arc-section-sub">{personalized.length} personal {personalized.length === 1 ? 'passage' : 'passages'}</span>
          </div>

          {chaptersWithCodex.length > 1 && (
            <div className="arc-codex-filter" role="group" aria-label="Filter by chapter">
              <button
                className={'arc-filter-btn' + (codexFilter === 'all' ? ' active' : '')}
                onClick={() => setCodexFilter('all')}
              >All</button>
              {chaptersWithCodex.map(ci => (
                <button
                  key={ci}
                  className={'arc-filter-btn' + (codexFilter === ci ? ' active' : '')}
                  onClick={() => setCodexFilter(ci)}
                >{chapters[ci]?.roman}</button>
              ))}
            </div>
          )}

          <div className="arc-codex-grid">
            {filteredCodex.map(entry => (
              <article
                key={entry.id}
                className={'arc-codex-card arc-codex-card--' + entry.kind}
              >
                <div className="arc-codex-card-meta">
                  <span className="arc-codex-card-kind">{entry.kind}</span>
                  <span className="arc-codex-card-ch">{chapters[entry.chapter]?.roman}</span>
                </div>
                <h3 className="arc-codex-card-title">{entry.title}</h3>
                <p className="arc-codex-card-body">{entry.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── 3. The Archive ──────────────────────────────────── */}
      <section className="arc-archive-section">
        <div className="arc-section-head">
          <span className="arc-section-title">The Archive</span>
          <span className="arc-section-sub">
            {totalUnlocked === 0
              ? 'unlock passages by exploring codes and lore'
              : `${totalUnlocked} of ${ARCHIVE.length} unlocked`}
          </span>
        </div>

        {chapters.map((ch, ci) => {
          const items = grouped[ci] || [];
          if (items.length === 0) return null;
          const isOpen = openAccordions.has(ci);
          const unlockedCount = items.filter(e => unlocked.has(`${e.chapterIdx}|${e.kind}|${e.title}`)).length;
          const accent = ch.palette.accent || '#c89838';
          return (
            <div key={ci} className={'arc-accordion' + (isOpen ? ' arc-accordion--open' : '')}>
              <button
                className="arc-accordion-head"
                onClick={() => toggleAccordion(ci)}
                aria-expanded={isOpen}
                style={{ '--acc-accent': accent } as React.CSSProperties}
              >
                <span className="arc-acc-roman" style={{ color: accent }}>{ch.roman}</span>
                <span className="arc-acc-title">{ch.title}</span>
                <span className="arc-acc-progress">
                  {unlockedCount}/{items.length}
                </span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="arc-accordion-body">
                  {items.map((entry) => {
                    const id = `${entry.chapterIdx}|${entry.kind}|${entry.title}`;
                    const isUnlocked = unlocked.has(id);
                    return (
                      <article
                        key={id}
                        className={
                          'archive-card archive-card--' + entry.kind +
                          (isUnlocked ? ' archive-card--unlocked' : ' archive-card--locked')
                        }
                      >
                        <header className="archive-card-head">
                          <span className="archive-card-kind">{entry.kind}</span>
                          <span className="archive-card-scene">{entry.sceneTitle.toLowerCase()} · {entry.sceneKind.toLowerCase()}</span>
                          <span className="archive-card-state" aria-hidden="true">
                            {isUnlocked ? <CheckIcon /> : <LockIcon />}
                          </span>
                        </header>
                        <h3 className="archive-card-title">{entry.title}</h3>
                        {isUnlocked ? (
                          <div className="archive-card-body">
                            {entry.body.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                          </div>
                        ) : (
                          <p className="archive-card-locked-note">
                            Open this {entry.kind} inside the scene to reveal the full passage.
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default function JournalOverlay({ onClose, chapters, currentCh, reachedCh, initialTab }: Props) {
  const chapterComplete = isChapterComplete(chapters[currentCh]);
  const [tab, setTab] = useState<Tab>(initialTab ?? (chapterComplete ? 'reading' : 'spine'));
  const [selectedCh, setSelectedCh] = useState<number | 'all'>(currentCh);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [streamEntries, setStreamEntries] = useState(() => getStreamEntries());
  const [bodyEntries] = useState(() => getBodyEntries());
  const codex = useMemo(() => getCodex(), [tab]);
  const cumulative = useMemo(() => getCumulative(), [tab]);

  const filteredBody = useMemo(() =>
    selectedCh === 'all' ? bodyEntries : bodyEntries.filter(e => e.chapter === selectedCh),
    [bodyEntries, selectedCh]
  );
  const filteredStream = useMemo(() => {
    const base = selectedCh === 'all' ? streamEntries : streamEntries.filter(e => e.chapter === selectedCh);
    return [...base].sort((a, b) => b.timestamp - a.timestamp);
  }, [streamEntries, selectedCh]);

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      deleteStreamEntry(id);
      setStreamEntries(getStreamEntries());
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  const readingChIdx = typeof selectedCh === 'number' ? selectedCh : currentCh;

  return (
    <div className="jov-backdrop">
      <div className="jov-panel" role="dialog" aria-modal="true" aria-label="Journal">
        <div className="jov-topbar">
          <span className="jov-title">Journal</span>
          <button className="jov-close" onClick={onClose} aria-label="Close journal">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {tab !== 'archive' && (
          <div className="jov-chapters">
            <button
              className={'jov-ch-btn' + (selectedCh === 'all' ? ' active' : '')}
              onClick={() => setSelectedCh('all')}
            >All</button>
            {chapters.slice(0, reachedCh + 1).map((ch, ci) => (
              <button
                key={ci}
                className={'jov-ch-btn' + (selectedCh === ci ? ' active' : '')}
                onClick={() => setSelectedCh(ci)}
              >{ch.roman}</button>
            ))}
          </div>
        )}

        <div className="jov-tabs">
          {(['reading', 'spine', 'body', 'stream', 'archive'] as Tab[]).map(t => (
            <button
              key={t}
              className={'jov-tab' + (tab === t ? ' active' : '')}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>

        <div className="jov-content">
          {tab === 'reading' && (
            <MiniJournal chapters={chapters} selectedCh={readingChIdx} />
          )}
          {tab === 'spine' && (
            <SpineTab chapters={chapters} selectedCh={selectedCh} />
          )}
          {tab === 'body' && (
            <BodyTab entries={filteredBody} allEntries={bodyEntries} chapters={chapters} selectedCh={selectedCh} />
          )}
          {tab === 'stream' && (
            <StreamTab
              entries={filteredStream} chapters={chapters} selectedCh={selectedCh}
              onDelete={handleDelete} deletingId={deletingId} onCancelDelete={() => setDeletingId(null)}
            />
          )}
          {tab === 'archive' && (
            <ArchiveTab chapters={chapters} codex={codex} cumulative={cumulative} />
          )}
        </div>
      </div>
    </div>
  );
}

