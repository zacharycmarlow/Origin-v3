import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useShareCard, shareImage } from './ShareCard';

/* ═══════════════════════════════════════════════════════════════
   SharePrompt — gentle encouragement to share a journey moment.

   Design principles (per DESIGN.md):
   - Never pushy or gamified
   - Always offer "keep private" as the first option
   - Always show a preview before sharing
   - Never shame non-sharers
   - Metamyth branding on all shared content

   Custom code: ~3% (encouragement copy + UI flow).
   ═══════════════════════════════════════════════════════════════ */

interface SharePromptProps {
  open: boolean;
  onClose: () => void;
  text: string;
  title?: string;
  eyebrow?: string;
  accentColor?: string;
}

export default function SharePrompt({ open, onClose, text, title, eyebrow, accentColor }: SharePromptProps) {
  const { generate, generating } = useShareCard();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const handlePreview = useCallback(async () => {
    const url = await generate({ text, title, eyebrow, accentColor });
    setPreviewUrl(url);
  }, [generate, text, title, eyebrow, accentColor]);

  const handleShare = useCallback(async () => {
    if (!previewUrl) return;
    const success = await shareImage(previewUrl, text, title || 'My Origin Journey');
    setShared(true);
  }, [previewUrl, text, title]);

  if (!open) return null;

  return createPortal(
    <div className="share-prompt-overlay" role="dialog" aria-modal="true" aria-label="Share your journey">
      <div className="share-prompt-shell">
        <button className="share-prompt-close" onClick={onClose} aria-label="Close">×</button>

        <div className="share-prompt-content">
          <p className="share-prompt-eyebrow">a moment worth witnessing</p>
          <h3 className="share-prompt-title">
            Would you like to share a glimpse?
          </h3>
          <p className="share-prompt-body">
            Sharing isn't about performance. It's about letting the story be witnessed.
            You choose what, if anything, to show.
          </p>

          {previewUrl && (
            <div className="share-prompt-preview">
              <img src={previewUrl} alt="Share card preview" />
            </div>
          )}

          <div className="share-prompt-actions">
            <button className="share-prompt-btn share-prompt-btn--private" onClick={onClose}>
              keep it private
            </button>
            {!previewUrl ? (
              <button
                className="share-prompt-btn share-prompt-btn--preview"
                onClick={handlePreview}
                disabled={generating}
              >
                {generating ? 'creating…' : 'preview a share card'}
              </button>
            ) : (
              <button
                className="share-prompt-btn share-prompt-btn--share"
                onClick={handleShare}
                disabled={shared}
              >
                {shared ? 'shared ✓' : 'share it'}
              </button>
            )}
          </div>

          <p className="share-prompt-footnote">
            Your journey is yours alone. There is no wrong answer.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
