import { useState, useEffect } from 'react';
import { load, save } from '../storage';

interface Props {
  sceneKey: string;
  minutes?: number;
}

export default function Broadcast({ sceneKey, minutes = 4 }: Props) {
  const [val, setVal] = useState<string>(() => {
    const v = load()[sceneKey];
    return typeof v === 'string' ? v : '';
  });
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => save(sceneKey, val), 300);
    return () => clearTimeout(t);
  }, [val, sceneKey]);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setElapsed(e => e + 1), 1000);
    return () => clearTimeout(t);
  }, [running, elapsed]);

  const total = minutes * 60;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const pct = Math.min(100, (elapsed / total) * 100);

  return (
    <div className="broadcast">
      <div className="broadcast-bar">
        <div className="broadcast-time">{mm}:{ss}</div>
        <div className="broadcast-track">
          <div className="broadcast-fill" style={{ width: pct + '%' }} />
        </div>
        <button className="btn-ghost small" onClick={() => setRunning(r => !r)}>
          <span className="label">{running ? 'pause' : elapsed === 0 ? 'begin' : 'resume'}</span>
        </button>
      </div>
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        rows={14}
        placeholder="let it pour…"
        className="broadcast-ta"
      />
    </div>
  );
}
