import { Chapter } from '../../chapters';

interface Props {
  chapter: Chapter;
}

export default function ChapterTransition({ chapter }: Props) {
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
