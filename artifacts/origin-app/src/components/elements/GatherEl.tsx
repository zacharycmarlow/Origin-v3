import { useState, useCallback, useRef } from 'react';
import { UserStore } from '../../store/userStore';
import VoiceInput from '../VoiceInput';

interface GatherLine { text: string; promptId?: string; fixed?: boolean }
interface Props { lines: GatherLine[] }

const DEBOUNCE = 500;

function GatherLineEl({ line }: { line: GatherLine }) {
  const [value, setValue] = useState(() => line.promptId ? UserStore.getResponse(line.promptId) : '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((v: string) => {
    if (line.promptId) UserStore.saveResponse(line.promptId, v);
  }, [line.promptId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(v), DEBOUNCE);
  };

  const onVoice = (transcript: string) => {
    const next = value ? value + ' ' + transcript : transcript;
    setValue(next);
    persist(next);
  };

  if (line.fixed) {
    return <p className="gather-line gather-line--fixed">{line.text}</p>;
  }

  return (
    <div className="gather-line gather-line--prompt">
      <span className="gather-line-prefix">{line.text}</span>
      <div className="gather-input-wrap">
        <input
          type="text"
          className="gather-input"
          value={value}
          onChange={onChange}
          placeholder="…"
        />
        <VoiceInput onTranscript={onVoice} />
      </div>
    </div>
  );
}

export default function GatherEl({ lines }: Props) {
  return (
    <div className="gather-el">
      {lines.map((line, i) => <GatherLineEl key={i} line={line} />)}
    </div>
  );
}
