import { useState } from 'react';
import { getBirthData, saveBirthData, getPace, setPace, Pace } from '../storage';

/* The quiet intake between the opening and the road. Never named as anything
   but what it is to the user: coordinates of their beginning, so the telling
   can know them. The archetype work happens elsewhere, invisibly. */

export default function BirthGate() {
  const existing = getBirthData();
  const [date, setDate] = useState(existing?.date || '');
  const [time, setTime] = useState(existing?.time || '');
  const [place, setPlace] = useState(existing?.place || '');
  const [saved, setSaved] = useState(!!existing);
  const [pace, setPaceState] = useState<Pace>(() => getPace());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    saveBirthData({ date, time: time || undefined, place: place || undefined, savedAt: Date.now() });
    setSaved(true);
  };

  const choosePace = (p: Pace) => {
    setPace(p);
    setPaceState(p);
  };

  return (
    <div className="birthgate">
      <div className="prelude-rule" />
      <p className="prelude-note-heading">Before the road</p>

      {!saved ? (
        <form className="birthgate-form" onSubmit={submit}>
          <p className="birthgate-lead">
            The telling is shaped to the one being told. Leave the coordinates
            of your beginning — the story will know you better for it.
          </p>
          <div className="birthgate-fields">
            <label className="birthgate-field">
              <span>the day you arrived</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </label>
            <label className="birthgate-field">
              <span>the hour, if you know it</span>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </label>
            <label className="birthgate-field">
              <span>the place</span>
              <input type="text" placeholder="city, country" value={place} onChange={e => setPlace(e.target.value)} />
            </label>
          </div>
          <button type="submit" className="btn-ghost birthgate-save" disabled={!date}>
            <span className="label">keep these</span>
          </button>
        </form>
      ) : (
        <p className="birthgate-kept">Your beginning is kept. The telling will know you.</p>
      )}

      <div className="pace-choice">
        <p className="birthgate-lead">Choose your pace.</p>
        <div className="pace-options">
          <button
            className={`pace-option${pace === 'free' ? ' on' : ''}`}
            onClick={() => choosePace('free')}
            type="button"
          >
            <span className="pace-name">the open road</span>
            <span className="pace-desc">move as fast or slow as you wish</span>
          </button>
          <button
            className={`pace-option${pace === 'daily' ? ' on' : ''}`}
            onClick={() => choosePace('daily')}
            type="button"
          >
            <span className="pace-name">one day, one chapter</span>
            <span className="pace-desc">each chapter opens the day after the last</span>
          </button>
        </div>
      </div>
    </div>
  );
}
