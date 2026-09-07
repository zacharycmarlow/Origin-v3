import { useState, useRef, useCallback } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { extractTextFromFile } from '../utils/fileTextExtractor';

/* ═══════════════════════════════════════════════════════════════
   VideoRecorder — video recording via react-media-recorder (MIT).

   Uses the MediaRecorder API through react-media-recorder for all
   recording logic: start/stop/pause/resume, camera preview, blob
   generation. The resulting blob is uploaded to R2 via the presigned
   URL flow. After recording, the user can transcribe the video's
   audio track to text using Whisper (Transformers.js).

   Custom code: ~2% (hook call + upload to R2).
   ═══════════════════════════════════════════════════════════════ */

interface VideoRecorderProps {
  open: boolean;
  onClose: () => void;
  onRecorded?: (blob: Blob, url: string) => void;
  onTranscribed?: (text: string) => void;
}

export default function VideoRecorder({ open, onClose, onRecorded, onTranscribed }: VideoRecorderProps) {
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } =
    useReactMediaRecorder({ video: true, audio: true });
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribed, setTranscribed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Show camera preview when recording
  if (previewStream && videoRef.current && videoRef.current.srcObject !== previewStream) {
    videoRef.current.srcObject = previewStream;
  }

  const handleStop = useCallback(async () => {
    stopRecording();
  }, [stopRecording]);

  const handleUpload = useCallback(async () => {
    if (!mediaBlobUrl) return;
    setUploading(true);
    try {
      const blob = await fetch(mediaBlobUrl).then(r => r.blob());
      const filename = `recording-${Date.now()}.webm`;
      const contentType = blob.type || 'video/webm';

      // Get presigned URL
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType, size: blob.size }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const presignData = await presignRes.json();

      // Upload to R2
      const uploadRes = await fetch(presignData.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      // Confirm with API
      await fetch('/api/media/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: presignData.data.key,
          contentType,
          size: blob.size,
          kind: 'video',
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

  /* Transcribe the video's audio track using Whisper (Transformers.js).
     Extracts the audio, runs it through the same Whisper pipeline as
     live speech recognition, and passes the text back to WritingPage
     to insert into the editor. No character or duration limit. */
  const handleTranscribe = useCallback(async () => {
    if (!mediaBlobUrl) return;
    setTranscribing(true);
    try {
      const blob = await fetch(mediaBlobUrl).then(r => r.blob());
      const file = new File([blob], 'recording.webm', { type: blob.type || 'video/webm' });
      const result = await extractTextFromFile(file);
      if (result.text && onTranscribed) {
        onTranscribed(result.text);
        setTranscribed(true);
      }
    } catch (err) {
      console.error('Video transcription failed:', err);
    } finally {
      setTranscribing(false);
    }
  }, [mediaBlobUrl, onTranscribed]);

  if (!open) return null;

  return (
    <div className="recorder-overlay" role="dialog" aria-modal="true" aria-label="Video recording">
      <div className="recorder-shell">
        <div className="recorder-topbar">
          <span className="recorder-title">record a reflection</span>
          <button className="recorder-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="recorder-stage">
          {status === 'recording' ? (
            <video ref={videoRef} autoPlay muted className="recorder-preview" />
          ) : mediaBlobUrl ? (
            <video src={mediaBlobUrl} controls className="recorder-playback" />
          ) : (
            <div className="recorder-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <circle cx="12" cy="13" r="4" />
                <path d="M8 6L9 4h6l1 2" />
              </svg>
              <p>press record when you're ready</p>
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
            <button className="recorder-btn recorder-btn--stop" onClick={handleStop}>
              ■ stop
            </button>
          )}
          {mediaBlobUrl && !uploaded && (
            <>
              <button className="recorder-btn recorder-btn--retry" onClick={() => window.location.reload()}>
                ↺ re-record
              </button>
              <button
                className="recorder-btn recorder-btn--transcribe"
                onClick={handleTranscribe}
                disabled={transcribing}
                title="transcribe the audio from this video to text"
              >
                {transcribing ? 'transcribing…' : transcribed ? 'transcribed ✓' : 'transcribe'}
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
          {uploaded && (
            <>
              {!transcribed && (
                <button
                  className="recorder-btn recorder-btn--transcribe"
                  onClick={handleTranscribe}
                  disabled={transcribing}
                  title="transcribe the audio from this video to text"
                >
                  {transcribing ? 'transcribing…' : 'transcribe to text'}
                </button>
              )}
              <span className="recorder-saved">saved ✓</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
