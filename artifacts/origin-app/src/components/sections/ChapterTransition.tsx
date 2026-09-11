import { useState, useEffect } from 'react';
import { Chapter } from '../../chapters';
import { isChapterComplete, extractChapterBeats } from '../../storage';

interface Props {
  chapter: Chapter;
  chapterIdx: number;
  onReturnToWriting?: () => void;
}

export default function ChapterTransition({ chapter, chapterIdx, onReturnToWriting }: Props) {
  const [complete, setComplete] = useState(() => isChapterComplete(chapter));

  // Re-check completion when the component is visible (user may have just written)
  useEffect(() => {
    const interval = setInterval(() => {
      setComplete(isChapterComplete(chapter));
    }, 1000);
    return () => clearInterval(interval);
  }, [chapter]);

  const beats = extractChapterBeats(chapter);
  const filledBeats = beats.filter(b => b.text.trim().length > 0).length;
  const totalBeats = beats.length;

  if (!complete) {
    return (
      <div className="sj-transition sj-transition--gated">
        <div className="sj-transition-rule" />
        <div className="sj-gate-notice">
          <div className="sj-gate-notice-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L2 22 L22 22 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="12" cy="17.5" r="1" fill="currentColor" />
            </svg>
          </div>
          <p className="sj-gate-notice-title">the chapter is not yet complete</p>
          <p className="sj-gate-notice-body">
            Return to the writing above. Each section asks something of you —
            answer them all before crossing into the next territory.
          </p>
          <div className="sj-gate-notice-progress">
            <span className="sj-gate-notice-count">{filledBeats} / {totalBeats}</span>
            <span className="sj-gate-notice-bar">
              <span
                className="sj-gate-notice-bar-fill"
                style={{ width: `${totalBeats > 0 ? (filledBeats / totalBeats) * 100 : 0}%` }}
              />
            </span>
          </div>
          <p className="sj-gate-notice-hint">scroll up to continue writing</p>
          <button className="return-to-writing-btn" onClick={onReturnToWriting} disabled={!onReturnToWriting}>
            <span className="return-to-writing-arrow" aria-hidden="true">↑</span>
            <span className="return-to-writing-label">return to your writing</span>
          </button>
        </div>
        <div className="sj-transition-rule" />
      </div>
    );
  }

  return (
    <div className="sj-transition">
      <div className="sj-transition-rule" />
      {chapter.transition && (
        <p className="sj-transition-text">{chapter.transition}</p>
      )}
      <div className="sj-transition-rule" />
      <div className="sj-transition-arrow" aria-hidden="true">
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <line x1="8" y1="0" x2="8" y2="14" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <path d="M2 9l6 9 6-9" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
