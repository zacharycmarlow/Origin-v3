import { useState, useEffect } from 'react';

type Phase = 'idle' | 'in' | 'out' | 'done';

interface Props {
  label?: string;
  cycles?: number;
  onDone?: () => void;
}

export default function BreathPacer({ label, cycles = 3, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (phase === 'idle') { setPhase('in'); return; }
    const dur = phase === 'in' ? 4000 : phase === 'out' ? 7000 : 700;
    const t = setTimeout(() => {
      if (phase === 'in') setPhase('out');
      else if (phase === 'out') {
        if (cycle + 1 >= cycles) { setPhase('done'); setRunning(false); onDone?.(); }
        else { setCycle(c => c + 1); setPhase('in'); }
      }
    }, dur);
    return () => clearTimeout(t);
  }, [phase, running, cycle, cycles, onDone]);

  const scale = phase === 'in' ? 1 : phase === 'out' ? 0.45 : phase === 'done' ? 0.7 : 0.55;
  const dur = phase === 'in' ? 4 : phase === 'out' ? 7 : 0.7;

  return (
    <div className="breath">
      <div className="breath-orb-wrap">
        <div
          className="breath-orb"
          style={{ transform: `scale(${scale})`, transition: `transform ${dur}s cubic-bezier(.4,0,.4,1)` }}
        />
        <div className="breath-ring" />
        <div className="breath-phase">
          {phase === 'idle' && '•'}
          {phase === 'in' && 'inhale'}
          {phase === 'out' && 'exhale'}
          {phase === 'done' && '∎'}
        </div>
      </div>
      {label && <div className="breath-label">{label}</div>}
      <div className="breath-controls">
        {!running && phase !== 'done' && (
          <button className="btn-ghost" onClick={() => { setCycle(0); setPhase('idle'); setRunning(true); }}>
            <span className="label">{phase === 'idle' ? 'begin' : 'resume'}</span>
          </button>
        )}
        {running && <div className="breath-cycle">{cycle + 1} / {cycles}</div>}
        {phase === 'done' && <div className="breath-cycle">complete</div>}
      </div>
    </div>
  );
}
