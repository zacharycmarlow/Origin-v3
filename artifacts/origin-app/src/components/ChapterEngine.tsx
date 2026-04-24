import { useState, useCallback } from 'react';
import type { ChapterDef, ChapterElement } from '../content/types';
import { UserStore } from '../store/userStore';
import PromptEl from './elements/PromptEl';
import ThresholdEl from './elements/ThresholdEl';
import GatherEl from './elements/GatherEl';
import ChapterCodeEl from './elements/ChapterCodeEl';
import ChapterLoreEl from './elements/ChapterLoreEl';
import StepInsightEl from './elements/StepInsightEl';
import BreathVisualization from './BreathVisualization';

interface Props {
  chapter: ChapterDef;
  chapterIdx: number;
  totalChapters: number;
  onComplete: () => void;
  completed: boolean;
}

function ElementRenderer({
  el,
  onAnswer,
  onBreathComplete,
  unlockedInsights,
}: {
  el: ChapterElement;
  onAnswer: (id: string) => void;
  onBreathComplete: (id: string) => void;
  unlockedInsights: Set<string>;
}) {
  switch (el.type) {
    case 'sectionLabel':
      return <div className="section-label">{el.text}</div>;

    case 'body':
      return <p className="chapter-body">{el.text}</p>;

    case 'bodyItalic':
      return <p className="chapter-body chapter-body--italic">{el.text}</p>;

    case 'centerText':
      return (
        <div className="center-text">
          {el.text.split('\n\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      );

    case 'rule':
      return <hr className="chapter-rule" />;

    case 'somatic':
      return <p className="chapter-somatic">{el.text}</p>;

    case 'chapterCode':
      return <ChapterCodeEl id={el.id} essence={el.essence} expandedContent={el.expandedContent} />;

    case 'chapterLore':
      return <ChapterLoreEl id={el.id} essence={el.essence} expandedContent={el.expandedContent} />;

    case 'stepInsight':
      return (
        <StepInsightEl
          id={el.id}
          unlocked={unlockedInsights.has(el.id)}
          codeEssence={el.codeEssence}
          loreEssence={el.loreEssence}
        />
      );

    case 'breath':
      return (
        <BreathVisualization
          id={el.id}
          pattern={el.pattern}
          duration={el.duration}
          label={el.label}
          onComplete={() => onBreathComplete(el.id)}
        />
      );

    case 'prompt':
      return (
        <PromptEl
          id={el.id}
          text={el.text}
          rows={el.rows}
          big={el.big}
          onAnswer={onAnswer}
        />
      );

    case 'threshold':
      return (
        <ThresholdEl
          text={el.text}
          promptId={el.promptId}
          promptPlaceholder={el.promptPlaceholder}
          promptRows={el.promptRows}
          promptBig={el.promptBig}
        />
      );

    case 'gather':
      return <GatherEl lines={el.lines} />;

    default:
      return null;
  }
}

export default function ChapterEngine({ chapter, chapterIdx, totalChapters, onComplete, completed }: Props) {
  const [unlockedInsights, setUnlockedInsights] = useState<Set<string>>(() => {
    const data = UserStore.getData();
    return new Set(data.unlockedStepInsights);
  });

  const unlockInsightFor = useCallback((triggerId: string) => {
    const els = chapter.elements;
    for (const el of els) {
      if (el.type === 'stepInsight' && el.unlocksAfter === triggerId) {
        UserStore.unlockInsight(el.id);
        setUnlockedInsights(prev => new Set([...prev, el.id]));
      }
    }
  }, [chapter.elements]);

  const onAnswer = useCallback((promptId: string) => {
    unlockInsightFor(promptId);
  }, [unlockInsightFor]);

  const onBreathComplete = useCallback((breathId: string) => {
    unlockInsightFor(breathId);
  }, [unlockInsightFor]);

  const handleComplete = () => {
    const codeEl = chapter.elements.find(e => e.type === 'chapterCode');
    const loreEl = chapter.elements.find(e => e.type === 'chapterLore');
    const codeId = codeEl?.type === 'chapterCode' ? codeEl.id : '';
    const loreId = loreEl?.type === 'chapterLore' ? loreEl.id : '';
    UserStore.completeChapter(chapter.id, codeId, loreId);

    const allInsights = chapter.elements
      .filter(e => e.type === 'stepInsight')
      .map(e => e.type === 'stepInsight' ? e.id : '');
    allInsights.forEach(id => { UserStore.unlockInsight(id); });
    setUnlockedInsights(new Set([...unlockedInsights, ...allInsights]));

    onComplete();
  };

  return (
    <article className="chapter-engine">
      <header className="chapter-engine-header">
        <div className="chapter-engine-meta">
          <span>chapter {String(chapterIdx + 1).padStart(2, '0')} of {String(totalChapters).padStart(2, '0')}</span>
        </div>
        <div className="chapter-engine-roman">{chapter.number}</div>
        <h1 className="chapter-engine-title">{chapter.title}</h1>
        <p className="chapter-engine-epigraph">{chapter.subtitle}</p>
        <blockquote className="chapter-engine-epigraph-quote">{chapter.epigraph}</blockquote>
      </header>

      <div className="chapter-engine-body">
        {chapter.elements.map((el, i) => (
          <div key={i} className={'chapter-el chapter-el--' + el.type}>
            <ElementRenderer
              el={el}
              onAnswer={onAnswer}
              onBreathComplete={onBreathComplete}
              unlockedInsights={unlockedInsights}
            />
          </div>
        ))}
      </div>

      <footer className="chapter-engine-footer">
        {completed ? (
          <div className="chapter-complete-notice">
            <span>Chapter complete. Continue below or return any time.</span>
            <button className="save-continue-btn save-continue-btn--completed" onClick={onComplete}>
              Next chapter →
            </button>
          </div>
        ) : (
          <button className="save-continue-btn" onClick={handleComplete}>
            Save &amp; continue
          </button>
        )}
      </footer>
    </article>
  );
}
