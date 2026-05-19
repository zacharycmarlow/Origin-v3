import { useEffect, useState, useRef } from 'react';
import { Scene as SceneType } from '../chapters';
import BreathPacer from './BreathPacer';
import Journal from './Journal';
import VoicesList from './VoicesList';
import Declarations from './Declarations';
import Gratitude from './Gratitude';
import Gathering from './Gathering';
import MoveTimer from './MoveTimer';
import Broadcast from './Broadcast';
import { unlockArchive, isArchiveUnlocked } from '../storage';

interface Props {
  scene: SceneType;
  idx: number;
  total: number;
  chapterIdx: number;
}

// Kinds that show everything at once (no progressive reveal)
const SIMPLE_KINDS = new Set([
  'arrive', 'breath', 'reflection', 'outside', 'movement', 'embody', 'finale'
]);

function useSceneReveal(scene: SceneType) {
  const [phase, setPhase] = useState(0);
  const isSimple = SIMPLE_KINDS.has(scene.kind);
  const advanceRef = useRef<() => void>(() => {});

  useEffect(() => {
    setPhase(0);
    if (isSimple) return;

    const words = ((scene.body || '') + ' ' + (scene.label || '')).trim().split(/\s+/).length;
    // Reading time: 240ms/word, min 1.6s, max 3.5s
    const readMs = Math.max(1600, Math.min(3500, words * 240));

    const t1 = setTimeout(() => setPhase(1), readMs);
    return () => clearTimeout(t1);
  }, [scene.kind, scene.key, isSimple]); // eslint-disable-line

  useEffect(() => {
    if (phase !== 1) return;
    const t = setTimeout(() => setPhase(2), 700);
    return () => clearTimeout(t);
  }, [phase]);

  const advance = () => setPhase(p => Math.min(p + 1, 99));
  advanceRef.current = advance;

  return {
    phase: isSimple ? 99 : phase,
    advance,
    isSimple,
  };
}

function Chevron({ dir }: { dir: 'down' | 'up' }) {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <polyline
        points={dir === 'down' ? '1,1 5,5 9,1' : '1,5 5,1 9,5'}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UnlockableInline({
  kind, chapterIdx, title, body,
}: { kind: 'code' | 'lore'; chapterIdx: number; title: string; body: string }) {
  const initiallyUnlocked = isArchiveUnlocked(chapterIdx, kind, title);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !open;
    setOpen(next);
    if (next && !unlocked) {
      unlockArchive(chapterIdx, kind, title);
      setUnlocked(true);
      setJustUnlocked(true);
      window.setTimeout(() => setJustUnlocked(false), 2400);
    }
  };

  const klass = kind === 'code' ? 'inline-code' : 'inline-lore';
  const sigil = kind === 'code' ? '◇' : '❋';
  const label = kind === 'code' ? 'Code' : 'Lore';
  const verb = kind === 'code' ? 'open' : 'enter';

  return (
    <div
      className={
        `${klass}-card` +
        (open ? ` ${klass}-card--open` : '') +
        (unlocked ? ` ${klass}-card--unlocked` : '') +
        (justUnlocked ? ` ${klass}-card--just-unlocked` : '')
      }
    >
      {justUnlocked && <span className="archive-unlock-flash" aria-hidden="true" />}
      <div className={`${klass}-head`}>
        <span className={`${klass}-label`}>{label}</span>
        {unlocked && (
          <span className={`${klass}-archived`} title="Saved to your Archive">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M2 5.5L4.5 8L9 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>archived</span>
          </span>
        )}
        <span className={`${klass}-num`} aria-hidden="true">{sigil}</span>
      </div>
      <div className={`${klass}-essence`}>{title}</div>
      {open && (
        <div className={`${klass}-body`}>
          {body.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}
      <button
        type="button"
        className={`${klass}-toggle`}
        onClick={handleToggle}
        aria-expanded={open}
      >
        <Chevron dir={open ? 'up' : 'down'} />
        <span>{open ? 'collapse' : (unlocked ? `re-${verb}` : verb)}</span>
      </button>
    </div>
  );
}

function ExpandableCode(props: { title: string; body: string; chapterIdx: number }) {
  return <UnlockableInline kind="code" {...props} />;
}
function ExpandableLore(props: { title: string; body: string; chapterIdx: number }) {
  return <UnlockableInline kind="lore" {...props} />;
}

export default function Scene({ scene, chapterIdx }: Props) {
  const { phase, advance } = useSceneReveal(scene);

  const showInteraction = phase >= 1;
  const showAfter = phase >= 2;

  return (
    <div className="scene" onClick={(e) => {
      // Tap anywhere in the lower area of the scene to advance phase early
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.tagName === 'BUTTON';
      if (!isInput && phase < 1) advance();
    }}>

      {/* ── Context: always visible, materialises on mount ── */}
      <div className="scene-context scene-materialize">
        {scene.title && <h3 className="scene-title">{scene.title}</h3>}
        {scene.subtitle && <div className="scene-subtitle">{scene.subtitle}</div>}
        {scene.label && <div className="scene-label">{scene.label}</div>}

        {scene.body && (
          scene.body.includes('\n\n') ? (
            <div className="scene-body scene-body--multi">
              {scene.body.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
            </div>
          ) : (
            <p className="scene-body">{scene.body}</p>
          )
        )}

        {scene.code && <ExpandableCode title={scene.code.title} body={scene.code.body} chapterIdx={chapterIdx} />}

        {scene.middle && (
          scene.middle.includes('\n\n') ? (
            <div className="scene-middle">
              {scene.middle.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
            </div>
          ) : (
            <p className="scene-middle">{scene.middle}</p>
          )
        )}

        {scene.lore && <ExpandableLore title={scene.lore.title} body={scene.lore.body} chapterIdx={chapterIdx} />}

        {scene.closing && <p className="scene-closing">{scene.closing}</p>}

        {scene.kind === 'breath' && scene.breath && (
          <BreathPacer cycles={scene.breath.cycles} />
        )}
        {scene.kind === 'reflection' && <div className="reflection-mark">◦</div>}
        {scene.kind === 'outside' && (
          <div className="outside-card">
            <div className="outside-glyph">
              <svg viewBox="0 0 60 60" width="60" height="60">
                <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth=".8" />
                <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth=".4" opacity=".5" />
                <line x1="30" y1="4" x2="30" y2="14" stroke="currentColor" strokeWidth=".6" />
                <line x1="30" y1="46" x2="30" y2="56" stroke="currentColor" strokeWidth=".6" />
                <line x1="4" y1="30" x2="14" y2="30" stroke="currentColor" strokeWidth=".6" />
                <line x1="46" y1="30" x2="56" y2="30" stroke="currentColor" strokeWidth=".6" />
              </svg>
            </div>
            <div className="outside-note">put the screen down · return when the sky has answered</div>
          </div>
        )}
        {(scene.kind === 'movement' || scene.kind === 'embody') && (
          <MoveTimer seconds={scene.seconds || 30} />
        )}
        {scene.kind === 'finale' && (
          <div className="finale">
            <div className="finale-mark">∎</div>
            <div className="finale-words">the end.</div>
            <div className="finale-sub">the beginning of chapter one.</div>
          </div>
        )}
      </div>

      {/* ── Continue cue: appears before interaction reveals ── */}
      {phase === 0 && !SIMPLE_KINDS.has(scene.kind) && (
        <button className="scene-continue-cue" onClick={advance} aria-label="Continue">
          <span className="cue-dot" />
        </button>
      )}

      {/* ── Practice: interaction slides up ── */}
      {showInteraction && (
        <div className={`scene-practice ${phase === 1 ? 'scene-practice--entering' : 'scene-practice--visible'}`}>
          {scene.kind === 'prompt' && scene.key && (
            <Journal sceneKey={scene.key} placeholder="" rows={scene.rows || 4} />
          )}
          {scene.kind === 'threshold' && (
            <div className="threshold">
              <div className="threshold-rule" />
              {scene.prompt && (
                <Journal
                  sceneKey={scene.prompt.key}
                  placeholder={scene.prompt.placeholder}
                  rows={scene.prompt.rows}
                  big={scene.prompt.big}
                />
              )}
            </div>
          )}
          {scene.kind === 'voices' && scene.key && <VoicesList sceneKey={scene.key} />}
          {scene.kind === 'gratitude' && scene.items && scene.keys && (
            <Gratitude items={scene.items} keys={scene.keys} />
          )}
          {scene.kind === 'declaration' && scene.keys && <Declarations keys={scene.keys} />}
          {scene.kind === 'gathering' && scene.lines && <Gathering lines={scene.lines} />}
          {scene.kind === 'broadcast' && scene.key && (
            <Broadcast sceneKey={scene.key} minutes={scene.minutes || 4} />
          )}
        </div>
      )}

      {/* ── Reflection: after-notes and breath-after ── */}
      {showAfter && scene.after && scene.after.length > 0 && (
        <div className="scene-after scene-after--reveal">
          {scene.after.filter(line => line.kind !== 'shame').map((line, i) => (
            <p key={i} className={'after-line after-' + (line.kind || 'note')}>{line.text}</p>
          ))}
        </div>
      )}
    </div>
  );
}
