import { useState, useEffect, useCallback } from 'react';
import { load, save } from '../storage';
import WritingPage from './WritingPage';
import { useSpeechRecognition, speechAvailable } from '../hooks/useSpeechRecognition';

interface Props {
  sceneKey: string;
  placeholder?: string;
  rows?: number;
  big?: boolean;
  onSave?: () => void;
  /* the question + elaboration, carried into the full-screen page */
  question?: string;
  detail?: string;
  eyebrow?: string;
}

export default function Journal({
  sceneKey, placeholder, rows = 4, big, onSave, question, detail, eyebrow,
}: Props) {
  const [val, setVal] = useState<string>(() => {
    const stored = load()[sceneKey];
    return typeof stored === 'string' ? stored : '';
  });
  const [pageOpen, setPageOpen] = useState(false);

  const { listening, toggle, baseRef, stop } = useSpeechRecognition(setVal, { autoRestart: false });

  useEffect(() => {
    const t = setTimeout(() => {
      save(sceneKey, val);
      if (val.trim()) onSave?.();
    }, 300);
    return () => clearTimeout(t);
  }, [val, sceneKey]); // eslint-disable-line

  const wordCount = val.trim().split(/\s+/).filter(Boolean).length;

  const openPage = () => setPageOpen(true);
  const closePage = useCallback(() => {
    setPageOpen(false);
    const stored = load()[sceneKey];
    const next = typeof stored === 'string' ? stored : '';
    setVal(next);
    baseRef.current = next;
    if (next.trim()) onSave?.();
  }, [sceneKey, onSave, baseRef]);

  return (
    <div className={'journal' + (big ? ' journal-big' : '')}>
      <WritingPage
        open={pageOpen}
        onClose={closePage}
        sceneKey={sceneKey}
        question={question}
        detail={detail}
        eyebrow={eyebrow}
        placeholder={placeholder}
      />
      <div className="journal-textarea-wrap">
        {/* Touching the desk opens the full page — the writing happens
            on a whole screen, never inside a cramped box. */}
        <textarea
          value={val}
          onFocus={openPage}
          onClick={openPage}
          readOnly
          placeholder={placeholder || 'write here…'}
          rows={rows}
        />
        {speechAvailable && (
          <button
            className={'mic-btn' + (listening ? ' mic-btn--active' : '')}
            onClick={() => toggle(val)}
            title={listening ? 'stop recording' : 'speak your response'}
            aria-label={listening ? 'stop recording' : 'start voice input'}
          >
            {listening ? null : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="7" y="1" width="6" height="11" rx="3" fill="currentColor" />
                <path d="M4 10a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="7" y1="19" x2="13" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="journal-meta">
        {val ? <span>{`saved · ${wordCount} words`}</span> : null}
      </div>
    </div>
  );
}
