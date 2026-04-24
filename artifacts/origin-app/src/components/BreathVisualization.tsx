import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  id: string;
  pattern: string;
  duration: number;
  label: string;
  onComplete: () => void;
}

function parsePattern(pattern: string): { inhale: number; exhale: number } {
  const parts = pattern.split('-');
  const inhale = parseInt(parts[0]) || 4;
  const exhale = parseInt(parts[parts.length - 1]) || 7;
  return { inhale, exhale };
}

type Phase = 'idle' | 'inhale' | 'exhale' | 'done';

export default function BreathVisualization({ id, pattern, duration, label, onComplete }: Props) {
  const { inhale, exhale } = parsePattern(pattern);
  const total = inhale + exhale;

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('done');
    onComplete();
  }, [onComplete]);

  const start = useCallback(() => {
    setPhase('inhale');
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(secs);
      const cyclePos = secs % total;
      setPhase(cyclePos < inhale ? 'inhale' : 'exhale');
      if (secs >= duration) {
        stop();
      }
    }, 200);
  }, [duration, exhale, inhale, stop, total]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const dismiss = () => {
    setDismissed(true);
    if (timerRef.current) clearInterval(timerRef.current);
    onComplete();
  };

  if (dismissed) return null;

  const progress = Math.min(elapsed / duration, 1);
  const circleScale = phase === 'inhale' ? 1 : phase === 'exhale' ? 0.62 : phase === 'idle' ? 0.75 : 0.75;
  const phaseLabel = phase === 'idle' ? '' : phase === 'inhale' ? 'Breathe in…' : phase === 'exhale' ? 'Breathe out…' : 'Well done.';

  return (
    <div className={'breath-viz' + (phase === 'done' ? ' breath-viz--done' : '')}>
      <div className="breath-label-top">{label}</div>
      {phase === 'idle' && (
        <button className="breath-start-btn" onClick={start}>Begin</button>
      )}
      {phase !== 'idle' && phase !== 'done' && (
        <>
          <div className="breath-circle-wrap">
            <div
              className="breath-circle"
              style={{
                transform: `scale(${circleScale})`,
                transition: phase === 'inhale'
                  ? `transform ${inhale}s ease-in-out`
                  : `transform ${exhale}s ease-in-out`,
              }}
            />
            <div className="breath-ring" />
          </div>
          <div className="breath-phase">{phaseLabel}</div>
          <div className="breath-progress">
            <div className="breath-progress-fill" style={{ width: (progress * 100) + '%' }} />
          </div>
        </>
      )}
      {phase === 'done' && (
        <div className="breath-done">good.</div>
      )}
      {phase !== 'idle' && phase !== 'done' && (
        <button className="breath-dismiss" onClick={dismiss}>I'll do this on my own</button>
      )}
      {phase === 'idle' && (
        <button className="breath-dismiss" onClick={dismiss}>Skip</button>
      )}
    </div>
  );
}
