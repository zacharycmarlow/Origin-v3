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
   ═══════════════════════════════════════════════════════════════ */

export const speechAvailable =
  typeof window !== 'undefined' &&
  !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export interface UseSpeechRecognitionOptions {
  /** Restart recognition automatically when the browser ends it. */
  autoRestart?: boolean;
}

export interface UseSpeechRecognitionResult {
  listening: boolean;
  start: (currentText: string) => void;
  stop: () => void;
  toggle: (currentText: string) => void;
  /** Ref to the base text that final chunks are appended to. */
  baseRef: React.RefObject<string>;
}

export function useSpeechRecognition(
  onResult: (text: string) => void,
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const { autoRestart = true } = options;
  const [listening, setListening] = useState(false);
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
    if (!SR) return;

    baseRef.current = currentText;
    wantListeningRef.current = true;
    setListening(true);

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
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
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        wantListeningRef.current = false;
        setListening(false);
      }
    };

    try { recognition.start(); } catch { /* already running */ }
  }, [onResult, autoRestart]);

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

  return { listening, start, stop, toggle, baseRef };
}
