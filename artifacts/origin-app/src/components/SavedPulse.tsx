import { useEffect, useState } from 'react';

export default function SavedPulse({ trigger }: { trigger: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;

  return (
    <span className="saved-pulse" aria-live="polite" aria-label="saved">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M1.5 6.5L4.5 9.5L10.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      saved
    </span>
  );
}
