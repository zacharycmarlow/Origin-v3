import { useState, useMemo, useRef, useEffect } from 'react';
import { getBodyEntries, addBodyEntry, deleteBodyEntry } from '../../storage';
import { Chapter } from '../../chapters';
import { BodyFigure } from '../BodyOverlay';

interface Props {
  chapterIdx: number;
  chapters: Chapter[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

interface Zone {
  id: string;
  name: string;
}

export default function InlineBodySection({ chapterIdx, chapters }: Props) {
  const [entries, setEntries] = useState(() => getBodyEntries());
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectedZone && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }, [selectedZone]);

  const zoneEntries = useMemo(() => {
    if (!selectedZone) return [];
    return entries
      .filter(e => e.zoneId === selectedZone.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [entries, selectedZone]);

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

  const handleSave = () => {
    if (!selectedZone || !draft.trim()) return;
    addBodyEntry(selectedZone.id, selectedZone.name, chapterIdx, draft);
    setEntries(getBodyEntries());
    setDraft('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
    textareaRef.current?.focus();
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

  const accent = chapters[chapterIdx]?.palette.accent || '#c89838';

  return (
    <div className="inline-body">
      <div className="inline-body-header">
        <svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="9" cy="3.5" r="1.5" />
          <path d="M9 5.5v5m-3 0 1 4h4l1-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 8.5h5" strokeLinecap="round" />
        </svg>
        <span className="inline-body-label">body</span>
        <em className="inline-body-sub">where does this live in you?</em>
      </div>

      <div className="inline-body-content">
        <div className="inline-body-figure-wrap">
          <BodyFigure
            entries={entries}
            chapters={chapters}
            selectedZoneId={selectedZone?.id || null}
            onZoneClick={handleZoneClick}
            interactive
            scale={0.65}
          />
        </div>

        <div className="inline-body-panel">
          {!selectedZone ? (
            <div className="inline-body-hint">
              <p>Tap any point on the body.</p>
              <div className="inline-body-legend">
                {chapters.map((ch, ci) => (
                  <span key={ci} className="inline-body-legend-item" title={ch.title}>
                    <span className="inline-body-legend-dot" style={{ background: ch.palette.accent }} />
                    <span>{ch.roman}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="inline-body-zone-editor">
              <div className="inline-body-zone-head">
                <span className="inline-body-zone-name">{selectedZone.name}</span>
                <button className="inline-body-zone-close" onClick={() => { setSelectedZone(null); setDraft(''); }} aria-label="Close">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <textarea
                ref={textareaRef}
                className="inline-body-input"
                placeholder="what do you feel here?"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={3}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />

              <div className="inline-body-actions">
                <span className="inline-body-chapter-hint">
                  {chapters[chapterIdx]?.roman} · {chapters[chapterIdx]?.title}
                </span>
                {saved && (
                  <span className="saved-pulse">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M1.5 6.5L4.5 9.5L10.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    saved
                  </span>
                )}
                <button
                  className="inline-body-save"
                  onClick={handleSave}
                  disabled={!draft.trim()}
                  style={{ borderColor: accent, color: accent }}
                >save</button>
              </div>

              {zoneEntries.length > 0 && (
                <div className="inline-body-history">
                  <div className="inline-body-history-label">previous notes here</div>
                  {zoneEntries.map(entry => {
                    const a = chapters[entry.chapter]?.palette.accent || '#c89838';
                    const isDeleting = confirmDeleteId === entry.id;
                    return (
                      <div key={entry.id} className="inline-body-history-entry" style={{ borderLeftColor: a }}>
                        <div className="inline-body-history-text">{entry.note}</div>
                        <div className="inline-body-history-meta">
                          <span style={{ color: a }}>{chapters[entry.chapter]?.roman}</span>
                          <span className="inline-body-history-time">{formatTime(entry.timestamp)}</span>
                          {isDeleting ? (
                            <span className="inline-body-confirm">
                              <button onClick={() => handleDelete(entry.id)}>yes</button>
                              <button onClick={() => setConfirmDeleteId(null)}>no</button>
                            </span>
                          ) : (
                            <button
                              className="inline-body-trash"
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
          )}
        </div>
      </div>
    </div>
  );
}
