import { useState } from 'react';
import { useUser } from '@clerk/react';
import { getAllReadings, getCumulative, getBodyEntries, getStreamEntries, load } from '../storage';

type Mode = 'readings' | 'full';

interface Props {
  onDone: () => void;
  onSkip: () => void;
}

export default function SharingConsent({ onDone, onSkip }: Props) {
  const { user } = useUser();
  const [mode, setMode] = useState<Mode>('readings');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cumulative = getCumulative();
  const readings = getAllReadings();

  const chapterValues = Object.values(readings);
  const throughLine =
    cumulative?.morpho?.throughLine ||
    [...chapterValues].reverse().find(r => r.morpho?.throughLine)?.morpho?.throughLine ||
    '';
  const resonance =
    cumulative?.sage?.resonance ||
    [...chapterValues].reverse().find(r => r.sage?.resonance)?.sage?.resonance ||
    '';

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        readings,
        cumulative: cumulative ?? null,
      };
      if (mode === 'full') {
        payload.responses = load();
        payload.stream = getStreamEntries();
        payload.body = getBodyEntries();
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, payload }),
      });
      if (!res.ok) throw new Error('Submission failed — please try again.');

      localStorage.setItem('origin.sharing.done', '1');
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('origin.sharing.skipped', '1');
    onSkip();
  };

  if (submitted) {
    return (
      <div className="sharing-consent-backdrop" role="dialog" aria-modal="true">
        <div className="sharing-consent">
          <div className="sharing-consent-glyph" aria-hidden="true">
            <svg viewBox="0 0 60 60" width="48" height="48">
              <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth=".5" />
              <path d="M18 30 l9 9 l15-17" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="sharing-consent-title">received</h2>
          <p className="sharing-consent-body">
            Your journey has been shared. Thank you for trusting us with your work.
          </p>
          {!user && (
            <p className="sharing-consent-body sharing-consent-guest-note">
              Create an account to preserve your journey across devices and revisit it any time.
            </p>
          )}
          <div className="sharing-consent-actions">
            <button className="primary-btn" onClick={onDone}>
              <span className="label">continue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sharing-consent-backdrop" role="dialog" aria-modal="true" aria-label="Share your journey">
      <div className="sharing-consent">
        <div className="sharing-consent-eyebrow">an invitation</div>
        <h2 className="sharing-consent-title">share your journey</h2>

        <p className="sharing-consent-body">
          You have walked all seven chapters. If you are willing, we would be honored to receive a record of what surfaced — to understand what this work makes possible, and to carry it forward.
        </p>

        {(throughLine || resonance) && (
          <div className="sharing-consent-preview">
            {throughLine && (
              <div className="sharing-preview-row">
                <span className="sharing-preview-label">morpho through-line</span>
                <p className="sharing-preview-text">{throughLine}</p>
              </div>
            )}
            {resonance && (
              <div className="sharing-preview-row">
                <span className="sharing-preview-label">sage resonance</span>
                <p className="sharing-preview-text">{resonance}</p>
              </div>
            )}
          </div>
        )}

        <div className="sharing-consent-options">
          <label className={`sharing-option${mode === 'readings' ? ' sharing-option--selected' : ''}`}>
            <input
              type="radio"
              name="share-mode"
              value="readings"
              checked={mode === 'readings'}
              onChange={() => setMode('readings')}
            />
            <span className="sharing-option-title">readings only</span>
            <span className="sharing-option-desc">
              Morpho &amp; Sage readings, your personalized codes and lore, and the cumulative arc reading.
            </span>
          </label>
          <label className={`sharing-option${mode === 'full' ? ' sharing-option--selected' : ''}`}>
            <input
              type="radio"
              name="share-mode"
              value="full"
              checked={mode === 'full'}
              onChange={() => setMode('full')}
            />
            <span className="sharing-option-title">readings + reflections</span>
            <span className="sharing-option-desc">
              Everything above, plus your written responses, stream entries, and body notes.
            </span>
          </label>
        </div>

        <p className="sharing-consent-fine">
          Sharing is entirely optional. Your data is never sold or shared with third parties. This is used only to improve the journey.
        </p>

        {error && <p className="sharing-consent-error">{error}</p>}

        <div className="sharing-consent-actions">
          <button
            className="primary-btn"
            onClick={handleConfirm}
            disabled={submitting}
          >
            <span className="label">{submitting ? 'sending…' : 'share'}</span>
          </button>
          <button className="btn-ghost" onClick={handleSkip} disabled={submitting}>
            <span className="label">skip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
