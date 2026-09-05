import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { load, save } from '../storage';

/* ═══════════════════════════════════════════════════════════════
   THE WRITING PAGE — the full-screen writing surface.

   A cramped textarea is a promise about the expected answer: it
   says "one sentence." This is the opposite — when the writer
   commits to answering, the whole screen becomes the page. The
   question shrinks to a quiet line at the top, the chrome recedes
   while typing, and the tools (voice, a photo of a handwritten
   page, Morpho) sit at the bottom edge within reach but out of
   the way.

   Rendered through document.body via createPortal — the beats use
   transforms for the melt, and a transformed ancestor traps
   position:fixed.
   ═══════════════════════════════════════════════════════════════ */

interface Props {
  open: boolean;
  onClose: () => void;
  sceneKey: string;
  question?: string;
  detail?: string;
  placeholder?: string;
  eyebrow?: string;
  onMorpho?: () => void;
}

const speechAvailable =
  typeof window !== 'undefined' &&
  !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export default function WritingPage({
  open, onClose, sceneKey, question, detail, placeholder, eyebrow, onMorpho,
}: Props) {
  const [val, setVal] = useState<string>(() => {
    const stored = load()[sceneKey];
    return typeof stored === 'string' ? stored : '';
  });
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const areaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalBaseRef = useRef<string>('');
  const wantListeningRef = useRef(false);
  const typingTimer = useRef<number | undefined>(undefined);

  /* autosave */
  useEffect(() => {
    const t = setTimeout(() => save(sceneKey, val), 300);
    return () => clearTimeout(t);
  }, [val, sceneKey]);

  /* re-read stored value whenever the page opens (another surface may
     have written to the same key since mount) */
  useEffect(() => {
    if (!open) return;
    const stored = load()[sceneKey];
    const next = typeof stored === 'string' ? stored : '';
    setVal(next);
    finalBaseRef.current = next;
    const t = setTimeout(() => areaRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open, sceneKey]);

  /* lock the page behind it; Esc closes */
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const stopListening = useCallback(() => {
    wantListeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    setListening(false);
  }, []);

  /* stop dictation when the page closes */
  useEffect(() => { if (!open) stopListening(); }, [open, stopListening]);

  /* Voice. The known failure mode is the browser silently ending the
     session after a pause (or ~60s), which drops dictation mid-thought.
     onend restarts it whenever the writer hasn't actually asked to stop. */
  const startRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += text;
        else interimChunk += text;
      }
      if (finalChunk) {
        const sep = finalBaseRef.current && !/\s$/.test(finalBaseRef.current) ? ' ' : '';
        finalBaseRef.current = finalBaseRef.current + sep + finalChunk.trim();
      }
      setVal(finalBaseRef.current + (interimChunk ? ' ' + interimChunk : ''));
    };

    recognition.onend = () => {
      if (wantListeningRef.current) {
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
  }, []);

  const toggleMic = () => {
    if (listening) { stopListening(); return; }
    finalBaseRef.current = val;
    wantListeningRef.current = true;
    setListening(true);
    startRecognition();
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const markTyping = () => {
    setTyping(true);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTyping(false), 1600);
  };

  if (!open) return null;

  const words = val.trim().split(/\s+/).filter(Boolean).length;

  return createPortal(
    <div className="writing-page" data-typing={typing ? 'true' : 'false'} role="dialog" aria-modal="true">
      <div className="writing-page-surface">
        <header className="wp-head">
          {eyebrow && <div className="wp-eyebrow">{eyebrow}</div>}
          {question && <h2 className="wp-question">{question}</h2>}
          {detail && <p className="wp-detail">{detail}</p>}
        </header>

        <textarea
          ref={areaRef}
          className="wp-area"
          value={val}
          onChange={e => {
            finalBaseRef.current = e.target.value;
            setVal(e.target.value);
            markTyping();
          }}
          placeholder={placeholder || 'write here…'}
          spellCheck
        />

        {photo && (
          <div className="wp-photo">
            <img src={photo} alt="the page you photographed" />
            <button className="wp-photo-drop" onClick={() => setPhoto(null)} aria-label="remove photo">×</button>
          </div>
        )}
      </div>

      <div className="wp-bar">
        <div className="wp-tools">
          {speechAvailable && (
            <button
              className={'wp-tool' + (listening ? ' wp-tool--live' : '')}
              onClick={toggleMic}
              aria-label={listening ? 'stop dictation' : 'speak'}
              title={listening ? 'stop dictation' : 'speak'}
            >
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="7" y="1" width="6" height="11" rx="3" fill="currentColor" />
                <path d="M4 10a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <label className="wp-tool" title="photograph a page" aria-label="photograph a page">
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="1.5" y="4.5" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="10" cy="10.5" r="3.4" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6.5 4.5 7.8 2.4h4.4l1.3 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} hidden />
          </label>

          {onMorpho && (
            <button className="wp-tool" onClick={onMorpho} title="turn this into story" aria-label="turn this into story">
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4v12M10 6C8 2.5 3 3 3 7c0 3 4 3.6 7 3.6M10 6c2-3.5 7-3 7 1 0 3-4 3.6-7 3.6"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          )}
        </div>

        <div className="wp-status">
          {listening ? <span className="wp-live">listening</span> : val ? <span>{`saved · ${words} words`}</span> : null}
        </div>

        <button className="wp-done" onClick={onClose}>done</button>
      </div>
    </div>,
    document.body,
  );
}
