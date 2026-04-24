import { useState } from 'react';
import { UserStore } from '../../store/userStore';

interface Props {
  id: string;
  essence: string;
  expandedContent: string;
}

export default function ChapterCodeEl({ id, essence, expandedContent }: Props) {
  const [expanded, setExpanded] = useState(false);
  const unlocked = UserStore.isCodeUnlocked(id);

  return (
    <div className="chapter-code-el">
      <div className="chapter-card-label">THE CODE —</div>
      <p className="chapter-card-essence">{essence}</p>
      <button
        className="chapter-card-toggle"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        {expanded ? 'collapse' : 'expand'}
      </button>
      {expanded && (
        <div className="chapter-card-body">
          {unlocked
            ? <p>{expandedContent}</p>
            : <p className="chapter-card-locked">Complete this chapter to unlock the full Code.</p>
          }
        </div>
      )}
    </div>
  );
}
