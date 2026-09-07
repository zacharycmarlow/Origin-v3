import { useState, useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   useLocalSpeechRecognition — in-browser speech-to-text via Whisper.

   Uses Transformers.js (Apache 2.0) to run OpenAI's Whisper model
   entirely in the browser via WebAssembly. No audio leaves the
   device — works in Brave, Firefox, and any browser that supports
   WebAssembly + MediaRecorder.

   The Web Speech API (used by useSpeechRecognition) requires sending
   audio to Google's remote servers, which Brave blocks by default.
   This hook is the privacy-preserving fallback that works everywhere.

   How it works:
   1. MediaRecorder captures audio from the microphone in chunks
   2. When the user stops, the audio blob is converted to a Float32Array
   3. Transformers.js runs Whisper (tiny.en, ~40MB) to transcribe
   4. The transcribed text is inserted into the editor

   The model loads lazily on first use and caches in the browser.
   ═══════════════════════════════════════════════════════════════ */

// Lazy-load Transformers.js only when needed.
// The multilingual model supports 90+ languages with auto-detection.
let pipelinePromise: Promise<any> | null = null;
async function getTranscriber() {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      // Xenova/whisper-tiny is the multilingual model (~40MB quantized).
      // It auto-detects the spoken language and transcribes in that language.
      // For better accuracy, swap to Xenova/whisper-base (~80MB) or
      // Xenova/whisper-small (~240MB).
      //
      // graphOptimizationLevel: 'basic' works around an ONNX Runtime v4.2
      // bug where the 'extended' optimizer fuses DequantizeLinear+MatMul
      // into MatMulNBits, which crashes on Whisper's tied embedding weights.
      // See: https://github.com/microsoft/onnxruntime/issues/28306
      const transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        {
          dtype: 'q8',
          session_options: {
            graphOptimizationLevel: 'basic',
          },
        },
      );
      return transcriber;
    })();
  }
  return pipelinePromise;
}

export interface UseLocalSpeechRecognitionOptions {
  /** Called when the model is loading (first use only). */
  onModelLoading?: () => void;
  /** Called when the model has loaded. */
  onModelReady?: () => void;
  /**
   * Language hint for transcription. If omitted, Whisper auto-detects.
   * Accepts ISO-639-1 codes: 'en', 'es', 'fr', 'de', 'ja', 'zh', 'ar',
   * 'hi', 'pt', 'ru', 'ko', 'it', 'nl', 'tr', 'pl', 'sv', 'he', etc.
   */
  language?: string;
  /**
   * Task: 'transcribe' (default) transcribes in the source language.
   * 'translate' translates speech to English text.
   */
  task?: 'transcribe' | 'translate';
}

export interface UseLocalSpeechRecognitionResult {
  listening: boolean;
  error: string | null;
  modelLoading: boolean;
  transcribing: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useLocalSpeechRecognition(
  onResult: (text: string) => void,
  options: UseLocalSpeechRecognitionOptions = {},
): UseLocalSpeechRecognitionResult {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const wantListeningRef = useRef(false);
  // cancelledRef distinguishes "user stopped to transcribe" (false)
  // from "user cancelled / component unmounted" (true). The onstop
  // handler uses this to decide whether to run transcription.
  const cancelledRef = useRef(false);
  const onResultRef = useRef(onResult);
  const optionsRef = useRef(options);

  // Keep refs current
  useEffect(() => {
    onResultRef.current = onResult;
    optionsRef.current = options;
  });

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* noop */ }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    // User intentionally stopped — we WANT to transcribe the audio.
    // Do NOT set cancelledRef; the onstop handler will run transcription.
    wantListeningRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch { /* noop */ }
    }
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    wantListeningRef.current = true;
    cancelledRef.current = false;

    try {
      // 1. Load the Whisper model (lazy, cached after first load)
      if (!pipelinePromise) {
        setModelLoading(true);
        optionsRef.current.onModelLoading?.();
      }
      await getTranscriber();
      setModelLoading(false);
      optionsRef.current.onModelReady?.();

      if (!wantListeningRef.current) return; // user stopped while loading

      // 2. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Set up MediaRecorder to collect audio chunks
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // 4. Stop all audio tracks to release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        // If the component was unmounted or recording was cancelled
        // (not a normal stop), skip transcription.
        if (cancelledRef.current) return;

        // 5. Combine chunks into a single blob and transcribe
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) {
          // Too small — probably no speech
          return;
        }

        setTranscribing(true);
        try {
          // Convert blob to AudioContext for Whisper input
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Get mono channel data at 16kHz (Whisper requirement)
          let audioData: Float32Array;
          if (audioBuffer.numberOfChannels > 1) {
            // Mix down to mono
            const channel0 = audioBuffer.getChannelData(0);
            const channel1 = audioBuffer.getChannelData(1);
            audioData = new Float32Array(channel0.length);
            for (let i = 0; i < channel0.length; i++) {
              audioData[i] = (channel0[i] + channel1[i]) / 2;
            }
          } else {
            audioData = audioBuffer.getChannelData(0);
          }

          // 6. Run Whisper transcription
          //    The multilingual model auto-detects the spoken language.
          //    If a language hint is provided, it uses that for accuracy.
          //    task: 'transcribe' keeps the original language;
          //    task: 'translate' translates to English.
          //
          //    chunk_length_s: 30 — process long audio in 30-second windows
          //    stride_length_s: 5 — 5-second overlap between chunks so words
          //      at chunk boundaries aren't cut off
          //    max_new_tokens: 448 — maximum tokens per chunk (Whisper's max),
          //      ensures no truncation within any chunk
          //    The pipeline automatically concatenates all chunks into the
          //    full transcript — no character limit on total output.
          const transcriber = await getTranscriber();
          const opts: Record<string, unknown> = {
            chunk_length_s: 30,
            stride_length_s: 5,
            max_new_tokens: 448,
            task: optionsRef.current.task || 'transcribe',
          };
          if (optionsRef.current.language) {
            opts.language = optionsRef.current.language;
          }
          const output = await transcriber(audioData, opts);

          const text = output?.text?.trim() || '';
          if (text) {
            onResultRef.current(text);
          }
        } catch (err) {
          console.error('Transcription error:', err);
          setError('Could not transcribe audio. Please try again.');
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setListening(true);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('Microphone access denied. Allow microphone permission to use voice input.');
      } else if (err?.name === 'NotFoundError') {
        setError('No microphone found. Connect a microphone and try again.');
      } else {
        setError('Could not start recording. ' + (err?.message || ''));
      }
      setModelLoading(false);
      setListening(false);
      wantListeningRef.current = false;
      cleanup();
    }
  }, [cleanup]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
    } else {
      start();
    }
  }, [listening, start, stop]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return { listening, error, modelLoading, transcribing, start, stop, toggle };
}
