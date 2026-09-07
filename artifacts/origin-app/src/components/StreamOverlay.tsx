import { useState, useEffect, useRef, useMemo } from 'react';
import {
  getStreamEntries, addStreamEntry, deleteStreamEntry, StreamEntry
} from '../storage';
import { Chapter } from '../chapters';
import { useSpeechRecognition, speechAvailable } from '../hooks/useSpeechRecognition';

interface Props {
  onClose: () => void;
  chapters: Chapter[];
  currentCh: number;
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function StreamOverlay({ onClose, chapters, currentCh }: Props) {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<StreamEntry[]>(() => getStreamEntries());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { listening, toggle, stop, baseRef } = useSpeechRecognition(setText, { autoRestart: false });
  const taRef = useRef<HTMLTextAreaElement>(null);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.timestamp - a.timestamp),
    [entries]
  );

  // Focus textarea on open so the user can just start writing.
  useEffect(() => {
    const t = setTimeout(() => taRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, []);

  // ESC closes overlay (or stops mic if listening).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (listening) {
          stop();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, listening, stop]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (listening) stop();
    addStreamEntry(currentCh, trimmed);
    setText('');
    baseRef.current = '';
    setEntries(getStreamEntries());
    taRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleDelete = (id: string) => {
    deleteStreamEntry(id);
    setEntries(getStreamEntries());
    setConfirmDelete(null);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const accent = chapters[currentCh]?.palette.accent || '#c89838';

  return (
    <div className="stream-backdrop" role="dialog" aria-modal="true" aria-label="Stream">
      <div className="stream-shell">
        <div className="stream-topbar">
          <div className="stream-title">STREAM</div>
          <div className="stream-meta">
            <em>what's moving through?</em>
          </div>
          <button
            className="stream-close"
            onClick={onClose}
            aria-label="Close stream"
            title="Close (Esc)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 3 L11 11 M11 3 L3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="stream-stage">
          <div className="stream-write">
            <textarea
              ref={taRef}
              className="stream-input"
              value={text}
              onChange={e => {
                baseRef.current = e.target.value;
                setText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="let it pour…"
              rows={6}
            />
            {speechAvailable && (
              <button
                className={'stream-mic' + (listening ? ' is-listening' : '')}
                onClick={() => toggle(text)}
                aria-label={listening ? 'Stop listening' : 'Speak'}
                title={listening ? 'Stop' : 'Speak'}
              >
                {listening ? (
                  <span className="stream-mic-pulse">
                    <span /><span /><span />
                  </span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <rect x="7" y="2" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M4 10a6 6 0 0 0 12 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="10" y1="16" x2="10" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="stream-actions">
            <span className="stream-hint">
              {text ? `${wordCount} word${wordCount === 1 ? '' : 's'}` : (listening ? 'listening…' : '⌘/Ctrl + ↵ to save')}
            </span>
            <button
              className="stream-save"
              onClick={handleSave}
              disabled={!text.trim()}
              style={{ borderColor: accent, color: accent }}
            >
              save
            </button>
          </div>

          <div className="stream-history">
            {sortedEntries.length === 0 ? (
              <div className="stream-empty">
                The stream begins when you do.
              </div>
            ) : (
              <>
                <div className="stream-history-label">downstream</div>
                {sortedEntries.map(entry => {
                  const a = chapters[entry.chapter]?.palette.accent || '#c89838';
                  const roman = chapters[entry.chapter]?.roman || '';
                  return (
                    <div key={entry.id} className="stream-entry">
                      <div className="stream-entry-text">{entry.text}</div>
                      <div className="stream-entry-meta">
                        <span className="stream-entry-stamp" style={{ color: a }}>
                          <span className="stream-entry-dot" style={{ background: a }} />
                          {roman}
                        </span>
                        <span className="stream-entry-time">{formatRelative(entry.timestamp)}</span>
                        {confirmDelete === entry.id ? (
                          <span className="stream-entry-confirm">
                            <span>delete?</span>
                            <button
                              className="stream-entry-yes"
                              onClick={() => handleDelete(entry.id)}
                            >yes</button>
                            <button
                              className="stream-entry-no"
                              onClick={() => setConfirmDelete(null)}
                            >no</button>
                          </span>
                        ) : (
                          <button
                            className="stream-entry-trash"
                            onClick={() => setConfirmDelete(entry.id)}
                            aria-label="Delete entry"
                            title="Delete"
                          >
                            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
                              <path d="M3 4h8M5.5 4V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M4 4l.5 7a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1L10 4" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
