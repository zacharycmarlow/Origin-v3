import { useState } from 'react';
import { useUser } from '@clerk/react';

const METAMYTH_URL = import.meta.env.VITE_METAMYTH_URL as string | undefined;

export default function MetamythInvite() {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || 'Something went wrong.');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="metamyth-invite">
      <hr className="gold-rule metamyth-invite-rule" />
      <div className="metamyth-invite-eyebrow">what comes next</div>
      <h2 className="metamyth-invite-title">The Metamyth Journey</h2>
      <p className="metamyth-invite-body">
        The Origin opened a door. The Metamyth Journey is where the personal story meets the larger one — a guided container for the work that reaches beyond your own life.
      </p>
      <p className="metamyth-invite-body metamyth-invite-body--dim">
        When it opens, we would like you to be among the first inside.
      </p>

      {done ? (
        <div className="metamyth-invite-confirmed">
          <div className="metamyth-invite-confirmed-glyph" aria-hidden="true">
            <svg viewBox="0 0 60 60" width="40" height="40">
              <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth=".5" />
              <path d="M18 30 l9 9 l15-17" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="metamyth-invite-confirmed-text">you're on the list</p>
          <p className="metamyth-invite-confirmed-sub">We'll reach you at {email} when the Journey opens.</p>
        </div>
      ) : METAMYTH_URL ? (
        <div className="metamyth-invite-link-wrap">
          <a
            className="primary-btn metamyth-invite-link"
            href={METAMYTH_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="label">learn more about the metamyth journey</span>
          </a>
        </div>
      ) : (
        <form className="metamyth-invite-form" onSubmit={handleSubmit}>
          <div className="metamyth-invite-field">
            <label htmlFor="metamyth-email" className="metamyth-invite-label">your email</label>
            <input
              id="metamyth-email"
              className="metamyth-invite-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {error && <p className="metamyth-invite-error">{error}</p>}
          <button
            className="primary-btn metamyth-invite-submit"
            type="submit"
            disabled={submitting || !email.trim()}
          >
            <span className="label">{submitting ? 'joining…' : 'join the waitlist'}</span>
          </button>
          <p className="metamyth-invite-fine">No spam. Only the opening invitation, when the time comes.</p>
        </form>
      )}
    </div>
  );
}
