import { useState } from 'react';
import { load, getMargins, saveMargins, PageMargins } from '../storage';
import { fetchMargins } from '../api/readings';
import { ButterflyIcon } from './MorphoCompassIcons';

/* The submit ceremony. The writer offers the page; Morpho reads it and
   writes back in the margins — teal, glowing, bleeding in beside their
   own words. Gold is the sacred text; teal is the intelligence reading you. */

interface Props {
  sceneKey: string;
  chapterIdx: number;
  chapterTitle: string;
  movementTitle: string;
  question?: string;
}

export default function MarginNotes({
  sceneKey, chapterIdx, chapterTitle, movementTitle, question,
}: Props) {
  const [margins, setMargins] = useState<PageMargins | undefined>(() => getMargins(sceneKey));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readText = (): string => {
    const v = load()[sceneKey];
    return typeof v === 'string' ? v.trim() : '';
  };

  const submit = async () => {
    const text = readText();
    if (!text || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await fetchMargins({
        chapterNumber: chapterIdx + 1,
        chapterTitle,
        movementTitle,
        question,
        text,
      });
      saveMargins(sceneKey, result);
      setMargins(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The margins are unreachable right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasText = readText().length > 0;

  return (
    <div className="margins">
      {!margins && (
        <div className="margins-offer">
          <button
            className="margins-submit"
            onClick={submit}
            disabled={!hasText || submitting}
            title={hasText ? 'Morpho reads this page and turns it into story' : 'Write first — then turn it into story'}
          >
            <ButterflyIcon size={15} glowing={submitting} />
            <span>{submitting ? 'turning your page into story…' : 'turn this into story'}</span>
          </button>
          {error && <div className="margins-error">{error}</div>}
        </div>
      )}

      {margins && (
        <div className="margins-notes" aria-label="Morpho's margin notes">
          <div className="margins-head">
            <ButterflyIcon size={13} glowing />
            <span>in the margins</span>
          </div>
          {margins.marginalNotes.map((n, i) => (
            <div
              key={i}
              className="margin-note"
              style={{ animationDelay: `${i * 420}ms` }}
            >
              <div className="margin-note-passage">“{n.passage}”</div>
              <div className="margin-note-insight">{n.insight}</div>
            </div>
          ))}
          {margins.invitation && (
            <div
              className="margin-invitation"
              style={{ animationDelay: `${margins.marginalNotes.length * 420}ms` }}
            >
              {margins.invitation}
            </div>
          )}
          <button className="margins-again" onClick={submit} disabled={submitting}>
            {submitting ? 'turning it into story…' : 'turn it into story again'}
          </button>
          {error && <div className="margins-error">{error}</div>}
        </div>
      )}
    </div>
  );
}
