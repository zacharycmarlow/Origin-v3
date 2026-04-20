import { useState, useEffect } from 'react';

interface Props {
  seconds?: number;
}

export default function MoveTimer({ seconds = 30 }: Props) {
  const [r, setR] = useState(seconds);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!run || r <= 0) return;
    const t = setTimeout(() => setR(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [run, r]);

  return (
    <div className="move">
      <div className="move-dial">
        <div className="move-num">{r === 0 ? '∎' : r}</div>
        <div className="move-sub">{r === 0 ? 'feel what stayed' : 'seconds'}</div>
      </div>
      {!run && r > 0 && (
        <button className="btn-ghost" onClick={() => setRun(true)}>
          <span className="label">begin</span>
        </button>
      )}
    </div>
  );
}
