import { useState, useMemo } from 'react';
import { ARCHIVE, ArchiveEntry } from '../../archive';
import { isArchiveUnlocked, getCodex, CodexEntry } from '../../storage';

interface Props {
  chapterIdx: number;
}

function CollapseIcon({ open }: { open: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease', flexShrink: 0 }}>
      <polyline points="2,4 6,8 10,4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CodexBlock({ entries, label }: { entries: CodexEntry[]; label: string }) {
  const [open, setOpen] = useState(false);
  if (entries.length === 0) return null;
  return (
    <div className="ia-group">
      <button className="ia-group-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="ia-group-label">{label}</span>
        <span className="ia-group-count">{entries.length}</span>
        <CollapseIcon open={open} />
      </button>
      {open && (
        <div className="ia-group-body">
          {entries.map(entry => (
            <div key={entry.id} className={`ia-entry ia-entry--${entry.kind}`}>
              <div className="ia-entry-title">{entry.title}</div>
              <div className="ia-entry-body">{entry.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArchiveBlock({ entries }: { entries: ArchiveEntry[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  if (entries.length === 0) return null;

  const toggleEntry = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="ia-group">
      <button className="ia-group-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="ia-group-label">archive</span>
        <span className="ia-group-count">{entries.length}</span>
        <CollapseIcon open={open} />
      </button>
      {open && (
        <div className="ia-group-body">
          {entries.map(entry => {
            const key = `${entry.chapterIdx}|${entry.kind}|${entry.title}`;
            const isExpanded = expanded.has(key);
            return (
              <div key={key} className="ia-archive-entry">
                <button className="ia-archive-entry-head" onClick={() => toggleEntry(key)}>
                  <span className={`ia-archive-kind ia-archive-kind--${entry.kind}`}>{entry.kind}</span>
                  <span className="ia-archive-title">{entry.title}</span>
                  <CollapseIcon open={isExpanded} />
                </button>
                {isExpanded && (
                  <div className="ia-archive-body">
                    <div className="ia-archive-scene">{entry.sceneTitle} · {entry.sceneKind}</div>
                    <p>{entry.body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InlineArchiveSection({ chapterIdx }: Props) {
  const codexEntries = useMemo(() => getCodex().filter(e => e.chapter === chapterIdx), [chapterIdx]);
  const codes = useMemo(() => codexEntries.filter(e => e.kind === 'code'), [codexEntries]);
  const lore = useMemo(() => codexEntries.filter(e => e.kind === 'lore'), [codexEntries]);
  const archiveEntries = useMemo(
    () => ARCHIVE.filter(
      e => e.chapterIdx === chapterIdx && isArchiveUnlocked(e.chapterIdx, e.kind, e.title)
    ),
    [chapterIdx]
  );

  const totalUnlocked = codes.length + lore.length + archiveEntries.length;
  if (totalUnlocked === 0) return null;

  return (
    <div className="inline-archive">
      <div className="inline-archive-header">
        <svg viewBox="0 0 18 18" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="2" y="4" width="14" height="11" rx="1.5" />
          <path d="M6 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" strokeLinecap="round" />
          <line x1="5" y1="8.5" x2="13" y2="8.5" strokeLinecap="round" />
          <line x1="5" y1="11.5" x2="10" y2="11.5" strokeLinecap="round" />
        </svg>
        <span className="inline-archive-label">archive</span>
        <span className="inline-archive-count">{totalUnlocked} unlocked</span>
      </div>
      <CodexBlock entries={codes} label="your codes" />
      <CodexBlock entries={lore} label="your lore" />
      <ArchiveBlock entries={archiveEntries} />
    </div>
  );
}
