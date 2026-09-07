import { useState, useMemo } from 'react';
import { getStreamEntries, addStreamEntry, deleteStreamEntry, StreamEntry } from '../../storage';
import { Chapter } from '../../chapters';
import { useSpeechRecognition, speechAvailable } from '../../hooks/useSpeechRecognition';

interface Props {
  chapterIdx: number;
  chapters: Chapter[];
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function InlineStreamSection({ chapterIdx, chapters }: Props) {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<StreamEntry[]>(() => getStreamEntries());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { listening, toggle, stop, baseRef } = useSpeechRecognition(setText, { autoRestart: false });

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.timestamp - a.timestamp),
    [entries]
  );

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (listening) stop();
    addStreamEntry(chapterIdx, trimmed);
    setText('');
    baseRef.current = '';
    setEntries(getStreamEntries());
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const handleDelete = (id: string) => {
    deleteStreamEntry(id);
    setEntries(getStreamEntries());
    setConfirmDelete(null);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const accent = chapters[chapterIdx]?.palette.accent || '#c89838';

  return (
    <div className="inline-stream">
      <div className="inline-stream-header">
        <svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 4h14M2 8h10M2 12h12M2 16h8" strokeLinecap="round" />
        </svg>
        <span className="inline-stream-label">stream</span>
        <em className="inline-stream-sub">what's moving through?</em>
      </div>

      <div className="inline-stream-write">
        <textarea
          className="inline-stream-input"
          value={text}
          onChange={e => { baseRef.current = e.target.value; setText(e.target.value); }}
          onKeyDown={e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
          placeholder="let it pour…"
          rows={4}
        />
        <div className="inline-stream-controls">
          {speechAvailable && (
            <button
              className={'inline-stream-mic' + (listening ? ' is-listening' : '')}
              onClick={() => toggle(text)}
              aria-label={listening ? 'Stop listening' : 'Speak'}
            >
              {listening ? (
                <span className="stream-mic-pulse"><span /><span /><span /></span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <rect x="7" y="2" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4 10a6 6 0 0 0 12 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="10" y1="16" x2="10" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
          <span className="inline-stream-hint">
            {text ? `${wordCount}w` : (listening ? 'listening…' : '⌘↵ to save')}
          </span>
          <button
            className="inline-stream-save"
            onClick={handleSave}
            disabled={!text.trim()}
            style={{ borderColor: accent, color: accent }}
          >save</button>
          {saved && (
            <span className="saved-pulse">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 6.5L4.5 9.5L10.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              saved
            </span>
          )}
        </div>
      </div>

      {sortedEntries.length > 0 && (
        <div className="inline-stream-history">
          <div className="inline-stream-history-label">downstream</div>
          {sortedEntries.map(entry => {
            const a = chapters[entry.chapter]?.palette.accent || '#c89838';
            const roman = chapters[entry.chapter]?.roman || '';
            return (
              <div key={entry.id} className="inline-stream-entry">
                <div className="inline-stream-entry-text">{entry.text}</div>
                <div className="inline-stream-entry-meta">
                  <span className="inline-stream-entry-stamp" style={{ color: a }}>
                    <span className="inline-stream-entry-dot" style={{ background: a }} />
                    {roman}
                  </span>
                  <span className="inline-stream-entry-time">{formatRelative(entry.timestamp)}</span>
                  {confirmDelete === entry.id ? (
                    <span className="inline-stream-confirm">
                      <span>delete?</span>
                      <button onClick={() => handleDelete(entry.id)}>yes</button>
                      <button onClick={() => setConfirmDelete(null)}>no</button>
                    </span>
                  ) : (
                    <button
                      className="inline-stream-trash"
                      onClick={() => setConfirmDelete(entry.id)}
                      aria-label="Delete entry"
                    >
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M3 4h8M5.5 4V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M4 4l.5 7a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1L10 4"
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
  );
}
