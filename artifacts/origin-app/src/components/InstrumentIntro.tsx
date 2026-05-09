import { useState, useEffect } from 'react';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';

interface Props {
  onDismiss: (nextIdx: number) => void;
  nextIdx: number;
}

type Panel = 'morpho' | 'sage' | 'instruments';
const PANELS: Panel[] = ['morpho', 'sage', 'instruments'];

export default function InstrumentIntro({ onDismiss, nextIdx }: Props) {
  const [panel, setPanel] = useState<Panel>('morpho');
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem('origin.intro.seen', '1');
    setExiting(true);
    setTimeout(() => onDismiss(nextIdx), 380);
  };

  const advance = () => {
    const idx = PANELS.indexOf(panel);
    if (idx < PANELS.length - 1) {
      setPanel(PANELS[idx + 1]);
    } else {
      dismiss();
    }
  };

  const isLast = panel === 'instruments';

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
    >
      <button className="intro-skip" onClick={dismiss} aria-label="Skip introduction">
        skip
      </button>

      {panel === 'morpho' && (
        <div className="intro-panel">
          <div className="intro-glyph intro-glyph--teal" aria-hidden="true">
            <ButterflyIcon size={72} glowing />
          </div>
          <div className="intro-eyebrow">a reading companion</div>
          <h2 className="intro-title">Morpho</h2>
          <p className="intro-body">
            As you write your way through these chapters, Morpho reads alongside you.
            After each chapter is complete, open the readings to receive Morpho's reflection —
            the thread running through your words, the pattern below the surface,
            the thing your writing knows before you do.
          </p>
        </div>
      )}

      {panel === 'sage' && (
        <div className="intro-panel">
          <div className="intro-glyph intro-glyph--gold" aria-hidden="true">
            <CompassIcon size={72} glowing />
          </div>
          <div className="intro-eyebrow">a mythic compass</div>
          <h2 className="intro-title">The Sage</h2>
          <p className="intro-body">
            After Morpho reads, the Sage speaks. The Sage carries the traditions
            and the science in the same hand — specific myths, specific researchers,
            specific findings — and names the ancient patterns your story is following.
            Your Codex is built from what the Sage gives you.
          </p>
        </div>
      )}

      {panel === 'instruments' && (
        <div className="intro-panel">
          <div className="intro-instruments-heading">two instruments, always with you</div>
          <div className="intro-instruments">
            <div className="intro-instrument">
              <div className="intro-instr-icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                  <path d="M5 10 Q9 7 16 10 T27 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M5 16 Q9 13 16 16 T27 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".75" />
                  <path d="M5 22 Q9 19 16 22 T27 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".5" />
                </svg>
              </div>
              <div className="intro-instr-name">stream</div>
              <div className="intro-instr-desc">let thoughts flow ahead of meaning, unfiltered</div>
            </div>
            <div className="intro-instrument">
              <div className="intro-instr-icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 19 Q10 15 16 14.5 Q22 15 24 19" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M10 19 L10 27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M22 19 L22 27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="intro-instr-name">body</div>
              <div className="intro-instr-desc">mark where the work lands in you</div>
            </div>
          </div>
          <p className="intro-instruments-note">
            The butterfly in the bar below opens Morpho's readings.
            Stream and body are beside it — available at any moment.
          </p>
        </div>
      )}

      <div className="intro-footer">
        <div className="intro-dots" aria-hidden="true">
          {PANELS.map(p => (
            <div key={p} className={`intro-dot${panel === p ? ' intro-dot--active' : ''}`} />
          ))}
        </div>
        <button className="intro-btn" onClick={advance}>
          {isLast ? 'begin the journey' : 'continue'}
        </button>
      </div>
    </div>
  );
}
