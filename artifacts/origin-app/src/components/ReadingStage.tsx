import { useState, useEffect, useRef, useCallback } from 'react';
import type { Chapter } from '../chapters';
import {
  extractChapterBeats, isChapterComplete,
  getReading, saveMorpho, saveSage,
  type MorphoReading, type SageReading,
} from '../storage';
import { fetchMorpho, fetchSage } from '../api/readings';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';

interface Props {
  chapter: Chapter;
  chapterIdx: number;
  chapters: Chapter[];
  onCross: () => void;
  onCancel: () => void;
}

function buildPreviousChapters(chapters: Chapter[], upTo: number) {
  const prev = [];
  for (let i = 0; i < upTo; i++) {
    if (!isChapterComplete(chapters[i])) continue;
    const r = getReading(i);
    prev.push({
      chapterNumber: i + 1,
      chapterTitle: chapters[i].title,
      beats: extractChapterBeats(chapters[i]),
      morpho: r.morpho,
      sage: r.sage,
    });
  }
  return prev;
}

function Shimmer({ color = 'teal', sm = false }: { color?: 'teal' | 'gold'; sm?: boolean }) {
  return (
    <div className={'rs-shimmer' + (sm ? ' rs-shimmer--sm' : '') + (color === 'gold' ? ' rs-shimmer--gold' : '')} aria-hidden="true">
      <div className="rs-shimmer-bar" />
    </div>
  );
}

export default function ReadingStage({ chapter, chapterIdx, chapters, onCross, onCancel }: Props) {
  const beats = extractChapterBeats(chapter);
  const [morpho, setMorpho] = useState<MorphoReading | null>(() => getReading(chapterIdx).morpho || null);
  const [sage, setSage] = useState<SageReading | null>(() => getReading(chapterIdx).sage || null);
  const [morphoLoading, setMorphoLoading] = useState(false);
  const [sageLoading, setSageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);
  const [visible, setVisible] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const t = setTimeout(() => setVisible(true), 16);
    return () => {
      mountedRef.current = false;
      clearTimeout(t);
    };
  }, []);

  const doFetchMorpho = useCallback(async (): Promise<MorphoReading | null> => {
    const existing = getReading(chapterIdx).morpho;
    if (existing) {
      if (mountedRef.current) setMorpho(existing);
      return existing;
    }
    if (mountedRef.current) { setMorphoLoading(true); setError(null); }
    try {
      const m = await fetchMorpho({
        chapterNumber: chapterIdx + 1,
        chapterTitle: chapter.title,
        beats,
        previousChapters: buildPreviousChapters(chapters, chapterIdx),
      });
      saveMorpho(chapterIdx, m);
      if (mountedRef.current) setMorpho(m);
      return m;
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      if (mountedRef.current) setMorphoLoading(false);
    }
  }, [chapterIdx, chapter, beats, chapters]); // eslint-disable-line

  const doFetchSage = useCallback(async (morphoData: MorphoReading) => {
    const existingSage = getReading(chapterIdx).sage;
    if (existingSage) {
      if (mountedRef.current) setSage(existingSage);
      return;
    }
    if (mountedRef.current) { setSageLoading(true); setError(null); }
    try {
      const s = await fetchSage({
        chapterNumber: chapterIdx + 1,
        chapterTitle: chapter.title,
        beats,
        morpho: morphoData,
        previousChapters: buildPreviousChapters(chapters, chapterIdx),
      });
      saveSage(chapterIdx, s);
      if (mountedRef.current) setSage(s);
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (mountedRef.current) setSageLoading(false);
    }
  }, [chapterIdx, chapter, beats, chapters]); // eslint-disable-line

  useEffect(() => {
    const run = async () => {
      const m = await doFetchMorpho();
      if (m && mountedRef.current) await doFetchSage(m);
    };
    run();
  }, []); // eslint-disable-line

  const onPressStart = useCallback(() => {
    if (!morpho && !error) return;
    setPressing(true);
    pressTimerRef.current = setTimeout(() => {
      setPressing(false);
      onCross();
    }, 2000);
  }, [morpho, error, onCross]);

  const onPressEnd = useCallback(() => {
    setPressing(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  }, []);

  const canCross = !!morpho || !!error;

  return (
    <div className={'rs-backdrop' + (visible ? ' rs-backdrop--visible' : '')}>
      <div className="rs-panel">
        <div className="rs-topbar">
          <div className="rs-header-meta">
            <span className="rs-eyebrow">{chapter.roman} · {chapter.title.toLowerCase()}</span>
            <span className="rs-title">threshold reading</span>
          </div>
          <button className="rs-skip-btn" onClick={onCancel} aria-label="Skip reading">
            skip
          </button>
        </div>

        <div className="rs-scroll">
          <section className="rs-section">
            <div className="rs-section-label">your words</div>
            <div className="rs-beats">
              {beats.map((beat, i) => (
                <div key={i} className="rs-beat">
                  <div className="rs-beat-title">{beat.title}</div>
                  {beat.text ? (
                    <blockquote className="rs-beat-text">{beat.text}</blockquote>
                  ) : (
                    <p className="rs-beat-empty">[no response written]</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="rs-divider" />

          <section className="rs-section">
            <div className="rs-section-label rs-morpho-label">
              <ButterflyIcon size={15} glowing={!!morpho} />
              <span>Morpho · what moved through</span>
            </div>
            {morphoLoading && (
              <div className="rs-loading">
                <Shimmer color="teal" />
                <Shimmer color="teal" sm />
                <Shimmer color="teal" sm />
              </div>
            )}
            {morpho && (
              <div className="rs-reading-content">
                <div className="rs-block">
                  <div className="rs-block-label">through-line</div>
                  <div className="rs-block-text">{morpho.throughLine}</div>
                </div>
                <div className="rs-block">
                  <div className="rs-block-label">subtext</div>
                  <div className="rs-block-text">{morpho.subtext}</div>
                </div>
                {morpho.marginalNotes?.length > 0 && (
                  <div className="rs-block">
                    <div className="rs-block-label">marginalia</div>
                    {morpho.marginalNotes.map((n, i) => (
                      <div key={i} className="rs-marginal">
                        <div className="rs-marginal-passage">"{n.passage}"</div>
                        <div className="rs-marginal-insight">{n.insight}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="rs-divider" />

          <section className="rs-section">
            <div className="rs-section-label rs-sage-label">
              <CompassIcon size={15} glowing={!!sage} />
              <span>Sage · what is yours specifically</span>
            </div>
            {sageLoading && (
              <div className="rs-loading">
                <Shimmer color="gold" />
                <Shimmer color="gold" sm />
                <Shimmer color="gold" sm />
              </div>
            )}
            {sage && (
              <div className="rs-reading-content">
                <div className="rs-block">
                  <div className="rs-block-label">resonance</div>
                  <div className="rs-block-text">{sage.resonance}</div>
                </div>
                {sage.personalizedCodes?.length > 0 && (
                  <div className="rs-block">
                    <div className="rs-block-label">your codes</div>
                    {sage.personalizedCodes.map((c, i) => (
                      <div key={i} className="rs-codex-card rs-codex-card--code">
                        <div className="rs-codex-title">{c.title}</div>
                        <div className="rs-codex-body">{c.body}</div>
                      </div>
                    ))}
                  </div>
                )}
                {sage.personalizedLore?.length > 0 && (
                  <div className="rs-block">
                    <div className="rs-block-label">your lore</div>
                    {sage.personalizedLore.map((l, i) => (
                      <div key={i} className="rs-codex-card rs-codex-card--lore">
                        <div className="rs-codex-title">{l.title}</div>
                        <div className="rs-codex-body">{l.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!sageLoading && !sage && !morphoLoading && morpho && (
              <p className="rs-sage-pending">preparing your personal reading…</p>
            )}
          </section>

          {error && (
            <div className="rs-error" role="alert">
              <span>{error}</span>
              <button className="rs-error-dismiss" onClick={() => setError(null)}>×</button>
            </div>
          )}

          <div className="rs-footer-pad" />
        </div>

        <div className="rs-footer">
          <button
            className={'rs-cross-btn' + (pressing ? ' pressing' : '') + (!canCross ? ' rs-cross-btn--waiting' : '')}
            onMouseDown={canCross ? onPressStart : undefined}
            onMouseUp={onPressEnd}
            onMouseLeave={onPressEnd}
            onTouchStart={canCross ? (e) => { e.preventDefault(); onPressStart(); } : undefined}
            onTouchEnd={onPressEnd}
            onTouchCancel={onPressEnd}
            aria-label="Hold to cross the threshold"
          >
            <div className="rs-cross-fill" />
            <span className="rs-cross-label">
              {!canCross
                ? (morphoLoading ? 'reading…' : 'preparing…')
                : 'hold to cross the threshold'}
            </span>
            {canCross && (
              <svg width="13" height="9" viewBox="0 0 14 10" aria-hidden="true">
                <line x1="0" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1" />
                <polyline points="9,1 13,5 9,9" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
