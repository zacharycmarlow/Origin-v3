import { useState } from 'react';
import { Chapter } from '../chapters';
import {
  extractChapterBeats, getAllSyntheses,
  getOriginStory, saveOriginStory, OriginStory,
  isChapterComplete,
} from '../storage';
import { fetchOriginStory } from '../api/readings';

/* The final telling — all seven chapters woven into one origin story,
   spoken by the Storyteller at the fire. */

export default function OriginStoryReveal({ chapters }: { chapters: Chapter[] }) {
  const [story, setStory] = useState<OriginStory | undefined>(() => getOriginStory());
  const [telling, setTelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allComplete = chapters.every(ch => isChapterComplete(ch));

  const request = async () => {
    setTelling(true);
    setError(null);
    try {
      const syntheses = getAllSyntheses();
      const result = await fetchOriginStory({
        chapters: chapters.map((ch, i) => ({
          chapterNumber: i + 1,
          chapterTitle: ch.title,
          beats: extractChapterBeats(ch),
          synthesis: syntheses[i]
            ? { title: syntheses[i].title, story: syntheses[i].story }
            : undefined,
        })),
      });
      saveOriginStory(result);
      setStory(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The fire has gone quiet. Try again.');
    } finally {
      setTelling(false);
    }
  };

  if (!allComplete && !story) return null;

  return (
    <div className="originstory">
      {!story && !telling && (
        <div className="originstory-gate">
          <p className="prelude-body dim">
            Seven chapters written. One story waiting to be told.
          </p>
          <button className="primary-btn" onClick={request}>
            <span className="label">tell my origin story</span>
          </button>
        </div>
      )}

      {telling && (
        <div className="sj-reading-loading">
          <div className="sj-reading-dots"><span /><span /><span /></div>
          <p>the storyteller is gathering the whole thread…</p>
        </div>
      )}

      {error && (
        <div className="sj-reading-error">
          <p>{error}</p>
          <button className="btn-ghost small" onClick={request}>try again</button>
        </div>
      )}

      {story && (
        <div className="originstory-telling">
          <div className="weave-eyebrow">your origin story</div>
          <h2 className="originstory-title">{story.title}</h2>
          {story.movements.map((m, i) => (
            <section key={i} className="originstory-movement" style={{ animationDelay: `${i * 260}ms` }}>
              <div className="originstory-movement-head">
                <span className="originstory-roman">{m.movement}</span>
                <span className="originstory-heading">{m.heading}</span>
              </div>
              {m.text.split('\n\n').map((para, j) => (
                <p key={j} className="weave-para">{para}</p>
              ))}
            </section>
          ))}
          {story.dedication && <p className="originstory-dedication">{story.dedication}</p>}
          <button className="margins-again" onClick={request} disabled={telling}>
            {telling ? 'telling again…' : 'tell it again'}
          </button>
        </div>
      )}
    </div>
  );
}
