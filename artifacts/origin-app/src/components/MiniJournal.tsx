import { useMemo, useState } from 'react';
import type { Chapter } from '../chapters';
import {
  extractChapterBeats,
  isChapterComplete,
  getReading,
  saveMorpho,
  saveSage,
  save as saveKey,
  type MorphoReading,
  type SageReading,
} from '../storage';
import { fetchMorpho, fetchSage } from '../api/readings';
import { ButterflyIcon, CompassIcon } from './MorphoCompassIcons';

interface Props {
  chapters: Chapter[];
  selectedCh: number;
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

function ShimmerLine({ color = '#4ff0d6' }: { color?: string }) {
  return (
    <div className="mj-shimmer" aria-hidden="true">
      <div className="mj-shimmer-bar" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </div>
  );
}

export default function MiniJournal({ chapters, selectedCh }: Props) {
  const chapter = chapters[selectedCh];
  const accent = chapter.palette.accent;

  const [refreshTick, setRefreshTick] = useState(0);
  const beats = useMemo(() => extractChapterBeats(chapter), [chapter, refreshTick]);
  const complete = useMemo(() => isChapterComplete(chapter), [chapter, refreshTick]);
  const reading = useMemo(() => getReading(selectedCh), [selectedCh, refreshTick]);

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const [morphoLoading, setMorphoLoading] = useState(false);
  const [sageLoading, setSageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (key: string, current: string) => {
    setEditing(key);
    setDraft(current);
  };
  const saveEdit = () => {
    if (editing) {
      saveKey(editing, draft);
      setEditing(null);
      setRefreshTick(t => t + 1);
    }
  };

  const onMorpho = async () => {
    setError(null);
    setMorphoLoading(true);
    try {
      const m = await fetchMorpho({
        chapterNumber: selectedCh + 1,
        chapterTitle: chapter.title,
        beats,
        previousChapters: buildPreviousChapters(chapters, selectedCh),
      });
      saveMorpho(selectedCh, m);
      setRefreshTick(t => t + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setMorphoLoading(false);
    }
  };

  const onSage = async () => {
    if (!reading.morpho) { await onMorpho(); }
    const r = getReading(selectedCh);
    if (!r.morpho) return;
    setError(null);
    setSageLoading(true);
    try {
      const s = await fetchSage({
        chapterNumber: selectedCh + 1,
        chapterTitle: chapter.title,
        beats,
        morpho: r.morpho,
        previousChapters: buildPreviousChapters(chapters, selectedCh),
      });
      saveSage(selectedCh, s);
      setRefreshTick(t => t + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSageLoading(false);
    }
  };

  if (!complete) {
    return (
      <div className="mj-locked">
        <div className="mj-locked-eyebrow">{chapter.roman} · {chapter.title.toLowerCase()}</div>
        <div className="mj-locked-msg">
          The reading opens once every reflection in this chapter holds a response.
        </div>
        <div className="mj-locked-progress">
          {beats.filter(b => b.text.trim().length > 0).length} / {beats.length} beats written
        </div>
      </div>
    );
  }

  return (
    <div className="mj">
      <div className="mj-header">
        <div className="mj-header-meta">
          <div className="mj-eyebrow">{chapter.roman} · {chapter.title.toLowerCase()}</div>
          <div className="mj-title">A Reading</div>
        </div>
        <div className="mj-icons">
          <button
            className="mj-icon-btn"
            onClick={onMorpho}
            disabled={morphoLoading}
            title={reading.morpho ? 'regenerate Morpho' : 'receive Morpho'}
            style={{ color: '#4ff0d6' }}
          >
            <ButterflyIcon size={26} glowing={!!reading.morpho} />
          </button>
          <button
            className="mj-icon-btn"
            onClick={onSage}
            disabled={sageLoading || morphoLoading}
            title={reading.sage ? 'regenerate Sage' : 'receive Sage'}
            style={{ color: '#f5e4a1' }}
          >
            <CompassIcon size={26} glowing={!!reading.sage} />
          </button>
        </div>
      </div>

      {error && <div className="mj-error">{error}</div>}

      {/* User's writing — beats */}
      <div className="mj-section">
        <div className="mj-section-label" style={{ color: accent }}>your writing</div>
        {beats.map((beat, i) => (
          <div key={i} className="mj-beat">
            <div className="mj-beat-head">
              <div className="mj-beat-title">{beat.title}</div>
              {beat.thread && <div className="mj-beat-thread">{beat.thread}</div>}
            </div>
            {beat.storageKey && editing === beat.storageKey ? (
              <div className="mj-beat-edit">
                <textarea
                  className="mj-beat-textarea"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={Math.max(4, Math.min(14, draft.split('\n').length + 1))}
                  autoFocus
                />
                <div className="mj-beat-edit-actions">
                  <button className="btn-ghost small" onClick={() => setEditing(null)}>cancel</button>
                  <button className="btn-ghost small primary" onClick={saveEdit}>save</button>
                </div>
              </div>
            ) : (
              <div
                className="mj-beat-text"
                style={{ borderLeftColor: accent, cursor: beat.storageKey ? 'pointer' : 'default' }}
                onClick={() => beat.storageKey && startEdit(beat.storageKey, beat.text)}
                title={beat.storageKey ? 'click to edit' : undefined}
              >
                {beat.text || <span className="mj-beat-empty">[not yet written]</span>}
              </div>
            )}
            {/* Morpho marginal notes whose passage appears in this beat's text */}
            {reading.morpho?.marginalNotes
              ?.filter(n => {
                const needle = n.passage.toLowerCase().slice(0, 24);
                return needle && beat.text.toLowerCase().includes(needle);
              })
              .map((n, ni) => (
                <div className="mj-marginal" key={ni}>
                  <ButterflyIcon size={14} />
                  <div>
                    <div className="mj-marginal-passage">"{n.passage}"</div>
                    <div className="mj-marginal-insight">{n.insight}</div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Morpho through-line + subtext */}
      <div className="mj-section">
        <div className="mj-section-label mj-morpho-label">
          <ButterflyIcon size={16} />
          <span>Morpho · what is moving through</span>
        </div>
        {morphoLoading && <ShimmerLine color="#4ff0d6" />}
        {reading.morpho ? (
          <>
            <div className="mj-morpho-block">
              <div className="mj-block-label">through-line</div>
              <div className="mj-block-text">{reading.morpho.throughLine}</div>
            </div>
            <div className="mj-morpho-block">
              <div className="mj-block-label">subtext</div>
              <div className="mj-block-text">{reading.morpho.subtext}</div>
            </div>
            {reading.morpho.marginalNotes?.length > 0 && (
              <div className="mj-morpho-block">
                <div className="mj-block-label">marginalia</div>
                {reading.morpho.marginalNotes.map((n, i) => (
                  <div className="mj-marginal-card" key={i}>
                    <div className="mj-marginal-passage">"{n.passage}"</div>
                    <div className="mj-marginal-insight">{n.insight}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          !morphoLoading && (
            <div className="mj-cta">
              <div className="mj-cta-text">The butterfly waits to read what just moved through you.</div>
              <button className="btn-ghost small primary" onClick={onMorpho}>receive Morpho</button>
            </div>
          )
        )}
      </div>

      {/* Sage resonance + personalized codes/lore */}
      <div className="mj-section">
        <div className="mj-section-label mj-sage-label">
          <CompassIcon size={16} />
          <span>Sage · the personal compass</span>
        </div>
        {sageLoading && <ShimmerLine color="#f5e4a1" />}
        {reading.sage ? (
          <>
            <div className="mj-sage-block">
              <div className="mj-block-label">resonance</div>
              <div className="mj-block-text">{reading.sage.resonance}</div>
            </div>
            {reading.sage.personalizedCodes?.length > 0 && (
              <div className="mj-sage-block">
                <div className="mj-block-label">your codes</div>
                {reading.sage.personalizedCodes.map((c, i) => (
                  <div key={i} className="mj-codex-card mj-codex-code">
                    <div className="mj-codex-title">{c.title}</div>
                    {c.researcher && <div className="mj-codex-source">{c.researcher}</div>}
                    <div className="mj-codex-body">{c.body}</div>
                  </div>
                ))}
              </div>
            )}
            {reading.sage.personalizedLore?.length > 0 && (
              <div className="mj-sage-block">
                <div className="mj-block-label">your lore</div>
                {reading.sage.personalizedLore.map((l, i) => (
                  <div key={i} className="mj-codex-card mj-codex-lore">
                    <div className="mj-codex-title">{l.title}</div>
                    {l.tradition && <div className="mj-codex-source">{l.tradition}</div>}
                    <div className="mj-codex-body">{l.body}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          !sageLoading && (
            <div className="mj-cta">
              <div className="mj-cta-text">
                The compass turns toward what's yours specifically — once Morpho has read the chapter.
              </div>
              <button
                className="btn-ghost small primary"
                onClick={onSage}
                disabled={!reading.morpho}
              >
                {reading.morpho ? 'receive Sage' : 'receive Morpho first'}
              </button>
            </div>
          )
        )}
      </div>

      {reading.horizon && (
        <div className="mj-section">
          <div className="mj-section-label" style={{ color: '#9ad8c8' }}>Horizon · integration whisper</div>
          <div className="mj-horizon-text">{reading.horizon.whisper}</div>
        </div>
      )}
    </div>
  );
}
