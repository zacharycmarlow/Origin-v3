import { useState, useEffect, useCallback } from 'react';
import { load, save } from '../storage';
import WritingPage from './WritingPage';

interface Props {
  sceneKey: string;
  placeholder?: string;
  rows?: number;
  big?: boolean;
  onSave?: () => void;
  /* the question + elaboration, carried into the full-screen page */
  question?: string;
  detail?: string;
  eyebrow?: string;
}

/* Strip HTML tags for the preview textarea — the rich text editor
   lives inside WritingPage, the journal box is just a preview. */
function htmlToText(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function Journal({
  sceneKey, placeholder, rows = 4, big, onSave, question, detail, eyebrow,
}: Props) {
  const [val, setVal] = useState<string>(() => {
    const stored = load()[sceneKey];
    return typeof stored === 'string' ? stored : '';
  });
  const [pageOpen, setPageOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      save(sceneKey, val);
      if (val.trim()) onSave?.();
    }, 300);
    return () => clearTimeout(t);
  }, [val, sceneKey]); // eslint-disable-line

  // For preview, show plain text (strip HTML if rich text was used)
  const previewText = val.startsWith('<') || val.includes('<p>') ? htmlToText(val) : val;
  const wordCount = previewText.trim().split(/\s+/).filter(Boolean).length;

  const openPage = () => setPageOpen(true);
  const closePage = useCallback(() => {
    setPageOpen(false);
    const stored = load()[sceneKey];
    const next = typeof stored === 'string' ? stored : '';
    setVal(next);
    if (next.trim()) onSave?.();
  }, [sceneKey, onSave]);

  return (
    <div className={'journal' + (big ? ' journal-big' : '')}>
      <WritingPage
        open={pageOpen}
        onClose={closePage}
        sceneKey={sceneKey}
        question={question}
        detail={detail}
        eyebrow={eyebrow}
        placeholder={placeholder}
      />
      <div className="journal-textarea-wrap">
        {/* Touching the desk opens the full page — the writing happens
            on a whole screen, never inside a cramped box. */}
        <textarea
          value={previewText}
          onFocus={openPage}
          onClick={openPage}
          readOnly
          placeholder={placeholder || 'write here…'}
          rows={rows}
        />
        <button
          className={'mic-btn'}
          onClick={openPage}
          title="speak your response"
          aria-label="start voice input"
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="7" y="1" width="6" height="11" rx="3" fill="currentColor" />
              <path d="M4 10a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="19" x2="13" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
      </div>
      <div className="journal-meta">
        {val ? <span>{`saved · ${wordCount} words`}</span> : null}
      </div>
    </div>
  );
}
