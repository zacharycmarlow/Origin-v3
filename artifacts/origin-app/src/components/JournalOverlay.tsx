import { useState, useMemo } from 'react';
import {
  getBodyEntries, getStreamEntries, deleteStreamEntry, deleteBodyEntry,
  getCodex, getCumulative, getReading, getUnlockedArchive,
  BodyEntry, StreamEntry, CodexEntry, CumulativeReading,
  MorphoReading, SageReading,
} from '../storage';
import { Chapter } from '../chapters';
import { BodyFigure } from './BodyOverlay';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';
import { ARCHIVE, ArchiveEntry } from '../archive';

type Tab = 'readings' | 'work' | 'codex';

interface Props {
  onClose: () => void;
  chapters: Chapter[];
  currentCh: number;
  reachedCh: number;
  initialTab?: Tab;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease', flexShrink: 0 }}>
    <polyline points="2,4 6,8 10,4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/* ── Reading-only detail (no user writing) ─────────────────── */
function ChapterReadingDetail({ morpho, sage }: { morpho?: MorphoReading; sage?: SageReading }) {
  if (!morpho && !sage) return null;
  return (
    <div className="jov-read-detail">
      {morpho && (
        <div className="jov-read-section">
          <div className="jov-read-section-head">
            <ButterflyIcon size={13} glowing />
            <span>Morpho</span>
          </div>
          <p className="jov-read-field jov-read-field--through">{morpho.throughLine}</p>
          {morpho.subtext && (
            <p className="jov-read-field jov-read-field--sub">{morpho.subtext}</p>
          )}
          {morpho.marginalNotes?.length > 0 && (
            <ul className="jov-read-notes">
              {morpho.marginalNotes.map((note, i) => (
                <li key={i} className="jov-read-note">
                  <em>{note.passage}</em> — {note.insight}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {sage && (
        <div className="jov-read-section">
          <div className="jov-read-section-head">
            <CompassIcon size={13} glowing />
            <span>Sage</span>
          </div>
          <p className="jov-read-field jov-read-field--resonance">{sage.resonance}</p>
          {sage.personalizedCodes?.length > 0 && (
            <div className="jov-read-list">
              <div className="jov-read-list-label">your codes</div>
              {sage.personalizedCodes.map((c, i) => (
                <div key={i} className="jov-read-list-item">
                  <span className="jov-read-list-title">{c.title}</span>
                  <span className="jov-read-list-body">{c.body}</span>
                </div>
              ))}
            </div>
          )}
          {sage.personalizedLore?.length > 0 && (
            <div className="jov-read-list">
              <div className="jov-read-list-label">your lore</div>
              {sage.personalizedLore.map((l, i) => (
                <div key={i} className="jov-read-list-item">
                  <span className="jov-read-list-title">{l.title}</span>
                  <span className="jov-read-list-body">{l.body}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Readings Tab ──────────────────────────────────────────── */
function ReadingsTab({ chapters, currentCh, reachedCh, cumulative }: {
  chapters: Chapter[];
  currentCh: number;
  reachedCh: number;
  cumulative: CumulativeReading | null;
}) {
  const [cumulativeOpen, setCumulativeOpen] = useState(true);
  const [expandedChs, setExpandedChs] = useState<Set<number>>(new Set([currentCh]));

  // Only show chapters that have at least one reading (morpho or sage)
  const chapterList = useMemo(() => {
    const result = [];
    for (let ci = reachedCh; ci >= 0; ci--) {
      const r = getReading(ci);
      if (r.morpho || r.sage) result.push(ci);
    }
    return result;
  }, [reachedCh]);

  const toggleCh = (ci: number) => {
    setExpandedChs(prev => {
      const n = new Set(prev);
      n.has(ci) ? n.delete(ci) : n.add(ci);
      return n;
    });
  };

  const hasAnyReadings = cumulative || chapterList.some(ci => {
    const r = getReading(ci);
    return r.morpho || r.sage;
  });

  if (!hasAnyReadings) {
    return (
      <div className="jov-empty">
        your readings will appear here
        <span>complete a chapter and cross its threshold to receive a reflection</span>
      </div>
    );
  }

  return (
    <div className="jov-readings-tab">
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

      {chapterList.map(ci => {
        const ch = chapters[ci];
        const r = getReading(ci);
        const accent = ch.palette.accent || '#c89838';
        const isOpen = expandedChs.has(ci);
        const hasReading = !!(r.morpho || r.sage);

        return (
          <div key={ci} className={'jov-reading-block' + (isOpen ? ' jov-reading-block--open' : '')}>
            <button
              className="jov-reading-block-head"
              onClick={() => toggleCh(ci)}
              aria-expanded={isOpen}
            >
              <span className="jov-reading-block-roman" style={{ color: accent }}>{ch.roman}</span>
              <span className="jov-reading-block-title">{ch.title}</span>
              <span className="jov-reading-block-glyphs" aria-hidden="true">
                {r.morpho && <ButterflyIcon size={12} glowing />}
                {r.sage && <CompassIcon size={12} glowing />}
              </span>
              <ChevronIcon open={isOpen} />
            </button>

            {!isOpen && hasReading && (
              <div className="jov-reading-excerpt">
                {r.morpho && (
                  <p className="jov-reading-excerpt-line">
                    <span className="jov-reading-excerpt-glyph" aria-hidden="true">
                      <ButterflyIcon size={10} />
                    </span>
                    {r.morpho.throughLine}
                  </p>
                )}
                {r.sage && (
                  <p className="jov-reading-excerpt-line jov-reading-excerpt-line--sage">
                    <span className="jov-reading-excerpt-glyph" aria-hidden="true">
                      <CompassIcon size={10} />
                    </span>
                    {r.sage.resonance}
                  </p>
                )}
              </div>
            )}

            {isOpen && (
              <div className="jov-reading-mini">
                {hasReading
                  ? <ChapterReadingDetail morpho={r.morpho} sage={r.sage} />
                  : (
                    <div className="jov-work-empty">
                      no reading for this chapter yet — complete it and cross the threshold
                    </div>
                  )
                }
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Work Tab ──────────────────────────────────────────────── */
function WorkTab({ chapters }: { chapters: Chapter[] }) {
  const [streamEntries, setStreamEntries] = useState<StreamEntry[]>(() => getStreamEntries());
  const [bodyEntries, setBodyEntries] = useState<BodyEntry[]>(() => getBodyEntries());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Stream entries grouped by chapter index, newest chapter first
  const streamByChapter = useMemo(() => {
    const map = new Map<number, StreamEntry[]>();
    for (const e of streamEntries) {
      const arr = map.get(e.chapter) ?? [];
      arr.push(e);
      map.set(e.chapter, arr);
    }
    // sort entries within each chapter newest-first, chapters newest-first
    const groups = Array.from(map.entries()).map(([ci, entries]) => ({
      ci,
      entries: [...entries].sort((a, b) => b.timestamp - a.timestamp),
    }));
    groups.sort((a, b) => b.ci - a.ci);
    return groups;
  }, [streamEntries]);

  // Body entries grouped by zone, newest-zone-activity first
  const bodyByZone = useMemo(() => {
    const map = new Map<string, BodyEntry[]>();
    for (const e of bodyEntries) {
      const arr = map.get(e.zoneId) ?? [];
      arr.push(e);
      map.set(e.zoneId, arr);
    }
    const groups = Array.from(map.entries()).map(([zoneId, entries]) => ({
      zoneId,
      zoneName: entries[0].energyCenter,
      entries: [...entries].sort((a, b) => b.timestamp - a.timestamp),
    }));
    groups.sort((a, b) => b.entries[0].timestamp - a.entries[0].timestamp);
    return groups;
  }, [bodyEntries]);

  const handleDeleteStream = (id: string) => {
    if (deletingId === id) {
      deleteStreamEntry(id);
      setStreamEntries(getStreamEntries());
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  const handleDeleteBody = (id: string) => {
    if (deletingId === id) {
      deleteBodyEntry(id);
      setBodyEntries(getBodyEntries());
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const hasStream = streamByChapter.length > 0;
  const hasBody = bodyByZone.length > 0;

  if (!hasStream && !hasBody) {
    return (
      <div className="jov-empty">
        your work will gather here
        <span>use stream to capture thoughts, body to mark where the work lands in you</span>
      </div>
    );
  }

  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5.5 6v4.5M8.5 6v4.5M3 3.5l.7 7.5a.5.5 0 0 0 .5.5h5.6a.5.5 0 0 0 .5-.5L11 3.5"
        stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const DeleteConfirm = ({ id, onConfirm }: { id: string; onConfirm: () => void }) => (
    <span className="jov-delete-confirm">
      <span>Delete this?</span>
      <button className="jov-delete-yes" onClick={onConfirm}>yes</button>
      <button className="jov-delete-no" onClick={() => setDeletingId(null)}>no</button>
    </span>
  );

  return (
    <div className="jov-work-tab">
      {/* Stream section — grouped by chapter */}
      <div className="jov-work-section">
        <div className="jov-work-section-head">
          <svg width="15" height="15" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M5 10 Q9 7 16 10 T27 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 16 Q9 13 16 16 T27 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".75" />
            <path d="M5 22 Q9 19 16 22 T27 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
          </svg>
          <span>what flowed</span>
        </div>
        {!hasStream ? (
          <div className="jov-work-empty">nothing captured yet</div>
        ) : (
          streamByChapter.map(({ ci, entries }) => {
            const ch = chapters[ci];
            const accent = ch?.palette.accent || '#c89838';
            return (
              <div key={ci} className="jov-work-chapter-group">
                <div className="jov-work-group-head" style={{ color: accent }}>
                  <span className="jov-work-group-roman">{ch?.roman}</span>
                  <span className="jov-work-group-name">{ch?.title?.toLowerCase()}</span>
                </div>
                <div className="jov-stream-list">
                  {entries.map(entry => {
                    const isLong = entry.text.length > 220;
                    const isExp = expanded.has(entry.id);
                    const displayText = isLong && !isExp ? entry.text.slice(0, 220) + '…' : entry.text;
                    const isDeleting = deletingId === entry.id;
                    return (
                      <div key={entry.id} className="jov-stream-entry">
                        <div className="jov-stream-text">{displayText}</div>
                        <div className="jov-stream-footer">
                          <span className="jov-stream-time">{formatTime(entry.timestamp)}</span>
                          <div className="jov-stream-actions">
                            {isLong && (
                              <button className="jov-more-btn" onClick={() => toggleExpand(entry.id)}>
                                {isExp ? 'less' : 'more'}
                              </button>
                            )}
                            {isDeleting ? (
                              <DeleteConfirm id={entry.id} onConfirm={() => handleDeleteStream(entry.id)} />
                            ) : (
                              <button className="jov-trash-btn" onClick={() => handleDeleteStream(entry.id)} aria-label="Delete entry">
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="jov-work-divider" />

      {/* Body section — grouped by zone */}
      <div className="jov-work-section">
        <div className="jov-work-section-head">
          <svg width="15" height="15" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 19 Q10 15 16 14.5 Q22 15 24 19" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 19 L10 27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M22 19 L22 27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>where it lived</span>
        </div>
        {!hasBody ? (
          <div className="jov-work-empty">no body notes yet</div>
        ) : (
          <div className="jov-body-tab">
            <div className="jov-body-figure-wrap" style={{ color: '#8a6e3a' }}>
              <BodyFigure entries={bodyEntries} chapters={chapters} interactive={false} scale={0.65} />
            </div>
            <div className="jov-body-list">
              {bodyByZone.map(({ zoneId, zoneName, entries }) => (
                <div key={zoneId} className="jov-work-chapter-group">
                  <div className="jov-work-group-head" style={{ color: '#8a6e3a' }}>
                    <span className="jov-work-group-name">{zoneName}</span>
                  </div>
                  {entries.map(entry => {
                    const accent = chapters[entry.chapter]?.palette.accent || '#c89838';
                    const isDeleting = deletingId === entry.id;
                    return (
                      <div key={entry.id} className="jov-body-entry" style={{ borderLeftColor: accent }}>
                        <div className="jov-body-note">{entry.note}</div>
                        <div className="jov-body-time" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{chapters[entry.chapter]?.roman} · {formatTime(entry.timestamp)}</span>
                          {isDeleting ? (
                            <DeleteConfirm id={entry.id} onConfirm={() => handleDeleteBody(entry.id)} />
                          ) : (
                            <button className="jov-trash-btn" onClick={() => handleDeleteBody(entry.id)} aria-label="Delete body note">
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Codex Tab ─────────────────────────────────────────────── */
function CodexTab({ chapters, codex, cumulative }: {
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

  return (
    <div className="jov-codex-tab">

      {/* Cumulative Reading */}
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

      {/* Your Codex */}
      {personalized.length > 0 && (
        <section className="arc-codex-section">
          <div className="arc-section-head">
            <span className="arc-section-title">Your Codex</span>
            <span className="arc-section-sub">
              {personalized.length} personal {personalized.length === 1 ? 'passage' : 'passages'}
            </span>
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

      {/* The Archive */}
      <section className="arc-codex-archive-section">
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
                <span className="arc-acc-progress">{unlockedCount}/{items.length}</span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="arc-accordion-body">
                  {items.map(entry => {
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
                          <span className="archive-card-scene">
                            {entry.sceneTitle.toLowerCase()} · {entry.sceneKind.toLowerCase()}
                          </span>
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

/* ── Main JournalOverlay ───────────────────────────────────── */
export default function JournalOverlay({ onClose, chapters, currentCh, reachedCh, initialTab }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'readings');
  const codex = useMemo(() => getCodex(), [tab]);
  const cumulative = useMemo(() => getCumulative(), [tab]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'readings', label: 'Readings' },
    { id: 'work', label: 'Your Work' },
    { id: 'codex', label: 'Codex' },
  ];

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

        <div className="jov-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={'jov-tab' + (tab === t.id ? ' active' : '')}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        <div className="jov-content">
          {tab === 'readings' && (
            <ReadingsTab
              chapters={chapters}
              currentCh={currentCh}
              reachedCh={reachedCh}
              cumulative={cumulative}
            />
          )}
          {tab === 'work' && (
            <WorkTab chapters={chapters} />
          )}
          {tab === 'codex' && (
            <CodexTab chapters={chapters} codex={codex} cumulative={cumulative} />
          )}
        </div>
      </div>
    </div>
  );
}
