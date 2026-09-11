import { useState, useEffect } from 'react';
import { Chapter } from '../../chapters';
import {
  getReading, saveMorpho, saveSage, extractChapterBeats,
  isChapterComplete, getAllReadings,
  MorphoReading, SageReading,
  getSynthesis, saveSynthesis, getAllSyntheses, ChapterSynthesis,
} from '../../storage';
import { fetchMorpho, fetchSage, fetchSynthesis } from '../../api/readings';
import { ButterflyIcon, CompassIcon } from '../MorphoCompassIcons';

interface Props {
  chapters: Chapter[];
  chapterIdx: number;
  onShare?: (text: string, title?: string, eyebrow?: string) => void;
}

/* ── Word-by-word reveal hook ──────────────────────────────── */
function useWordReveal(text: string | undefined, active: boolean, delayMs = 80) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!active || !text) return;
    setRevealed(0);
    const words = text.split(/\s+/);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setRevealed(idx);
      if (idx >= words.length) clearInterval(interval);
    }, delayMs);
    return () => clearInterval(interval);
  }, [text, active]); // eslint-disable-line

  if (!active || !text) return text || '';
  const words = text.split(/\s+/);
  return words.slice(0, revealed).join(' ');
}

/* ── Reading card text renderer with optional reveal ─────── */
function RevealText({ text, active, delay = 80 }: { text: string; active: boolean; delay?: number }) {
  const revealed = useWordReveal(text, active, delay);
  return <>{revealed}</>;
}

export default function AiReadingSection({ chapters, chapterIdx, onShare }: Props) {
  const chapter = chapters[chapterIdx];
  const [morpho, setMorpho] = useState<MorphoReading | undefined>(() => getReading(chapterIdx).morpho);
  const [sage, setSage] = useState<SageReading | undefined>(() => getReading(chapterIdx).sage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freshlyLoaded, setFreshlyLoaded] = useState(false);
  const [synthesis, setSynthesis] = useState<ChapterSynthesis | undefined>(() => getSynthesis(chapterIdx));
  const [weaving, setWeaving] = useState(false);
  const [weaveError, setWeaveError] = useState<string | null>(null);
  const [synthesisFresh, setSynthesisFresh] = useState(false);

  const chapterComplete = isChapterComplete(chapter);
  const hasReading = !!(morpho || sage);

  useEffect(() => {
    const r = getReading(chapterIdx);
    setMorpho(r.morpho);
    setSage(r.sage);
    setFreshlyLoaded(false);
    setSynthesis(getSynthesis(chapterIdx));
    setSynthesisFresh(false);
  }, [chapterIdx]);

  const requestSynthesis = async () => {
    setWeaving(true);
    setWeaveError(null);
    try {
      const beats = extractChapterBeats(chapter);
      const all = getAllSyntheses();
      const previousSyntheses = Object.entries(all)
        .map(([k, s]) => ({ chapterNumber: Number(k) + 1, title: s.title, story: s.story }))
        .filter(p => p.chapterNumber <= chapterIdx)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);

      const result = await fetchSynthesis({
        chapterNumber: chapterIdx + 1,
        chapterTitle: chapter.title,
        beats,
        morpho: getReading(chapterIdx).morpho,
        previousSyntheses: previousSyntheses.length > 0 ? previousSyntheses : undefined,
      });
      saveSynthesis(chapterIdx, result);
      setSynthesis(result);
      setSynthesisFresh(true);
    } catch (e) {
      setWeaveError(e instanceof Error ? e.message : 'The Storyteller is silent right now.');
    } finally {
      setWeaving(false);
    }
  };

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
            {onShare && morpho.throughLine && (
              <button
                className="reading-share-btn"
                onClick={() => onShare(morpho.throughLine, `Morpho · ${chapter.title}`, `${chapter.roman} · ${chapter.title}`)}
                title="Share this reading"
                aria-label="Share this reading"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="6" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="14" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="14" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="9" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="11" x2="12" y2="14" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            )}
          </div>
          <p className="sj-reading-through">
            <RevealText text={morpho.throughLine} active={freshlyLoaded} delay={75} />
          </p>
          {morpho.subtext && (
            <p className="sj-reading-subtext">
              <RevealText text={morpho.subtext} active={freshlyLoaded} delay={55} />
            </p>
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
            {onShare && sage.resonance && (
              <button
                className="reading-share-btn"
                onClick={() => onShare(sage.resonance, `Sage · ${chapter.title}`, `${chapter.roman} · ${chapter.title}`)}
                title="Share this reading"
                aria-label="Share this reading"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="6" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="14" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="14" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="9" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="11" x2="12" y2="14" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            )}
          </div>
          <p className="sj-reading-resonance">
            <RevealText text={sage.resonance} active={freshlyLoaded} delay={65} />
          </p>
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

      {/* ── The Storyteller — this chapter, woven whole ── */}
      {chapterComplete && (
        <div className="weave">
          {!synthesis && !weaving && (
            <div className="weave-gate">
              <p className="sj-reading-hint">
                The Storyteller can weave what you wrote in this chapter into one telling.
              </p>
              <button className="primary-btn weave-request" onClick={requestSynthesis}>
                <span className="label">weave this chapter</span>
              </button>
            </div>
          )}
          {weaving && (
            <div className="sj-reading-loading">
              <div className="sj-reading-dots"><span /><span /><span /></div>
              <p>the storyteller is weaving…</p>
            </div>
          )}
          {weaveError && (
            <div className="sj-reading-error">
              <p>{weaveError}</p>
              <button className="btn-ghost small" onClick={requestSynthesis}>try again</button>
            </div>
          )}
          {synthesis && (
            <div className={`weave-story${synthesisFresh ? ' weave-story--fresh' : ''}`}>
              <div className="weave-eyebrow">the storyteller</div>
              <h3 className="weave-title">{synthesis.title}</h3>
              {synthesis.story.split('\n\n').map((para, i) => (
                <p key={i} className="weave-para">{para}</p>
              ))}
              {synthesis.closing && <p className="weave-closing">{synthesis.closing}</p>}
              <div className="weave-actions">
                <button className="margins-again" onClick={requestSynthesis} disabled={weaving}>
                  {weaving ? 'weaving again…' : 'weave again'}
                </button>
                {onShare && (
                  <button
                    className="weave-share-btn"
                    onClick={() => onShare(synthesis.story, synthesis.title, `The Storyteller · ${chapter.title}`)}
                    title="Share this telling"
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <circle cx="6" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="14" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="14" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="8" y1="9" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="8" y1="11" x2="12" y2="14" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <span>share this telling</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
