import { useState, useEffect } from 'react';
import { load, save } from '../storage';

interface Props {
  sceneKey: string;
  placeholder?: string;
  rows?: number;
  big?: boolean;
}

export default function Journal({ sceneKey, placeholder, rows = 4, big }: Props) {
  const [val, setVal] = useState<string>(() => {
    const stored = load()[sceneKey];
    return typeof stored === 'string' ? stored : '';
  });

  useEffect(() => {
    const t = setTimeout(() => save(sceneKey, val), 300);
    return () => clearTimeout(t);
  }, [val, sceneKey]);

  const wordCount = val.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className={'journal' + (big ? ' journal-big' : '')}>
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={placeholder || 'write here…'}
        rows={rows}
      />
      <div className="journal-meta">
        <span>{val ? `saved · ${wordCount} words` : 'private to you'}</span>
      </div>
    </div>
  );
}
