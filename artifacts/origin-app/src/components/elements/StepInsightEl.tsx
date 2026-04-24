import { useState } from 'react';

interface Props {
  id: string;
  unlocked: boolean;
  codeEssence: string;
  loreEssence: string;
}

export default function StepInsightEl({ unlocked, codeEssence, loreEssence }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!unlocked) return null;

  return (
    <div className="step-insight-el step-insight-el--unlocked">
      <div className="step-insight-inner">
        <div className="step-insight-row">
          <span className="step-insight-tag">Code</span>
          <span className="step-insight-text">{codeEssence}</span>
        </div>
        <div className="step-insight-row">
          <span className="step-insight-tag">Lore</span>
          <span className="step-insight-text">{loreEssence}</span>
        </div>
        <button
          className="chapter-card-toggle"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          {expanded ? 'collapse' : 'learn more'}
        </button>
        {expanded && (
          <p className="chapter-card-locked" style={{ marginTop: '0.75rem' }}>
            Rich content coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
