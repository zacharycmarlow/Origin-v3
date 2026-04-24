import { useState, useCallback, useRef } from 'react';
import { UserStore } from '../../store/userStore';
import VoiceInput from '../VoiceInput';

interface Props {
  text: string;
  promptId?: string;
  promptPlaceholder?: string;
  promptRows?: number;
  promptBig?: boolean;
}

const DEBOUNCE = 500;

export default function ThresholdEl({ text, promptId, promptPlaceholder, promptRows = 10, promptBig }: Props) {
  const [value, setValue] = useState(() => promptId ? UserStore.getResponse(promptId) : '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((v: string) => {
    if (promptId) UserStore.saveResponse(promptId, v);
  }, [promptId]);

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
    <div className={'threshold-el' + (promptBig ? ' threshold-el--big' : '')}>
      <div className="threshold-border" />
      <p className="threshold-text">{text}</p>
      {promptId && (
        <div className="prompt-field-wrap">
          <textarea
            className="prompt-field prompt-field--threshold"
            rows={promptRows}
            value={value}
            onChange={onChange}
            placeholder={promptPlaceholder || 'Write here…'}
          />
          <VoiceInput onTranscript={onVoice} />
        </div>
      )}
    </div>
  );
}
