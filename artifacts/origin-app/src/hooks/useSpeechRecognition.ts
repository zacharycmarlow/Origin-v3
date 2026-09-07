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
   etc.) instead of silently failing. Network errors use exponential
   backoff retry (1s → 2s → 4s) before giving up after 5 attempts.
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
  'network': 'Speech service connection failed. Retrying…',
  'audio-capture': 'No microphone found. Connect a microphone and try again.',
  'aborted': 'Speech recognition was interrupted.',
  'bad-grammar': 'Speech recognition grammar error.',
  'language-not-supported': 'This language is not supported for speech recognition.',
};

const MAX_NETWORK_RETRIES = 5;
const BASE_RETRY_DELAY = 1000; // 1s, doubles each retry

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
  const networkRetryCountRef = useRef(0);
  const retryTimerRef = useRef<number | undefined>(undefined);
  const lastErrorTypeRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = undefined;
    }
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    setListening(false);
  }, []);

  const start = useCallback((currentText: string) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Clear any previous error and reset retry count on fresh start
    setError(null);
    networkRetryCountRef.current = 0;
    lastErrorTypeRef.current = null;
    baseRef.current = currentText;
    wantListeningRef.current = true;
    setListening(true);

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Set language — default to browser language if not specified.
    // This helps the speech service route to the right recognition model.
    recognition.lang = lang || navigator.language || 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      // Clear any error on successful result — we're receiving speech
      if (error) setError(null);
      networkRetryCountRef.current = 0; // reset retry count on success

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
      // Don't restart if we're stopping, or if the last error was a
      // network error (the onerror handler manages retries for that)
      if (!wantListeningRef.current) {
        setListening(false);
        return;
      }

      if (lastErrorTypeRef.current === 'network') {
        // onerror handles the retry — don't restart here
        return;
      }

      if (autoRestart) {
        // Session ended on its own (browser ~60s timeout) — stitch a
        // new one on so long dictation doesn't silently die mid-sentence
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recognition.onerror = (e: any) => {
      const errType = e?.error || 'unknown';
      lastErrorTypeRef.current = errType;
      const msg = ERROR_MESSAGES[errType] || `Speech recognition error: ${errType}`;

      if (errType === 'not-allowed' || errType === 'service-not-allowed' || errType === 'audio-capture') {
        // Fatal errors — stop and show the error
        wantListeningRef.current = false;
        setListening(false);
        setError(msg);
      } else if (errType === 'no-speech') {
        // Transient — don't show an error, let autoRestart handle it
        if (!autoRestart) {
          wantListeningRef.current = false;
          setListening(false);
        }
      } else if (errType === 'network' || errType === 'aborted') {
        // Network errors: retry with exponential backoff
        networkRetryCountRef.current++;
        if (networkRetryCountRef.current > MAX_NETWORK_RETRIES) {
          wantListeningRef.current = false;
          setListening(false);
          setError('Speech service unavailable after multiple attempts. Check your connection and try again.');
          return;
        }

        setError(msg);
        const delay = BASE_RETRY_DELAY * Math.pow(2, networkRetryCountRef.current - 1);

        // Schedule a retry — create a new recognition instance
        if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = window.setTimeout(() => {
          if (!wantListeningRef.current) return;
          try {
            // Create fresh instance — the old one is in an error state
            const freshRecognition = new SR();
            freshRecognition.continuous = true;
            freshRecognition.interimResults = true;
            freshRecognition.lang = lang || navigator.language || 'en-US';
            recognitionRef.current = freshRecognition;

            // Re-attach the same handlers
            freshRecognition.onresult = recognition.onresult;
            freshRecognition.onend = recognition.onend;
            freshRecognition.onerror = recognition.onerror;

            lastErrorTypeRef.current = null;
            freshRecognition.start();
            // Clear the retrying message once we successfully start
            setError(null);
          } catch {
            setListening(false);
            setError('Could not restart speech recognition. Try again.');
          }
        }, delay);
      } else {
        setError(msg);
      }
    };

    try { recognition.start(); } catch { /* already running */ }
  }, [onResult, autoRestart, lang, error]);

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
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = undefined;
      }
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  return { listening, error, start, stop, toggle, baseRef };
}
