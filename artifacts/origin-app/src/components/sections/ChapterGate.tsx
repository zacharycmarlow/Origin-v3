import { useEffect, useState } from 'react';
import { Chapter } from '../../chapters';

interface Props {
  chapter: Chapter;
  chapterIdx: number;
  total: number;
}

export default function ChapterGate({ chapter, chapterIdx, total }: Props) {
  const paragraphs = chapter.invocation.split('\n\n');
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 380),
      setTimeout(() => setPhase(3), 640),
      ...paragraphs.map((_, i) =>
        setTimeout(() => setPhase(4 + i), 900 + i * 220)
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [chapter.title]); // eslint-disable-line

  return (
    <div className="sj-gate-inner">
      <div className={`opener-meta opener-phase${phase >= 1 ? ' opener-phase--in' : ''}`}>
        <span>chapter {String(chapterIdx + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}</span>
        <span className="opener-rule" />
        <span>territory · {chapter.title.toLowerCase()}</span>
      </div>
      <div
        className={`opener-roman opener-phase${phase >= 1 ? ' opener-phase--in' : ''}`}
        style={{ transitionDelay: '60ms' }}
      >
        {chapter.roman}
      </div>
      <h1 className={`opener-title opener-phase${phase >= 2 ? ' opener-phase--in' : ''}`}>
        {chapter.title}
      </h1>
      <div className={`opener-sub opener-phase${phase >= 3 ? ' opener-phase--in' : ''}`}>
        {chapter.subtitle}
      </div>
      <blockquote className="opener-invocation">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className={`opener-invocation-para opener-phase${phase >= 4 + i ? ' opener-phase--in' : ''}`}
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {para}
          </p>
        ))}
      </blockquote>
      <div className={`sj-gate-scroll-cue opener-phase${phase >= 4 + paragraphs.length - 1 ? ' opener-phase--in' : ''}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 3v14M4 11l6 6 6-6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
