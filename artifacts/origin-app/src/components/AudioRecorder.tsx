import { useState, useCallback } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

/* ═══════════════════════════════════════════════════════════════
   AudioRecorder — audio-only recording via react-media-recorder (MIT).

   Same library as VideoRecorder, but audio-only mode. Generates a
   WebM audio blob that can be uploaded to R2 and published as a
   podcast episode.

   Custom code: ~1% (hook call + upload to R2).
   ═══════════════════════════════════════════════════════════════ */

interface AudioRecorderProps {
  open: boolean;
  onClose: () => void;
  onRecorded?: (blob: Blob, url: string) => void;
}

export default function AudioRecorder({ open, onClose, onRecorded }: AudioRecorderProps) {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = useCallback(async () => {
    if (!mediaBlobUrl) return;
    setUploading(true);
    try {
      const blob = await fetch(mediaBlobUrl).then(r => r.blob());
      const filename = `audio-${Date.now()}.webm`;
      const contentType = blob.type || 'audio/webm';

      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType, size: blob.size }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const presignData = await presignRes.json();

      await fetch(presignData.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      await fetch('/api/media/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: presignData.data.key,
          contentType,
          size: blob.size,
          kind: 'audio',
          originalName: filename,
        }),
      });

      setUploaded(true);
      onRecorded?.(blob, mediaBlobUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, [mediaBlobUrl, onRecorded]);

  if (!open) return null;

  return (
    <div className="recorder-overlay" role="dialog" aria-modal="true" aria-label="Audio recording">
      <div className="recorder-shell recorder-shell--audio">
        <div className="recorder-topbar">
          <span className="recorder-title">voice reflection</span>
          <button className="recorder-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="recorder-stage recorder-stage--audio">
          {status === 'recording' ? (
            <div className="recorder-pulse">
              <span className="recorder-pulse-dot" />
              <span>listening…</span>
            </div>
          ) : mediaBlobUrl ? (
            <audio src={mediaBlobUrl} controls className="recorder-audio-playback" />
          ) : (
            <div className="recorder-placeholder">
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                <rect x="7" y="1" width="6" height="11" rx="3" fill="currentColor" />
                <path d="M4 10a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p>press record to capture your voice</p>
            </div>
          )}
        </div>

        <div className="recorder-controls">
          {status !== 'recording' && !mediaBlobUrl && (
            <button className="recorder-btn recorder-btn--record" onClick={startRecording}>
              ● record
            </button>
          )}
          {status === 'recording' && (
            <button className="recorder-btn recorder-btn--stop" onClick={stopRecording}>
              ■ stop
            </button>
          )}
          {mediaBlobUrl && !uploaded && (
            <>
              <button className="recorder-btn recorder-btn--retry" onClick={() => window.location.reload()}>
                ↺ re-record
              </button>
              <button
                className="recorder-btn recorder-btn--save"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'uploading…' : 'save'}
              </button>
            </>
          )}
          {uploaded && <span className="recorder-saved">saved ✓</span>}
        </div>
      </div>
    </div>
  );
}
