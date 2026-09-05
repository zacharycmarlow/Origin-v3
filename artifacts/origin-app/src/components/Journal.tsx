import { useState, useEffect, useRef } from 'react';
import { load, save } from '../storage';
import WritingPage from './WritingPage';

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

const speechAvailable =
  typeof window !== 'undefined' &&
  !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export default function Journal({
  sceneKey, placeholder, rows = 4, big, onSave, question, detail, eyebrow,
}: Props) {
  const [val, setVal] = useState<string>(() => {
    const stored = load()[sceneKey];
    return typeof stored === 'string' ? stored : '';
  });
  const [pageOpen, setPageOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalBaseRef = useRef<string>('');

  useEffect(() => {
    const t = setTimeout(() => {
      save(sceneKey, val);
      if (val.trim()) onSave?.();
    }, 300);
    return () => clearTimeout(t);
  }, [val, sceneKey]); // eslint-disable-line

  const wordCount = val.trim().split(/\s+/).filter(Boolean).length;

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    finalBaseRef.current = val;

    recognition.onresult = (event: any) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += text;
        } else {
          interimChunk += text;
        }
      }
      if (finalChunk) {
        const separator = finalBaseRef.current ? ' ' : '';
        finalBaseRef.current = finalBaseRef.current + separator + finalChunk.trim();
      }
      const display = finalBaseRef.current + (interimChunk ? ' ' + interimChunk : '');
      setVal(display);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.start();
    setListening(true);
  };

  const openPage = () => setPageOpen(true);
  const closePage = () => {
    setPageOpen(false);
    const stored = load()[sceneKey];
    const next = typeof stored === 'string' ? stored : '';
    setVal(next);
    finalBaseRef.current = next;
    if (next.trim()) onSave?.();
  };

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
            onClick={toggleMic}
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
