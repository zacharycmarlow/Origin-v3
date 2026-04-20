import Journal from './Journal';
import { GatherLine } from '../chapters';

interface Props {
  lines: GatherLine[];
}

export default function Gathering({ lines }: Props) {
  return (
    <div className="gather">
      {lines.map((l, i) => (
        <div key={i} className={'gather-line' + (l.fixed ? ' fixed' : '')}>
          <div className="gather-label">{l.label}</div>
          {!l.fixed && l.key && <Journal sceneKey={l.key} placeholder="" rows={2} />}
        </div>
      ))}
    </div>
  );
}
