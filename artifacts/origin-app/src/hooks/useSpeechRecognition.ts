import { useState, useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   useSpeechRecognition — shared hook for the Web Speech API.

   Extracted from 4 components (WritingPage, Journal, StreamOverlay,
   InlineStreamSection) that each duplicated the same logic. The
   critical bug this fixes: most of those components never called
   recognition.stop() on unmount, leaving the microphone active and
   leaking memory.

   Two modes:
   • autoRestart (default true): restarts recognition on its own
     when the browser silently ends the session (~60s timeout).
     WritingPage uses this for long dictation.
   • autoRestart=false: recognition stops when the browser ends it.
     StreamOverlay/InlineStreamSection/Journal use this.

   Error handling: exposes `error` state so callers can show the user
   what went wrong (mic denied, no speech detected, network error,
   etc.) instead of silently failing.
   ═══════════════════════════════════════════════════════════════ */

export const speechAvailable =
  typeof window !== 'undefined' &&
  !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export interface UseSpeechRecognitionOptions {
  /** Restart recognition automatically when the browser ends it. */
  autoRestart?: boolean;
  /** Language for recognition (default: browser language). */
  lang?: string;
}

export interface UseSpeechRecognitionResult {
  listening: boolean;
  error: string | null;
  start: (currentText: string) => void;
  stop: () => void;
  toggle: (currentText: string) => void;
  /** Ref to the base text that final chunks are appended to. */
  baseRef: React.RefObject<string>;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access denied. Allow microphone permission to use voice input.',
  'service-not-allowed': 'Speech service not available in this browser.',
  'no-speech': 'No speech detected. Try speaking closer to the microphone.',
  'network': 'Speech recognition network error. Check your connection.',
  'audio-capture': 'No microphone found. Connect a microphone and try again.',
  'aborted': 'Speech recognition was interrupted.',
  'bad-grammar': 'Speech recognition grammar error.',
  'language-not-supported': 'This language is not supported for speech recognition.',
};

export function useSpeechRecognition(
  onResult: (text: string) => void,
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const { autoRestart = true, lang } = options;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseRef = useRef<string>('');
  const wantListeningRef = useRef(false);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    setListening(false);
  }, []);

  const start = useCallback((currentText: string) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Clear any previous error
    setError(null);
    baseRef.current = currentText;
    wantListeningRef.current = true;
    setListening(true);

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    if (lang) recognition.lang = lang;
    recognitionRef.current = recognition;

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
        const sep = baseRef.current && !/\s$/.test(baseRef.current) ? ' ' : '';
        baseRef.current = baseRef.current + sep + finalChunk.trim();
      }
      onResult(baseRef.current + (interimChunk ? ' ' + interimChunk : ''));
    };

    recognition.onend = () => {
      if (wantListeningRef.current && autoRestart) {
        // session ended on its own — stitch a new one on so long
        // dictation doesn't silently die mid-sentence
        try { recognition.start(); } catch { setListening(false); }
      } else {
        setListening(false);
      }
    };

    recognition.onerror = (e: any) => {
      const errType = e?.error || 'unknown';
      const msg = ERROR_MESSAGES[errType] || `Speech recognition error: ${errType}`;

      if (errType === 'not-allowed' || errType === 'service-not-allowed' || errType === 'audio-capture') {
        wantListeningRef.current = false;
        setListening(false);
        setError(msg);
      } else if (errType === 'no-speech') {
        // no-speech is transient — don't show an error, just let autoRestart handle it
        // unless autoRestart is off, in which case we stop
        if (!autoRestart) {
          wantListeningRef.current = false;
          setListening(false);
        }
      } else {
        // For network, aborted, etc. — show the error but keep trying if autoRestart
        setError(msg);
      }
    };

    try { recognition.start(); } catch { /* already running */ }
  }, [onResult, autoRestart, lang]);

  const toggle = useCallback((currentText: string) => {
    if (listening) {
      stop();
    } else {
      start(currentText);
    }
  }, [listening, start, stop]);

  /* Critical: stop recognition on unmount to release the microphone. */
  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  return { listening, error, start, stop, toggle, baseRef };
}
