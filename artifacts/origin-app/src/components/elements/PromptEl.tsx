import { useState, useCallback, useRef } from 'react';
import { UserStore } from '../../store/userStore';
import VoiceInput from '../VoiceInput';

interface Props {
  id: string;
  text: string;
  rows?: number;
  big?: boolean;
  onAnswer?: (id: string) => void;
}

const DEBOUNCE = 500;

export default function PromptEl({ id, text, rows = 6, big, onAnswer }: Props) {
  const [value, setValue] = useState(() => UserStore.getResponse(id));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAnswered = useRef(!!value);

  const persist = useCallback((v: string) => {
    UserStore.saveResponse(id, v);
    if (v.trim() && !hasAnswered.current) {
      hasAnswered.current = true;
      onAnswer?.(id);
    }
  }, [id, onAnswer]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(v), DEBOUNCE);
  }, [persist]);

  const onVoice = useCallback((transcript: string) => {
    setValue(prev => {
      const next = prev ? prev + ' ' + transcript : transcript;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => persist(next), DEBOUNCE);
      return next;
    });
  }, [persist]);

  return (
    <div className={'prompt-el' + (big ? ' prompt-el--big' : '')}>
      <p className="prompt-text">{text}</p>
      <div className="prompt-field-wrap">
        <textarea
          className="prompt-field"
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder="Write here…"
        />
        <VoiceInput onTranscript={onVoice} />
      </div>
    </div>
  );
}
