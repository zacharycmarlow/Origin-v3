import { useState } from 'react';
import { load, save } from '../storage';

interface Props {
  body: string;
}

export default function ShameMask({ body }: Props) {
  const [seen, setSeen] = useState<boolean>(() => !!load().shameSeen);

  return (
    <div className={'shame ' + (seen ? 'shame-seen' : '')}>
      <div className="shame-sigil">◈</div>
      <div className="shame-copy">
        <div className="shame-label">shame · the adversary</div>
        <div className="shame-body">{body}</div>
      </div>
      <button
        className="shame-btn"
        onClick={() => { save('shameSeen', true); setSeen(true); }}
      >
        <span className="label">{seen ? 'recognized' : 'I see the mask'}</span>
      </button>
    </div>
  );
}
