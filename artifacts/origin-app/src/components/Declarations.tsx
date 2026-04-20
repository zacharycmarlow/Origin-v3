import { useState, useMemo } from 'react';
import { load, save } from '../storage';

interface Props {
  keys: string[];
}

export default function Declarations({ keys }: Props) {
  const initial = useMemo(() => keys.map(k => {
    const v = load()[k];
    return typeof v === 'string' ? v : '';
  }), [keys]);
  const [vals, setVals] = useState<string[]>(initial);

  const setAt = (i: number, v: string) => {
    const n = [...vals]; n[i] = v; setVals(n); save(keys[i], v);
  };

  return (
    <div className="decl">
      {keys.map((k, i) => (
        <div key={k} className="decl-row">
          <span className="decl-prefix">I am</span>
          <input value={vals[i]} onChange={e => setAt(i, e.target.value)} placeholder="…" />
        </div>
      ))}
    </div>
  );
}
