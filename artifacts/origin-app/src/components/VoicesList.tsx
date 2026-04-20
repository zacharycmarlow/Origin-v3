import { useState } from 'react';
import { load, save } from '../storage';

interface Props {
  sceneKey: string;
}

export default function VoicesList({ sceneKey }: Props) {
  const [items, setItems] = useState<string[]>(() => {
    const stored = load()[sceneKey];
    return Array.isArray(stored) ? stored : [];
  });
  const [text, setText] = useState('');

  const add = () => {
    if (!text.trim()) return;
    const next = [...items, text.trim()];
    setItems(next); save(sceneKey, next); setText('');
  };

  const remove = (i: number) => {
    const next = items.filter((_, j) => j !== i);
    setItems(next); save(sceneKey, next);
  };

  return (
    <div className="voices">
      <div className="voices-list">
        {items.map((v, i) => (
          <div key={i} className="voice-chip">
            <span className="voice-quote">"{v}"</span>
            <button className="voice-x" onClick={() => remove(i)} aria-label="remove">×</button>
          </div>
        ))}
      </div>
      <div className="voices-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder='"you are not enough"'
        />
        <button className="btn-ghost small" onClick={add}><span className="label">+ add voice</span></button>
      </div>
    </div>
  );
}
