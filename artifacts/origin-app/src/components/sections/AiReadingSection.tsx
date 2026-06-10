import { useState, useEffect } from 'react';
import { Chapter } from '../../chapters';
import {
  getReading, saveMorpho, saveSage, extractChapterBeats,
  isChapterComplete, getAllReadings,
  MorphoReading, SageReading,
} from '../../storage';
import { fetchMorpho, fetchSage } from '../../api/readings';
import { ButterflyIcon, CompassIcon } from '../MorphoCompassIcons';

interface Props {
  chapters: Chapter[];
  chapterIdx: number;
}

export default function AiReadingSection({ chapters, chapterIdx }: Props) {
  const chapter = chapters[chapterIdx];
  const [morpho, setMorpho] = useState<MorphoReading | undefined>(() => getReading(chapterIdx).morpho);
  const [sage, setSage] = useState<SageReading | undefined>(() => getReading(chapterIdx).sage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freshlyLoaded, setFreshlyLoaded] = useState(false);

  const chapterComplete = isChapterComplete(chapter);
  const hasReading = !!(morpho || sage);

  useEffect(() => {
    const r = getReading(chapterIdx);
    setMorpho(r.morpho);
    setSage(r.sage);
  }, [chapterIdx]);

  const requestReading = async () => {
    setLoading(true);
    setError(null);
    try {
      const beats = extractChapterBeats(chapter);
      const allReadings = getAllReadings();
      const previousChapters = chapters
        .slice(0, chapterIdx)
        .map((ch, i) => ({
          chapterNumber: i + 1,
          chapterTitle: ch.title,
          beats: extractChapterBeats(ch),
          morpho: allReadings[i]?.morpho,
          sage: allReadings[i]?.sage,
        }));

      const morphoResult = await fetchMorpho({
        chapterNumber: chapterIdx + 1,
        chapterTitle: chapter.title,
        beats,
        previousChapters: previousChapters.length > 0 ? previousChapters : undefined,
      });
      saveMorpho(chapterIdx, morphoResult);
      setMorpho(morphoResult);

      const sageResult = await fetchSage({
        chapterNumber: chapterIdx + 1,
        chapterTitle: chapter.title,
        beats,
        morpho: morphoResult,
        previousChapters: previousChapters.length > 0 ? previousChapters : undefined,
      });
      saveSage(chapterIdx, sageResult);
      setSage(sageResult);
      setFreshlyLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong requesting your reading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sj-reading-section">
      <div className="sj-reading-header">
        <ButterflyIcon size={16} glowing={hasReading} />
        <CompassIcon size={16} glowing={hasReading} />
        <span className="sj-reading-label">your reading</span>
      </div>

      {!hasReading && !loading && (
        <div className="sj-reading-gate">
          {!chapterComplete ? (
            <p className="sj-reading-hint">
              Complete the scenes in this chapter to receive your reading.
            </p>
          ) : (
            <>
              <p className="sj-reading-hint">
                Your guides have been watching the thread. Request their reading when you are ready.
              </p>
              <button className="primary-btn sj-reading-request" onClick={requestReading}>
                <ButterflyIcon size={15} />
                <span className="label">receive your reading</span>
              </button>
            </>
          )}
        </div>
      )}

      {loading && (
        <div className="sj-reading-loading">
          <div className="sj-reading-dots">
            <span /><span /><span />
          </div>
          <p>your guides are reading the thread…</p>
        </div>
      )}

      {error && (
        <div className="sj-reading-error">
          <p>{error}</p>
          <button className="btn-ghost small" onClick={requestReading}>try again</button>
        </div>
      )}

      {morpho && (
        <div className={`sj-reading-card sj-reading-card--morpho${freshlyLoaded ? ' sj-reading-card--fresh' : ''}`}>
          <div className="sj-reading-guide-head">
            <ButterflyIcon size={13} glowing />
            <span>Morpho</span>
          </div>
          <p className="sj-reading-through">{morpho.throughLine}</p>
          {morpho.subtext && (
            <p className="sj-reading-subtext">{morpho.subtext}</p>
          )}
          {morpho.marginalNotes?.length > 0 && (
            <ul className="sj-reading-notes">
              {morpho.marginalNotes.map((note, i) => (
                <li key={i} className="sj-reading-note">
                  <em>{note.passage}</em> — {note.insight}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {sage && (
        <div className={`sj-reading-card sj-reading-card--sage${freshlyLoaded ? ' sj-reading-card--fresh' : ''}`}>
          <div className="sj-reading-guide-head">
            <CompassIcon size={13} glowing />
            <span>Sage</span>
          </div>
          <p className="sj-reading-resonance">{sage.resonance}</p>
          {sage.personalizedCodes?.length > 0 && (
            <div className="sj-reading-list">
              <div className="sj-reading-list-label">your codes</div>
              {sage.personalizedCodes.map((c, i) => (
                <div key={i} className="sj-reading-list-item">
                  <span className="sj-reading-list-title">{c.title}</span>
                  <span className="sj-reading-list-body">{c.body}</span>
                </div>
              ))}
            </div>
          )}
          {sage.personalizedLore?.length > 0 && (
            <div className="sj-reading-list">
              <div className="sj-reading-list-label">your lore</div>
              {sage.personalizedLore.map((l, i) => (
                <div key={i} className="sj-reading-list-item">
                  <span className="sj-reading-list-title">{l.title}</span>
                  <span className="sj-reading-list-body">{l.body}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
