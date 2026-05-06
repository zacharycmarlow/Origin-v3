import { useEffect, useRef, useState } from 'react';
import type { Chapter } from '../chapters';
import { getReading, saveHorizon, extractChapterBeats } from '../storage';
import { fetchHorizon } from '../api/readings';

interface Props {
  chapter: Chapter;
  chapterIdx: number;
  cycles?: number;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = 'breath-in' | 'breath-out' | 'whisper' | 'done';

const IN_MS = 5000;
const OUT_MS = 5000;

export default function HorizonOverlay({
  chapter,
  chapterIdx,
  cycles = 6,
  onComplete,
  onCancel,
}: Props) {
  const [phase, setPhase] = useState<Phase>('breath-in');
  const [cycle, setCycle] = useState(0);
  const [whisper, setWhisper] = useState<string>('');
  const [revealed, setRevealed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const palette = chapter.palette;

  // Kick off the API call as soon as the overlay mounts (parallel with breath).
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const existing = getReading(chapterIdx).horizon;
    if (existing) {
      setWhisper(existing.whisper);
      return;
    }
    const r = getReading(chapterIdx);
    fetchHorizon({
      chapterNumber: chapterIdx + 1,
      chapterTitle: chapter.title,
      morphoThroughLine: r.morpho?.throughLine || extractChapterBeats(chapter)[0]?.text.slice(0, 240) || '',
      morphoSubtext: r.morpho?.subtext || '',
      sageResonance: r.sage?.resonance || '',
    })
      .then(h => {
        setWhisper(h.whisper);
        saveHorizon(chapterIdx, h);
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)));
  }, [chapter, chapterIdx]);

  // Drive the breath cycle.
  useEffect(() => {
    if (phase === 'breath-in') {
      const t = setTimeout(() => setPhase('breath-out'), IN_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'breath-out') {
      const t = setTimeout(() => {
        if (cycle + 1 >= cycles) {
          setPhase('whisper');
        } else {
          setCycle(c => c + 1);
          setPhase('breath-in');
        }
      }, OUT_MS);
      return () => clearTimeout(t);
    }
    return;
  }, [phase, cycle, cycles]);

  // Word-by-word reveal once whisper is ready and breath is done.
  useEffect(() => {
    if (phase !== 'whisper') return;
    if (!whisper) return;
    const words = whisper.split(/\s+/);
    if (revealed >= words.length) { setPhase('done'); return; }
    const t = setTimeout(() => setRevealed(r => r + 1), 110);
    return () => clearTimeout(t);
  }, [phase, whisper, revealed]);

  // Long-press skip.
  const [pressing, setPressing] = useState(false);
  const pressStartRef = useRef<number | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const startPress = () => {
    setPressing(true);
    pressStartRef.current = Date.now();
    pressTimerRef.current = window.setTimeout(() => {
      onComplete();
    }, 2000);
  };
  const endPress = () => {
    setPressing(false);
    if (pressTimerRef.current) { clearTimeout(pressTimerRef.current); pressTimerRef.current = null; }
    pressStartRef.current = null;
  };
  useEffect(() => () => { if (pressTimerRef.current) clearTimeout(pressTimerRef.current); }, []);

  const orbScale = phase === 'breath-in' ? 1.05 : phase === 'breath-out' ? 0.5 : 0.85;
  const orbDur = phase === 'breath-in' ? IN_MS / 1000 : phase === 'breath-out' ? OUT_MS / 1000 : 1.2;

  const wordsArr = whisper ? whisper.split(/\s+/) : [];

  const showContinue = phase === 'whisper' || phase === 'done';

  return (
    <div
      className="horizon-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Horizon — coherence breath"
      style={{
        background: `radial-gradient(circle at 50% 40%, ${palette.veil} 0%, ${palette.bg} 70%)`,
        color: palette.ink,
      }}
    >
      <button className="horizon-close" onClick={onCancel} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      <div className="horizon-eyebrow">Horizon · between {chapter.roman} and what comes next</div>

      <div className="horizon-orb-wrap">
        <div
          className="horizon-orb"
          style={{
            transform: `scale(${orbScale})`,
            transition: `transform ${orbDur}s cubic-bezier(.4,0,.4,1)`,
            background: `radial-gradient(circle, ${palette.glow} 0%, ${palette.accent} 40%, transparent 75%)`,
          }}
        />
        <div className="horizon-orb-ring" style={{ borderColor: palette.glow + '88' }} />
        <div className="horizon-phase">
          {phase === 'breath-in' && 'inhale · five'}
          {phase === 'breath-out' && 'exhale · five'}
          {(phase === 'whisper' || phase === 'done') && '∎'}
        </div>
      </div>

      {(phase === 'breath-in' || phase === 'breath-out') && (
        <div className="horizon-cycle">
          {cycle + 1} / {cycles} · coherence
        </div>
      )}

      {(phase === 'whisper' || phase === 'done') && (
        <div className="horizon-whisper">
          {error && <div className="horizon-error">{error}</div>}
          {!whisper && !error && <div className="horizon-pending">listening for the integration…</div>}
          {whisper && (
            <p>
              {wordsArr.slice(0, revealed).join(' ')}
              {revealed < wordsArr.length && <span className="horizon-cursor"> ▍</span>}
            </p>
          )}
        </div>
      )}

      {showContinue && (
        <div className="horizon-continue-wrap">
          <button
            className={'horizon-continue' + (pressing ? ' pressing' : '')}
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            onTouchCancel={endPress}
            style={{ borderColor: palette.glow }}
          >
            <span className="horizon-continue-fill" style={{ background: palette.glow + '55' }} />
            <span className="horizon-continue-label">hold to cross</span>
          </button>
        </div>
      )}
    </div>
  );
}
