import { useState, useEffect } from 'react';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';

interface Props {
  onDismiss: (nextIdx: number) => void;
  nextIdx: number;
}

const PANELS = [
  {
    eyebrow: 'your reading companion',
    name: 'Morpho',
    desc: 'reads your writing as you go. after each chapter, open the journal for a reflection — the thread running through your words.',
    glyph: 'teal' as const,
  },
  {
    eyebrow: 'your mythic compass',
    name: 'The Sage',
    desc: 'names the ancient pattern your story is following — myth, science, and specific passages placed in your Codex.',
    glyph: 'gold' as const,
  },
  {
    eyebrow: 'your instruments',
    name: 'stream · body',
    desc: 'capture thoughts raw and unfiltered. mark where the work lands in you. both available at any moment from the bar below.',
    glyph: 'ink' as const,
  },
];

export default function InstrumentIntro({ onDismiss, nextIdx }: Props) {
  const [panel, setPanel] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 24);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem('origin.intro.seen', '1');
    setExiting(true);
    setTimeout(() => onDismiss(nextIdx), 360);
  };

  const advance = () => {
    if (panel < PANELS.length - 1) setPanel(p => p + 1);
    else dismiss();
  };

  const p = PANELS[panel];

  return (
    <div
      className={
        'intro-overlay' +
        (visible ? ' intro-overlay--visible' : '') +
        (exiting ? ' intro-overlay--exiting' : '')
      }
      role="dialog"
      aria-modal="true"
      aria-label="Journey introduction"
      onClick={advance}
    >
      <button
        className="intro-skip"
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        aria-label="Skip introduction"
      >
        skip
      </button>

      <div key={panel} className="intro-panel">
        <div className={`intro-glyph intro-glyph--${p.glyph}`} aria-hidden="true">
          {panel === 0 && <ButterflyIcon size={64} glowing />}
          {panel === 1 && <CompassIcon size={64} glowing />}
          {panel === 2 && (
            <div className="intro-instr-pair">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <path d="M5 10 Q9 7 16 10 T27 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M5 16 Q9 13 16 16 T27 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".75" />
                <path d="M5 22 Q9 19 16 22 T27 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".5" />
              </svg>
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 19 Q10 15 16 14.5 Q22 15 24 19" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 19 L10 27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M22 19 L22 27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>

        <div className="intro-eyebrow">{p.eyebrow}</div>
        <h2 className="intro-title">{p.name}</h2>
        <p className="intro-body">{p.desc}</p>

        <div className="intro-footer">
          <div className="intro-dots" aria-hidden="true">
            {PANELS.map((_, i) => (
              <div key={i} className={`intro-dot${panel === i ? ' intro-dot--active' : ''}`} />
            ))}
          </div>
          <div className="intro-tap-hint">
            {panel < PANELS.length - 1 ? 'tap to continue' : 'tap to begin'}
          </div>
        </div>
      </div>
    </div>
  );
}
