import { useEffect, useState } from 'react';
import { Chapter } from '../../chapters';
import { RegisterPara, HERO_SIGIL, WEIGHT_SIGIL } from '../Registers';
import { isChapterDayOpen } from '../../storage';

interface Props {
  chapter: Chapter;
  chapterIdx: number;
  total: number;
  locked?: boolean;
}

export default function ChapterGate({ chapter, chapterIdx, total, locked }: Props) {
  const paragraphs = chapter.invocation.split('\n\n');
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (locked) return;
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

  if (locked) {
    return (
      <div className="sj-gate-inner sj-gate-inner--locked">
        <div className="opener-meta">
          <span>chapter {String(chapterIdx + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}</span>
          <span className="opener-rule" />
          <span>territory · {chapter.title.toLowerCase()}</span>
        </div>
        <div className="opener-roman opener-roman--locked">{chapter.roman}</div>
        <h2 className="opener-title opener-title--locked">{chapter.title}</h2>
        <div className="opener-sub opener-sub--locked">{chapter.subtitle}</div>
        <div className="sj-gate-lock">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="4" y="9" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>coming soon</span>
        </div>
      </div>
    );
  }

  /* The bookends of the descent: Chapter I opens as cinema, VII as fire */
  const flavor = chapterIdx === 0 ? ' sj-gate-inner--film' : chapterIdx === 6 ? ' sj-gate-inner--fire' : '';

  /* One day, one chapter: in daily pace, tomorrow's chapter waits for tomorrow. */
  if (!isChapterDayOpen(chapterIdx)) {
    return (
      <div className={`sj-gate-inner sj-gate-inner--daylocked${flavor}`}>
        <div className="opener-meta">
          <span>chapter {String(chapterIdx + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}</span>
          <span className="opener-rule" />
          <span>territory · {chapter.title.toLowerCase()}</span>
        </div>
        <div className="opener-roman opener-roman--locked">{chapter.roman}</div>
        <h2 className="opener-title opener-title--locked">{chapter.title}</h2>
        <div className="opener-sub opener-sub--locked">{chapter.subtitle}</div>
        <div className="daylock">
          <span className="daylock-mark" aria-hidden="true">☾</span>
          <span>this chapter opens with tomorrow's sun</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`sj-gate-inner${flavor}`}>
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
        {(() => {
          const firstBodyIdx = paragraphs.findIndex(
            p => !p.startsWith(HERO_SIGIL) && !p.startsWith(WEIGHT_SIGIL),
          );
          return paragraphs.map((para, i) => {
            const phased = `opener-invocation-para opener-phase${phase >= 4 + i ? ' opener-phase--in' : ''}`;
            const delay = { transitionDelay: `${i * 40}ms` };
            if (para.startsWith(HERO_SIGIL) || para.startsWith(WEIGHT_SIGIL)) {
              return (
                <div key={i} className={phased} style={delay}>
                  <RegisterPara text={para} />
                </div>
              );
            }
            return (
              <p
                key={i}
                className={`${phased}${i === firstBodyIdx ? ' invocation-dropcap' : ''}`}
                style={delay}
              >
                {para}
              </p>
            );
          });
        })()}
      </blockquote>
      <div className={`sj-gate-scroll-cue opener-phase${phase >= 4 + paragraphs.length - 1 ? ' opener-phase--in' : ''}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 3v14M4 11l6 6 6-6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
