import { useState, useMemo } from 'react';
import {
  load,
  getBodyEntries, getStreamEntries, deleteStreamEntry,
  BodyEntry, StreamEntry
} from '../storage';
import { Chapter } from '../chapters';

type Tab = 'spine' | 'body' | 'stream';

interface Props {
  onClose: () => void;
  chapters: Chapter[];
  currentCh: number;
  reachedCh: number;
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

function SpineTab({ chapters, selectedCh, reachedCh }: { chapters: Chapter[]; selectedCh: number | 'all'; reachedCh: number }) {
  const entries = useMemo(() => extractSpineEntries(chapters, selectedCh), [chapters, selectedCh]);

  if (entries.length === 0) {
    return <div className="jov-empty">Nothing written yet.</div>;
  }

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

function BodyTab({ entries, chapters, selectedCh }: { entries: BodyEntry[]; chapters: Chapter[]; selectedCh: number | 'all' }) {
  if (entries.length === 0) {
    return (
      <div className="jov-empty">
        No body notes yet.<br />
        <span>Body notes will appear here when you add them during the journey.</span>
      </div>
    );
  }

  let lastChIdx = -1;
  return (
    <div className="jov-body-list">
      {entries.map(entry => {
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
            <div className="jov-body-entry">
              <div className="jov-body-center" style={{ color: accent }}>{entry.energyCenter}</div>
              <div className="jov-body-note">{entry.note}</div>
              <div className="jov-body-time">{formatTime(entry.timestamp)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StreamTab({
  entries, chapters, selectedCh, onDelete, deletingId, onCancelDelete
}: {
  entries: StreamEntry[];
  chapters: Chapter[];
  selectedCh: number | 'all';
  onDelete: (id: string) => void;
  deletingId: string | null;
  onCancelDelete: () => void;
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

export default function JournalOverlay({ onClose, chapters, currentCh, reachedCh }: Props) {
  const [tab, setTab] = useState<Tab>('spine');
  const [selectedCh, setSelectedCh] = useState<number | 'all'>(currentCh);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [streamEntries, setStreamEntries] = useState(() => getStreamEntries());
  const [bodyEntries] = useState(() => getBodyEntries());

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

        <div className="jov-tabs">
          {(['spine', 'body', 'stream'] as Tab[]).map(t => (
            <button
              key={t}
              className={'jov-tab' + (tab === t ? ' active' : '')}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>

        <div className="jov-content">
          {tab === 'spine' && (
            <SpineTab chapters={chapters} selectedCh={selectedCh} reachedCh={reachedCh} />
          )}
          {tab === 'body' && (
            <BodyTab entries={filteredBody} chapters={chapters} selectedCh={selectedCh} />
          )}
          {tab === 'stream' && (
            <StreamTab
              entries={filteredStream}
              chapters={chapters}
              selectedCh={selectedCh}
              onDelete={handleDelete}
              deletingId={deletingId}
              onCancelDelete={() => setDeletingId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
