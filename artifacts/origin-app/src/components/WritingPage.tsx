import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { load, save } from '../storage';
import { useLocalSpeechRecognition } from '../hooks/useLocalSpeechRecognition';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Placeholder } from '@tiptap/extension-placeholder';
import VideoRecorder from './VideoRecorder';

/* ═══════════════════════════════════════════════════════════════
   THE WRITING PAGE — the full-screen writing surface.

   A cramped textarea is a promise about the expected answer: it
   says "one sentence." This is the opposite — when the writer
   commits to answering, the whole screen becomes the page. The
   question shrinks to a quiet line at the top, the chrome recedes
   while typing, and the tools (voice, a photo of a handwritten
   page, Morpho, video, rich text formatting) sit at the bottom
   edge within reach but out of the way.

   Rich text via TipTap (MIT): bold, italic, font family, text color.
   Speech via Web Speech API with error feedback.
   Video recording via react-media-recorder (MIT).

   Rendered through document.body via createPortal — the beats use
   transforms for the melt, and a transformed ancestor traps
   position:fixed.
   ═══════════════════════════════════════════════════════════════ */

const FONT_OPTIONS = [
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Sans', value: 'Inter, system-ui, sans-serif' },
  { label: 'Mono', value: '"SF Mono", "Cascadia Code", monospace' },
  { label: 'Script', value: '"Brush Script MT", cursive' },
];

const COLOR_OPTIONS = ['#4a3a24', '#c89838', '#8a5a24', '#4ff0d6', '#888888'];

/* Languages for the multilingual Whisper model.
   '' = auto-detect — Whisper identifies the spoken language. */
const SPEECH_LANGS: { label: string; value: string }[] = [
  { label: 'Auto-detect', value: '' },
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Português', value: 'pt' },
  { label: 'Italiano', value: 'it' },
  { label: 'Nederlands', value: 'nl' },
  { label: 'Polski', value: 'pl' },
  { label: 'Svenska', value: 'sv' },
  { label: 'Türkçe', value: 'tr' },
  { label: 'Русский', value: 'ru' },
  { label: 'Українська', value: 'uk' },
  { label: 'Čeština', value: 'cs' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' },
  { label: '中文', value: 'zh' },
  { label: 'हिन्दी', value: 'hi' },
  { label: 'العربية', value: 'ar' },
  { label: 'עברית', value: 'he' },
  { label: ' فارسی', value: 'fa' },
  { label: 'اردو', value: 'ur' },
  { label: 'বাংলা', value: 'bn' },
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'ไทย', value: 'th' },
  { label: 'Indonesia', value: 'id' },
  { label: 'Filipino', value: 'tl' },
  { label: 'Swahili', value: 'sw' },
  { label: 'Yorùbá', value: 'yo' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  sceneKey: string;
  question?: string;
  detail?: string;
  placeholder?: string;
  eyebrow?: string;
  onMorpho?: () => void;
}

export default function WritingPage({
  open, onClose, sceneKey, question, detail, placeholder, eyebrow, onMorpho,
}: Props) {
  const [typing, setTyping] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [savedWordCount, setSavedWordCount] = useState(0);
  const [speechLang, setSpeechLang] = useState('');

  const typingTimer = useRef<number | undefined>(undefined);
  const editorRef = useRef<HTMLDivElement>(null);

  /* Load stored content — supports both old plain-text and new HTML. */
  const storedVal = (() => {
    const stored = load()[sceneKey];
    return typeof stored === 'string' ? stored : '';
  })();

  /* TipTap rich text editor. */
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      Placeholder.configure({
        placeholder: placeholder || 'write here…',
      }),
    ],
    content: storedVal,
    editorProps: {
      attributes: {
        class: 'wp-editor',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => {
      markTyping();
      const html = editor.getHTML();
      // Autosave
      const t = setTimeout(() => save(sceneKey, html), 300);
      return () => clearTimeout(t);
    },
  }, [sceneKey, placeholder]);

  /* Speech recognition — uses local Whisper model (Transformers.js)
     so it works in Brave and other privacy-focused browsers that block
     the Web Speech API's remote server calls. Audio never leaves the
     device. The model (~40MB) loads lazily on first use and caches. */
  const handleSpeechResult = useCallback((text: string) => {
    if (editor) {
      // Insert text at current cursor position, replacing any selection
      editor.chain().focus().insertContent(text + ' ').run();
    }
  }, [editor]);

  const {
    listening, error: speechError, modelLoading, transcribing,
    toggle: toggleSpeech, stop: stopSpeech,
  } = useLocalSpeechRecognition(handleSpeechResult, {
    language: speechLang || undefined,
    task: 'transcribe',
  });

  /* Re-read stored value whenever the page opens. */
  useEffect(() => {
    if (!open || !editor) return;
    const stored = load()[sceneKey];
    const next = typeof stored === 'string' ? stored : '';
    editor.commands.setContent(next || '<p></p>');
    const t = setTimeout(() => editor.commands.focus(), 60);
    return () => clearTimeout(t);
  }, [open, sceneKey, editor]);

  /* lock the page behind it; Esc closes */
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  /* stop dictation when the page closes */
  useEffect(() => { if (!open) stopSpeech(); }, [open, stopSpeech]);

  /* Update word count when editor changes */
  useEffect(() => {
    if (!editor) return;
    const updateCount = () => {
      const text = editor.getText();
      const count = text.trim().split(/\s+/).filter(Boolean).length;
      setSavedWordCount(count);
    };
    editor.on('update', updateCount);
    updateCount();
    return () => { editor.off('update', updateCount); };
  }, [editor]);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const markTyping = () => {
    setTyping(true);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTyping(false), 1600);
  };

  const handleVideoRecorded = useCallback((_blob: Blob, url: string) => {
    setVideoUrl(url);
    setShowVideoRecorder(false);
  }, []);

  if (!open) return null;

  return createPortal(
    <div className="writing-page" data-typing={typing ? 'true' : 'false'} role="dialog" aria-modal="true">
      <div className="writing-page-surface">
        <header className="wp-head">
          {eyebrow && <div className="wp-eyebrow">{eyebrow}</div>}
          {question && <h2 className="wp-question">{question}</h2>}
          {detail && <p className="wp-detail">{detail}</p>}
        </header>

        <div className="wp-editor-wrap" ref={editorRef}>
          <EditorContent editor={editor} />
        </div>

        {photo && (
          <div className="wp-photo">
            <img src={photo} alt="the page you photographed" />
            <button className="wp-photo-drop" onClick={() => setPhoto(null)} aria-label="remove photo">×</button>
          </div>
        )}

        {videoUrl && (
          <div className="wp-video">
            <video src={videoUrl} controls />
            <button className="wp-photo-drop" onClick={() => setVideoUrl(null)} aria-label="remove video">×</button>
          </div>
        )}
      </div>

      {/* Rich text format bar — slides in when the format button is tapped */}
      {showFormatBar && editor && (
        <div className="wp-format-bar">
          <button
            className={'wp-fmt-btn' + (editor.isActive('bold') ? ' wp-fmt-btn--active' : '')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className={'wp-fmt-btn' + (editor.isActive('italic') ? ' wp-fmt-btn--active' : '')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
            aria-label="Italic"
          >
            <em>I</em>
          </button>
          <div className="wp-fmt-divider" />
          <select
            className="wp-fmt-select"
            value={editor.getAttributes('fontFamily').fontFamily || ''}
            onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
            title="Font"
          >
            <option value="">Default font</option>
            {FONT_OPTIONS.map(f => (
              <option key={f.label} value={f.value}>{f.label}</option>
            ))}
          </select>
          <div className="wp-fmt-divider" />
          {COLOR_OPTIONS.map(color => (
            <button
              key={color}
              className={'wp-fmt-color' + (editor.getAttributes('textStyle').color === color ? ' wp-fmt-color--active' : '')}
              style={{ background: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
              title={`Text color ${color}`}
              aria-label={`Text color ${color}`}
            />
          ))}
          <button
            className="wp-fmt-color wp-fmt-color--reset"
            onClick={() => editor.chain().focus().unsetColor().run()}
            title="Reset color"
            aria-label="Reset color"
          >
            ×
          </button>
        </div>
      )}

      <div className="wp-bar">
        <div className="wp-tools">
          <button
            className={'wp-tool' + (listening ? ' wp-tool--live' : '')}
            onClick={() => toggleSpeech()}
            disabled={modelLoading || transcribing}
            aria-label={listening ? 'stop dictation' : 'speak'}
            title={listening ? 'stop dictation' : 'speak'}
          >
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="7" y="1" width="6" height="11" rx="3" fill="currentColor" />
              <path d="M4 10a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <select
            className="wp-lang-select"
            value={speechLang}
            onChange={e => setSpeechLang(e.target.value)}
            disabled={listening || modelLoading}
            title="Speech language"
            aria-label="Speech language"
          >
            {SPEECH_LANGS.map(l => (
              <option key={l.value || 'auto'} value={l.value}>{l.label}</option>
            ))}
          </select>

          <button
            className={'wp-tool' + (showFormatBar ? ' wp-tool--active' : '')}
            onClick={() => setShowFormatBar(s => !s)}
            title="format text"
            aria-label="format text"
          >
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <label className="wp-tool" title="photograph a page" aria-label="photograph a page">
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="1.5" y="4.5" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="10" cy="10.5" r="3.4" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6.5 4.5 7.8 2.4h4.4l1.3 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} hidden />
          </label>

          <button
            className="wp-tool"
            onClick={() => setShowVideoRecorder(true)}
            title="record a video reflection"
            aria-label="record a video reflection"
          >
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="1.5" y="4.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M14.5 8.5l4-2.5v8l-4-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
              <circle cx="8" cy="10" r="2" fill="currentColor" opacity="0.3" />
            </svg>
          </button>

          {onMorpho && (
            <button className="wp-tool" onClick={onMorpho} title="turn this into story" aria-label="turn this into story">
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4v12M10 6C8 2.5 3 3 3 7c0 3 4 3.6 7 3.6M10 6c2-3.5 7-3 7 1 0 3-4 3.6-7 3.6"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          )}
        </div>

        <div className="wp-status">
          {speechError ? (
            <span className="wp-error">{speechError}</span>
          ) : transcribing ? (
            <span className="wp-live">transcribing…</span>
          ) : modelLoading ? (
            <span className="wp-live">loading speech model…</span>
          ) : listening ? (
            <span className="wp-live">recording — tap to stop &amp; transcribe</span>
          ) : savedWordCount > 0 ? (
            <span>{`saved · ${savedWordCount} words`}</span>
          ) : null}
        </div>

        <button className="wp-done" onClick={onClose}>done</button>
      </div>

      {showVideoRecorder && (
        <VideoRecorder
          open={showVideoRecorder}
          onClose={() => setShowVideoRecorder(false)}
          onRecorded={handleVideoRecorded}
        />
      )}
    </div>,
    document.body,
  );
}
