import { useState, useMemo, useRef, useEffect } from 'react';
import { getBodyEntries, addBodyEntry, deleteBodyEntry, BodyEntry } from '../storage';
import { Chapter } from '../chapters';

interface Props {
  onClose: () => void;
  chapters: Chapter[];
  currentCh: number;
}

interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  pair?: { x: number; y: number };
}

const FIGURE_VB = { w: 240, h: 600 };

const ZONES: Zone[] = [
  { id: 'head',      name: 'Head',      x: 120, y: 60  },
  { id: 'brow',      name: 'Brow',      x: 120, y: 88  },
  { id: 'jaw',       name: 'Jaw',       x: 120, y: 116 },
  { id: 'throat',    name: 'Throat',    x: 120, y: 145 },
  { id: 'shoulders', name: 'Shoulders', x: 120, y: 168 },
  { id: 'heart',     name: 'Heart',     x: 120, y: 215 },
  { id: 'gut',       name: 'Gut',       x: 120, y: 258 },
  { id: 'belly',     name: 'Belly',     x: 120, y: 300 },
  { id: 'root',      name: 'Root',      x: 120, y: 340 },
  { id: 'hands',     name: 'Hands',     x: 50,  y: 365, pair: { x: 190, y: 365 } },
  { id: 'back',      name: 'Back',      x: 175, y: 200 },
];

const SECTOR_WIDTH = 360 / 7;
const SECTOR_PAD = 5;
const PETAL_RING = 14;
const PETAL_DOT = 2.4;

function petalsForZone(entries: BodyEntry[], chapters: Chapter[]) {
  const byCh = new Map<number, BodyEntry[]>();
  for (const e of entries) {
    if (!byCh.has(e.chapter)) byCh.set(e.chapter, []);
    byCh.get(e.chapter)!.push(e);
  }
  const petals: Array<{ x: number; y: number; color: string; ch: number; ts: number }> = [];
  for (const [ch, list] of byCh.entries()) {
    const sectorCenter = -90 + ch * SECTOR_WIDTH;
    const usable = SECTOR_WIDTH - SECTOR_PAD * 2;
    const n = list.length;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (i / (n - 1)) - 0.5;
      const angleDeg = sectorCenter + t * usable;
      const a = (angleDeg * Math.PI) / 180;
      petals.push({
        x: PETAL_RING * Math.cos(a),
        y: PETAL_RING * Math.sin(a),
        color: chapters[ch]?.palette.accent || '#c89838',
        ch,
        ts: list[i].timestamp,
      });
    }
  }
  return petals;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function BodyFigure({
  entries,
  chapters,
  selectedZoneId,
  onZoneClick,
  interactive = true,
  scale = 1,
}: {
  entries: BodyEntry[];
  chapters: Chapter[];
  selectedZoneId?: string | null;
  onZoneClick?: (zone: Zone) => void;
  interactive?: boolean;
  scale?: number;
}) {
  const entriesByZone = useMemo(() => {
    const m = new Map<string, BodyEntry[]>();
    for (const e of entries) {
      if (!m.has(e.zoneId)) m.set(e.zoneId, []);
      m.get(e.zoneId)!.push(e);
    }
    return m;
  }, [entries]);

  return (
    <svg
      className="body-figure"
      viewBox={`0 0 ${FIGURE_VB.w} ${FIGURE_VB.h}`}
      style={{ width: FIGURE_VB.w * scale, height: FIGURE_VB.h * scale }}
      aria-hidden={!interactive}
    >
      {/* Faint "back" silhouette echo behind the torso — suggests there's a back side */}
      <g className="body-back-echo">
        <path
          d="M 50 170 Q 120 150 190 170 L 188 340 Q 120 358 52 340 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          opacity="0.18"
          transform="translate(6, 0)"
        />
      </g>

      {/* The figure — minimal manuscript line art */}
      <g className="body-silhouette">
        {/* Head */}
        <circle cx="120" cy="78" r="30" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
        {/* Neck */}
        <path d="M 110 105 L 108 132 Q 120 138 132 132 L 130 105" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
        {/* Shoulders + torso outline */}
        <path
          d="M 50 170 Q 75 152 108 148 L 132 148 Q 165 152 190 170 L 184 340 Q 120 358 56 340 Z"
          fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.55"
        />
        {/* Arms */}
        <path d="M 50 172 Q 38 250 42 365" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M 190 172 Q 202 250 198 365" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        {/* Hands (small ovals) */}
        <ellipse cx="42" cy="372" rx="9" ry="11" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <ellipse cx="198" cy="372" rx="9" ry="11" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        {/* Pelvis */}
        <path d="M 60 340 Q 120 360 180 340" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        {/* Legs */}
        <path d="M 90 350 Q 80 470 88 580" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M 150 350 Q 160 470 152 580" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        {/* Centerline (very faint) */}
        <line x1="120" y1="110" x2="120" y2="345" stroke="currentColor" strokeWidth="0.3" opacity="0.15" strokeDasharray="2 4" />
      </g>

      {/* Constellation lines connecting central spine zones — subtle */}
      <g className="body-constellation" opacity="0.22">
        <line x1="120" y1="60" x2="120" y2="88" stroke="currentColor" strokeWidth="0.4" />
        <line x1="120" y1="88" x2="120" y2="116" stroke="currentColor" strokeWidth="0.4" />
        <line x1="120" y1="116" x2="120" y2="145" stroke="currentColor" strokeWidth="0.4" />
        <line x1="120" y1="145" x2="120" y2="168" stroke="currentColor" strokeWidth="0.4" />
        <line x1="120" y1="168" x2="120" y2="215" stroke="currentColor" strokeWidth="0.4" />
        <line x1="120" y1="215" x2="120" y2="258" stroke="currentColor" strokeWidth="0.4" />
        <line x1="120" y1="258" x2="120" y2="300" stroke="currentColor" strokeWidth="0.4" />
        <line x1="120" y1="300" x2="120" y2="340" stroke="currentColor" strokeWidth="0.4" />
      </g>

      {/* Zones — render petals first (behind the node), then the central node, then a hit area */}
      {ZONES.map(zone => {
        const zEntries = entriesByZone.get(zone.id) || [];
        const petals = petalsForZone(zEntries, chapters);
        const isSelected = selectedZoneId === zone.id;
        const isLit = zEntries.length > 0;
        const positions = zone.pair ? [{ x: zone.x, y: zone.y }, zone.pair] : [{ x: zone.x, y: zone.y }];

        return (
          <g key={zone.id} className={'body-zone-group' + (isSelected ? ' is-selected' : '')}>
            {positions.map((pos, idx) => (
              <g key={idx} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Petals — only render on the first marker of paired zones to avoid duplication */}
                {idx === 0 && petals.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x} cy={p.y} r={PETAL_DOT}
                    fill={p.color}
                    opacity="0.9"
                    style={{ filter: `drop-shadow(0 0 3px ${p.color})` }}
                  />
                ))}
                {/* Idle ring — always visible, dim if no entries */}
                <circle
                  r="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isLit ? 0.9 : 0.7}
                  opacity={isLit ? 0.85 : 0.45}
                />
                {/* Inner dot when lit */}
                {isLit && (
                  <circle r="1.6" fill="currentColor" opacity="0.7" />
                )}
                {/* Selected pulse */}
                {isSelected && (
                  <circle r="9" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" className="body-zone-pulse" />
                )}
                {/* Hit target — generous, transparent, keyboard-accessible */}
                {interactive && (
                  <circle
                    r="22"
                    fill="transparent"
                    className="body-zone-tap"
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${zone.name}${zEntries.length > 0 ? ` — ${zEntries.length} note${zEntries.length === 1 ? '' : 's'}` : ''}`}
                    onClick={() => onZoneClick?.(zone)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onZoneClick?.(zone);
                      }
                    }}
                  >
                    <title>{zone.name}</title>
                  </circle>
                )}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function BodyOverlay({ onClose, chapters, currentCh }: Props) {
  const [entries, setEntries] = useState(() => getBodyEntries());
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectedZone && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedZone]);

  // ESC closes the per-zone panel first, then the overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedZone) {
        setSelectedZone(null);
        setDraft('');
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedZone, onClose]);

  const zoneEntries = useMemo(() => {
    if (!selectedZone) return [];
    return entries
      .filter(e => e.zoneId === selectedZone.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [entries, selectedZone]);

  const handleSave = () => {
    if (!selectedZone || !draft.trim()) return;
    addBodyEntry(selectedZone.id, selectedZone.name, currentCh, draft);
    setEntries(getBodyEntries());
    setDraft('');
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      deleteBodyEntry(id);
      setEntries(getBodyEntries());
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const handleZoneClick = (zone: Zone) => {
    if (selectedZone?.id === zone.id) {
      setSelectedZone(null);
      setDraft('');
    } else {
      setSelectedZone(zone);
      setDraft('');
      setConfirmDeleteId(null);
    }
  };

  const closePanel = () => {
    setSelectedZone(null);
    setDraft('');
    setConfirmDeleteId(null);
  };

  const totalCount = entries.length;
  const litZones = new Set(entries.map(e => e.zoneId)).size;

  return (
    <div className="body-backdrop">
      <div className="body-shell" role="dialog" aria-modal="true" aria-label="Body">
        <div className="body-topbar">
          <span className="body-title">Body</span>
          <span className="body-meta">
            {totalCount === 0 ? (
              <em>where does this live in your body?</em>
            ) : (
              <>{totalCount} note{totalCount === 1 ? '' : 's'} · {litZones} zone{litZones === 1 ? '' : 's'}</>
            )}
          </span>
          <button className="body-close" onClick={onClose} aria-label="Close body">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="body-stage">
          <div className="body-figure-wrap" style={{ color: '#8a6e3a' }}>
            <BodyFigure
              entries={entries}
              chapters={chapters}
              selectedZoneId={selectedZone?.id || null}
              onZoneClick={handleZoneClick}
              interactive
            />
          </div>

          {/* Zone legend — chapter color key */}
          <div className="body-legend">
            <div className="body-legend-row">
              {chapters.map((ch, ci) => (
                <span key={ci} className="body-legend-item" title={ch.title}>
                  <span className="body-legend-dot" style={{ background: ch.palette.accent }} />
                  <span className="body-legend-roman">{ch.roman}</span>
                </span>
              ))}
            </div>
            <div className="body-legend-help">
              {selectedZone ? '' : 'Tap any point on the body.'}
            </div>
          </div>
        </div>

        {selectedZone && (
          <div className="body-sheet" onClick={(e) => { if (e.target === e.currentTarget) closePanel(); }}>
            <div className="body-sheet-card">
              <div className="body-sheet-head">
                <span className="body-sheet-zone">{selectedZone.name}</span>
                <button className="body-sheet-close" onClick={closePanel} aria-label="Close note">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <textarea
                ref={textareaRef}
                className="body-sheet-input"
                placeholder="what do you feel here?"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />

              <div className="body-sheet-actions">
                <span className="body-sheet-hint">{chapters[currentCh]?.roman} · {chapters[currentCh]?.title}</span>
                <button
                  className="body-sheet-save"
                  onClick={handleSave}
                  disabled={!draft.trim()}
                  style={{ borderColor: chapters[currentCh]?.palette.accent }}
                >save</button>
              </div>

              {zoneEntries.length > 0 && (
                <div className="body-sheet-history">
                  <div className="body-sheet-history-label">previous notes here</div>
                  {zoneEntries.map(entry => {
                    const accent = chapters[entry.chapter]?.palette.accent || '#c89838';
                    const isDeleting = confirmDeleteId === entry.id;
                    return (
                      <div key={entry.id} className="body-history-entry" style={{ borderLeftColor: accent }}>
                        <div className="body-history-text">{entry.note}</div>
                        <div className="body-history-meta">
                          <span className="body-history-tag" style={{ color: accent }}>
                            {chapters[entry.chapter]?.roman} · {chapters[entry.chapter]?.title}
                          </span>
                          <span className="body-history-time">{formatTime(entry.timestamp)}</span>
                          {isDeleting ? (
                            <span className="body-history-delete">
                              <span>delete?</span>
                              <button onClick={() => handleDelete(entry.id)} className="body-history-yes">yes</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="body-history-no">no</button>
                            </span>
                          ) : (
                            <button
                              className="body-history-trash"
                              onClick={() => handleDelete(entry.id)}
                              aria-label="Delete note"
                            >
                              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5.5 6v4.5M8.5 6v4.5M3 3.5l.7 7.5a.5.5 0 0 0 .5.5h5.6a.5.5 0 0 0 .5-.5L11 3.5"
                                  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
