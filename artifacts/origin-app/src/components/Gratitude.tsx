import Journal from './Journal';

interface Props {
  items: string[];
  keys: string[];
}

export default function Gratitude({ items, keys }: Props) {
  return (
    <div className="gratitude">
      {items.map((q, i) => (
        <div key={i} className="grat-row">
          <div className="grat-q">{q}</div>
          <Journal sceneKey={keys[i]} placeholder="" rows={2} />
        </div>
      ))}
    </div>
  );
}
