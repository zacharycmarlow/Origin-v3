import { useState, useRef, useCallback } from 'react';

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: Props) {
  const [active, setActive] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recogRef = useRef<SpeechRecognition | null>(null);

  const start = useCallback(() => {
    const SpeechRec = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) { setUnsupported(true); return; }

    const rec = new SpeechRec();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    let interim = '';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) onTranscript(t);
        else interim += t;
      }
      if (interim) onTranscript(interim);
    };
    rec.onerror = () => { setActive(false); };
    rec.onend = () => { setActive(false); };

    rec.start();
    recogRef.current = rec;
    setActive(true);
  }, [onTranscript]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setActive(false);
  }, []);

  if (unsupported) {
    return <span className="voice-unsupported">Voice input requires Chrome or Edge.</span>;
  }

  return (
    <button
      type="button"
      className={'voice-btn' + (active ? ' voice-btn--active' : '')}
      onClick={active ? stop : start}
      title={active ? 'Stop recording' : 'Speak your answer'}
      aria-label={active ? 'Stop voice input' : 'Start voice input'}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="17" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
      </svg>
      {active && <span className="voice-pulse" />}
    </button>
  );
}
