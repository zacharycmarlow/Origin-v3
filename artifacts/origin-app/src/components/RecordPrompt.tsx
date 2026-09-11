import { useState } from 'react';
import { createPortal } from 'react-dom';
import VideoRecorder from './VideoRecorder';
import AudioRecorder from './AudioRecorder';

/* ═══════════════════════════════════════════════════════════════
   RecordPrompt — gentle encouragement to record voice/video.

   Design principles:
   - Never auto-start recording
   - Always offer "keep it private" as first option
   - Frame as "giving your words a voice" not "creating content"
   - Never mandatory

   Custom code: ~3% (encouragement copy + UI flow).
   ═══════════════════════════════════════════════════════════════ */

interface RecordPromptProps {
  open: boolean;
  onClose: () => void;
  context: 'writing' | 'reading' | 'chapter' | 'journey';
}

const COPY: Record<RecordPromptProps['context'], { title: string; body: string }> = {
  writing: {
    title: 'Would you like to speak it aloud?',
    body: 'Some people find that hearing their own voice give weight to what they wrote changes how it lands.',
  },
  reading: {
    title: 'Would you like to speak your response?',
    body: 'This reading emerged from your words. If you\'d like to speak your response to it, the microphone is here.',
  },
  chapter: {
    title: 'Would you like to record a reflection?',
    body: 'A video reflection — just you, your voice, your face, your words — can be a powerful artifact of this moment.',
  },
  journey: {
    title: 'Would you like to record your origin story?',
    body: 'Some people find that reading it aloud — recording it as a video or audio piece — makes it real in a different way.',
  },
};

export default function RecordPrompt({ open, onClose, context }: RecordPromptProps) {
  const [mode, setMode] = useState<'prompt' | 'video' | 'audio'>('prompt');
  const copy = COPY[context];

  if (!open) return null;

  if (mode === 'video') {
    return <VideoRecorder open={true} onClose={() => { setMode('prompt'); onClose(); }} />;
  }
  if (mode === 'audio') {
    return <AudioRecorder open={true} onClose={() => { setMode('prompt'); onClose(); }} />;
  }

  return createPortal(
    <div className="share-prompt-overlay" role="dialog" aria-modal="true" aria-label="Record a reflection">
      <div className="share-prompt-shell">
        <button className="share-prompt-close" onClick={onClose} aria-label="Close">×</button>

        <div className="share-prompt-content">
          <p className="share-prompt-eyebrow">giving your words a voice</p>
          <h3 className="share-prompt-title">{copy.title}</h3>
          <p className="share-prompt-body">{copy.body}</p>

          <div className="share-prompt-actions">
            <button className="share-prompt-btn share-prompt-btn--private" onClick={onClose}>
              not now
            </button>
            <button
              className="share-prompt-btn share-prompt-btn--preview"
              onClick={() => setMode('audio')}
            >
              🎙 voice
            </button>
            <button
              className="share-prompt-btn share-prompt-btn--preview"
              onClick={() => setMode('video')}
            >
              📹 video
            </button>
          </div>

          <p className="share-prompt-footnote">
            Recording is always optional. Your written words are already enough.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
