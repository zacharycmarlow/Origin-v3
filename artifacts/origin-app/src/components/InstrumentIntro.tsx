import { useState, useEffect } from 'react';
import { ButterflyIcon } from './MorphoCompassIcons';

interface Props {
  onDismiss: (nextIdx: number) => void;
  nextIdx: number;
}

const PANELS = [
  {
    name: 'stream',
    desc: 'let your thoughts run ahead of your meaning — unfiltered, unedited',
    glyph: (
      <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
        <path d="M5 10 Q9 7 16 10 T27 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 16 Q9 13 16 16 T27 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".75" />
        <path d="M5 22 Q9 19 16 22 T27 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
      </svg>
    ),
    color: 'ink' as const,
  },
  {
    name: 'body',
    desc: 'mark where this lands in your body — map the work onto the felt sense',
    glyph: (
      <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 19 Q10 15 16 14.5 Q22 15 24 19" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 19 L10 27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M22 19 L22 27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    color: 'ink' as const,
  },
  {
    name: 'journal',
    desc: 'return to what you have written — readings, reflections, your whole story',
    glyph: <ButterflyIcon size={52} glowing />,
    color: 'teal' as const,
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
  };

  const isLast = panel === PANELS.length - 1;
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
      aria-label="Journey instruments introduction"
      onClick={!isLast ? advance : undefined}
    >
      <button
        className="intro-skip"
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        aria-label="Skip introduction"
      >
        skip
      </button>

      <div key={panel} className="intro-panel">
        <div className={`intro-glyph intro-glyph--${p.color}`} aria-hidden="true">
          {p.glyph}
        </div>

        <div className="intro-eyebrow">your instruments</div>
        <h2 className="intro-title">{p.name}</h2>
        <p className="intro-body">{p.desc}</p>

        <div className="intro-footer">
          <div className="intro-dots" aria-hidden="true">
            {PANELS.map((_, i) => (
              <div key={i} className={`intro-dot${panel === i ? ' intro-dot--active' : ''}`} />
            ))}
          </div>
          {isLast ? (
            <button
              className="intro-btn"
              onClick={(e) => { e.stopPropagation(); dismiss(); }}
            >
              I understand
            </button>
          ) : (
            <div className="intro-tap-hint">tap to continue</div>
          )}
        </div>
      </div>
    </div>
  );
}
