import { useState } from 'react';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════════════════════════
   PublishPrompt — gentle encouragement to publish recordings.

   After recording, gently encourage publishing to YouTube, podcast
   platforms, or social media — all with Metamyth branding.

   Design principles:
   - Default to unlisted/private — user must explicitly choose public
   - Always show Metamyth branding on the preview
   - Never publish without explicit confirmation
   - Always offer "keep private" as the first option

   Custom code: ~2% (publishing flow UI + confirmation).
   ═══════════════════════════════════════════════════════════════ */

interface PublishPromptProps {
  open: boolean;
  onClose: () => void;
  mediaKind: 'audio' | 'video';
  mediaUrl?: string;
}

export default function PublishPrompt({ open, onClose, mediaKind, mediaUrl }: PublishPromptProps) {
  const [privacy, setPrivacy] = useState<'private' | 'unlisted' | 'public'>('unlisted');

  if (!open) return null;

  const isVideo = mediaKind === 'video';

  return createPortal(
    <div className="share-prompt-overlay" role="dialog" aria-modal="true" aria-label="Publish your reflection">
      <div className="share-prompt-shell">
        <button className="share-prompt-close" onClick={onClose} aria-label="Close">×</button>

        <div className="share-prompt-content">
          <p className="share-prompt-eyebrow">your reflection is saved</p>
          <h3 className="share-prompt-title">
            Would you like to publish it?
          </h3>
          <p className="share-prompt-body">
            {isVideo
              ? 'If you\'d like to share it — on YouTube, or just with a link — it will carry the Metamyth mark.'
              : 'If you\'d like it to live as a podcast episode — on Spotify, Apple Podcasts, or just as an RSS feed — it will carry the Metamyth mark.'}
          </p>

          {mediaUrl && (
            <div className="share-prompt-preview">
              {isVideo ? (
                <video src={mediaUrl} controls style={{ maxWidth: '100%', borderRadius: 4 }} />
              ) : (
                <audio src={mediaUrl} controls style={{ width: '100%' }} />
              )}
            </div>
          )}

          {/* Privacy selector */}
          <div className="publish-privacy">
            <label className="publish-privacy-label">visibility:</label>
            <select
              value={privacy}
              onChange={e => setPrivacy(e.target.value as typeof privacy)}
              className="publish-privacy-select"
            >
              <option value="private">private — only you</option>
              <option value="unlisted">unlisted — link only</option>
              <option value="public">public — anyone can find it</option>
            </select>
          </div>

          <div className="share-prompt-actions">
            <button className="share-prompt-btn share-prompt-btn--private" onClick={onClose}>
              keep it private
            </button>
            {isVideo ? (
              <button className="share-prompt-btn share-prompt-btn--share" onClick={() => { /* TODO: YouTube upload */ onClose(); }}>
                publish to YouTube
              </button>
            ) : (
              <button className="share-prompt-btn share-prompt-btn--share" onClick={() => { /* TODO: Podcast RSS */ onClose(); }}>
                publish as podcast
              </button>
            )}
          </div>

          <p className="share-prompt-footnote">
            Publishing isn't about audience. It's about letting the story exist outside your own head.
            You can always keep it private. You can always publish later. You can always delete it.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
