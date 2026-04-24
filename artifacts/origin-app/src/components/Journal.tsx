import { useState, useEffect, useRef } from 'react';
import { load, save } from '../storage';

interface Props {
  sceneKey: string;
  placeholder?: string;
  rows?: number;
  big?: boolean;
}

const speechAvailable =
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);

export default function Journal({ sceneKey, placeholder, rows = 4, big }: Props) {
  const [val, setVal] = useState<string>(() => {
    const stored = load()[sceneKey];
    return typeof stored === 'string' ? stored : '';
  });
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalBaseRef = useRef<string>('');

  useEffect(() => {
    const t = setTimeout(() => save(sceneKey, val), 300);
    return () => clearTimeout(t);
  }, [val, sceneKey]);

  const wordCount = val.trim().split(/\s+/).filter(Boolean).length;

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
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

  return (
    <div className={'journal' + (big ? ' journal-big' : '')}>
      <div className="journal-textarea-wrap">
        <textarea
          value={val}
          onChange={e => {
            finalBaseRef.current = e.target.value;
            setVal(e.target.value);
          }}
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
        <span>{val ? `saved · ${wordCount} words` : 'private to you'}</span>
      </div>
    </div>
  );
}
