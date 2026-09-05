import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import CHAPTERS, { Scene as SceneType } from '../chapters';
import BreathPacer from './BreathPacer';
import Journal from './Journal';
import VoicesList from './VoicesList';
import Declarations from './Declarations';
import Gratitude from './Gratitude';
import Gathering from './Gathering';
import MoveTimer from './MoveTimer';
import Broadcast from './Broadcast';
import { RegisterPara } from './Registers';
import MarginNotes from './MarginNotes';
import { PortalCode, PortalLore, PortalEty } from './Portal';
import { unlockArchive, isArchiveUnlocked } from '../storage';

interface Props {
  scene: SceneType;
  idx: number;
  total: number;
  chapterIdx: number;
  instantReveal?: boolean;
  onSaveJournal?: () => void;
}

// Kinds that show everything at once (no progressive reveal)
const SIMPLE_KINDS = new Set([
  'arrive', 'breath', 'reflection', 'outside', 'movement', 'embody', 'finale'
]);

const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Kinds whose first paragraph opens with a gilded drop cap
const DROPCAP_KINDS = new Set(['prompt', 'threshold']);

// Kinds whose closing line is a real question with a desk beneath it
const INTERACTIVE_KINDS = new Set(['arrive', 'prompt', 'threshold']);

/* ─── v2 inline-portal prose renderer ─────────────────────────────
   Parses {code}...{/code}, {lore}...{/lore}, {ety:key|Display} markers
   in a movement body and wraps them in real portals inline. The Codex
   Code/Lore content and the etymology map come from the scene. */
const V2_MARKER = /(\{code\}[\s\S]*?\{\/code\}|\{lore\}[\s\S]*?\{\/lore\}|\{ety:[^}]+\})/g;

function renderV2Prose(scene: SceneType, chapterIdx: number, sceneIdx: number) {
  const paras = (scene.body || '').split('\n\n');
  return paras.map((para, pi) => {
    const parts = para.split(V2_MARKER).filter(p => p !== '');
    const nodes = parts.map((part, i) => {
      const key = `${pi}-${i}`;

      // CODE — highlighter phrase
      const codeMatch = part.match(/^\{code\}([\s\S]*?)\{\/code\}$/);
      if (codeMatch && scene.code) {
        return (
          <PortalCode
            key={key}
            title={scene.code.title}
            body={scene.code.body}
            explore={scene.code.explore}
            kind={scene.codeCite || 'code'}
            storageKey={`code:${chapterIdx}:${sceneIdx}`}
          >
            {codeMatch[1]}
          </PortalCode>
        );
      }

      // LORE — underscribbled sentence
      const loreMatch = part.match(/^\{lore\}([\s\S]*?)\{\/lore\}$/);
      if (loreMatch && scene.lore) {
        return (
          <PortalLore
            key={key}
            essence={scene.lore.title}
            body={scene.lore.body}
            kind={scene.loreCite || 'lore'}
            storageKey={`lore:${chapterIdx}:${sceneIdx}`}
          >
            {loreMatch[1]}
          </PortalLore>
        );
      }

      // ETY — glowing word. {ety:key|Display}  (Display optional)
      const etyMatch = part.match(/^\{ety:([^}|]+)(?:\|([^}]+))?\}$/);
      if (etyMatch && scene.etymologies) {
        const ety = scene.etymologies[etyMatch[1].trim()];
        if (ety) {
          const display = etyMatch[2]?.trim() || ety.word;
          return (
            <PortalEty
              key={key}
              word={ety.word}
              chain={ety.chain}
              note={ety.note}
              storageKey={`ety:${chapterIdx}:${sceneIdx}:${etyMatch[1].trim()}`}
            >
              {display}
            </PortalEty>
          );
        }
      }

      return <span key={key}>{part}</span>;
    });
    return (
      <p key={pi} className={pi === 0 ? 'scene-body-p invocation-dropcap' : 'scene-body-p'}>
        {nodes}
      </p>
    );
  });
}

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

/* Angular geometric corner for Code tiles — lapidary, cartouche-like */
function InlineCodeCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const d = {
    tl: 'M20 2 L2 2 L2 20',
    tr: 'M4 2 L22 2 L22 20',
    bl: 'M20 22 L2 22 L2 4',
    br: 'M4 22 L22 22 L22 4',
  }[pos];
  /* Small filled square at the corner vertex */
  const sq = {
    tl: 'M2 2 L5 2 L5 5 L2 5 Z',
    tr: 'M22 2 L19 2 L19 5 L22 5 Z',
    bl: 'M2 22 L5 22 L5 19 L2 19 Z',
    br: 'M22 22 L19 22 L19 19 L22 19 Z',
  }[pos];
  return (
    <span className={`inline-code-corner inline-code-corner--${pos}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
        <path d={sq} fill="currentColor" opacity="0.55" />
      </svg>
    </span>
  );
}

/* Organic vine-and-eye corner for Lore tiles — living, breathing */
function InlineLoreCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const vine = {
    tl: 'M14 2 C10 2 2 2 2 2 C2 2 2 10 2 14',
    tr: 'M10 2 C14 2 22 2 22 2 C22 2 22 10 22 14',
    bl: 'M14 22 C10 22 2 22 2 22 C2 22 2 14 2 10',
    br: 'M10 22 C14 22 22 22 22 22 C22 22 22 14 22 10',
  }[pos];
  /* Eye/bud ornament at the corner vertex */
  const eye = {
    tl: 'M2 2 C4.5 0 7.5 0 10 2 C7.5 4 4.5 4 2 2 Z',
    tr: 'M22 2 C19.5 0 16.5 0 14 2 C16.5 4 19.5 4 22 2 Z',
    bl: 'M2 22 C4.5 24 7.5 24 10 22 C7.5 20 4.5 20 2 22 Z',
    br: 'M22 22 C19.5 24 16.5 24 14 22 C16.5 20 19.5 20 22 22 Z',
  }[pos];
  /* Small tendril curling from the vine */
  const tendril = {
    tl: 'M2 6 C0 8 0 10 2 10',
    tr: 'M22 6 C24 8 24 10 22 10',
    bl: 'M2 18 C0 16 0 14 2 14',
    br: 'M22 18 C24 16 24 14 22 14',
  }[pos];
  return (
    <span className={`inline-lore-corner inline-lore-corner--${pos}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d={vine} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="lore-vine-path" />
        <path d={eye} fill="currentColor" opacity="0.5" />
        <path d={tendril} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      </svg>
    </span>
  );
}

/* The full text opens as a centered revelation over the page —
   the card in the flow stays a sealed door: essence + invitation. */
function RevelationModal({
  kind, title, body, onClose,
}: { kind: 'code' | 'lore'; title: string; body: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="rev-backdrop" onClick={onClose} role="presentation">
      <div
        className={`rev-modal rev-modal--${kind}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${kind === 'code' ? 'Code' : 'Lore'}: ${title}`}
        onClick={e => e.stopPropagation()}
      >
        <button className="rev-close" onClick={onClose} aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="rev-kicker">
          <span>{kind === 'code' ? 'Code · The Science' : 'Lore · The Old Knowing'}</span>
          <span>{kind === 'code' ? '◇' : '❋'}</span>
        </div>
        <div className="rev-title">{title}</div>
        <div className="rev-body">
          {body.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function UnlockableInline({
  kind, chapterIdx, title, body,
}: { kind: 'code' | 'lore'; chapterIdx: number; title: string; body: string }) {
  const initiallyUnlocked = isArchiveUnlocked(chapterIdx, kind, title);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
    if (!unlocked) {
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
        (unlocked ? ` ${klass}-card--unlocked` : '') +
        (justUnlocked ? ` ${klass}-card--just-unlocked` : '')
      }
    >
      {justUnlocked && <span className="archive-unlock-flash" aria-hidden="true" />}
      {/* Corner frame — geometric for Code, vine-and-eye for Lore */}
      <div className={`${klass}-frame`} aria-hidden="true">
        {kind === 'code' ? (
          <>
            <InlineCodeCorner pos="tl" />
            <InlineCodeCorner pos="tr" />
            <InlineCodeCorner pos="bl" />
            <InlineCodeCorner pos="br" />
          </>
        ) : (
          <>
            <InlineLoreCorner pos="tl" />
            <InlineLoreCorner pos="tr" />
            <InlineLoreCorner pos="bl" />
            <InlineLoreCorner pos="br" />
          </>
        )}
      </div>
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
      <button
        type="button"
        className={`${klass}-toggle`}
        onClick={handleOpen}
        aria-haspopup="dialog"
      >
        <Chevron dir="down" />
        <span>{verb}</span>
      </button>
      {open && (
        <RevelationModal kind={kind} title={title} body={body} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function ExpandableCode(props: { title: string; body: string; chapterIdx: number }) {
  return <UnlockableInline kind="code" {...props} />;
}
function ExpandableLore(props: { title: string; body: string; chapterIdx: number }) {
  return <UnlockableInline kind="lore" {...props} />;
}

/* ─── Threshold — a crossing you make in the world, not a textarea.
   The instruction lives in the prose above; this is the ceremonial
   act of marking it done. ── */
function ThresholdCrossing({ sceneKey, onSave }: {
  sceneKey?: string; onSave?: () => void;
}) {
  const storeKey = sceneKey ? `threshold:${sceneKey}` : undefined;
  const [done, setDone] = useState<boolean>(() => (storeKey ? !!localStorage.getItem(storeKey) : false));
  const mark = () => {
    setDone(true);
    if (storeKey) localStorage.setItem(storeKey, '1');
    onSave?.();
  };
  return (
    <div className={`threshold-crossing${done ? ' is-done' : ''}`}>
      <button
        className="threshold-orb"
        onClick={mark}
        aria-label={done ? 'crossed' : 'mark this crossed'}
      >
        <span className="threshold-orb-ring" aria-hidden="true" />
        <span className="threshold-orb-core" aria-hidden="true" />
        {done && (
          <svg className="threshold-orb-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10.5L8.5 15L16 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {done && <div className="threshold-verb">crossed</div>}
      {!done && (
        <button className="threshold-mark" onClick={mark}>done</button>
      )}
    </div>
  );
}

export default function Scene({ scene, idx, chapterIdx, instantReveal, onSaveJournal }: Props) {
  const { phase, advance } = useSceneReveal(scene);

  const effectivePhase = instantReveal ? 99 : phase;
  const showInteraction = effectivePhase >= 1;
  const showAfter = effectivePhase >= 2;

  return (
    <div className={
      'scene'
      + (scene.kind === 'threshold' ? ' scene--threshold' : '')
      + (chapterIdx === 6 ? ' scene--fire' : '')
    } onClick={(e) => {
      // Tap anywhere in the lower area of the scene to advance phase early
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.tagName === 'BUTTON';
      if (!isInput && phase < 1) advance();
    }}>

      {/* ── Context: always visible, materialises on mount ──
           Movement anatomy: kicker (number · lens) → title → hairline → prose */}
      <div className="scene-context scene-materialize">
        <div className="mv-kicker">
          <span className="mv-no">{ROMANS[chapterIdx] || ''}·{idx + 1}</span>
          {scene.subtitle && <span className="mv-rule" aria-hidden="true" />}
          {scene.subtitle && <span className="mv-lens">{scene.subtitle}</span>}
        </div>
        {(scene.title || scene.label) && (
          <h3 className="scene-title">{scene.title || scene.label}</h3>
        )}
        <div className="mv-hairline" aria-hidden="true" />

        {/* ── v2: inline-portal prose. The Codex Code/Lore/etymology are
             woven into the essay as glowing words, highlights, and
             underscribbles — no end-of-scene cards. ── */}
        {scene.v2 ? (
          <div className="scene-body scene-body--multi scene-body--v2">
            {renderV2Prose(scene, chapterIdx, idx)}
          </div>
        ) : (
          <>
            {scene.body && (
              scene.body.includes('\n\n') ? (
                <div className="scene-body scene-body--multi">
                  {(() => {
                    const paras = scene.body!.split('\n\n');
                    const firstIdx = DROPCAP_KINDS.has(scene.kind)
                      ? paras.findIndex(p => !p.startsWith('! ') && !p.startsWith('^ '))
                      : -1;
                    return paras.map((para, i) => (
                      <RegisterPara key={i} text={para} dropcap={i === firstIdx} />
                    ));
                  })()}
                </div>
              ) : (
                <p className="scene-body">{scene.body}</p>
              )
            )}

            {scene.code && (
              <ExpandableCode title={scene.code.title} body={scene.code.body} chapterIdx={chapterIdx} />
            )}

            {scene.middle && (
              scene.middle.includes('\n\n') ? (
                <div className="scene-middle">
                  {scene.middle.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                </div>
              ) : (
                <p className="scene-middle">{scene.middle}</p>
              )
            )}

            {scene.lore && (
              <ExpandableLore title={scene.lore.title} body={scene.lore.body} chapterIdx={chapterIdx} />
            )}
          </>
        )}

        {(scene.closing || (scene.v2 && scene.ask)) && INTERACTIVE_KINDS.has(scene.kind) && (
          <span className="scene-ask-eyebrow">the chapter asks</span>
        )}
        {scene.closing && <p className="scene-closing">{scene.closing}</p>}
        {scene.ask && <p className="scene-ask-detail">{scene.ask}</p>}

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
      {effectivePhase === 0 && !SIMPLE_KINDS.has(scene.kind) && (
        <button className="scene-continue-cue" onClick={advance} aria-label="Continue">
          <span className="cue-dot" />
        </button>
      )}

      {/* ── Practice: interaction slides up ── */}
      {showInteraction && (
        <div className={`scene-practice ${phase === 1 ? 'scene-practice--entering' : 'scene-practice--visible'}`}>
          {(scene.kind === 'prompt' || scene.kind === 'arrive') && scene.key && (
            <>
              <Journal
                sceneKey={scene.key}
                placeholder=""
                rows={scene.rows || 4}
                onSave={onSaveJournal}
                question={scene.closing}
                detail={scene.ask}
                eyebrow="the chapter asks"
              />
              <MarginNotes
                sceneKey={scene.key}
                chapterIdx={chapterIdx}
                chapterTitle={CHAPTERS[chapterIdx]?.title || ''}
                movementTitle={scene.title || scene.label || ''}
                question={scene.closing}
              />
            </>
          )}
          {scene.kind === 'threshold' && (
            <div className="threshold">
              <div className="threshold-rule" />
              {/* v2 threshold: a crossing you do in the world, not a textarea.
                 The kind (voice/ritual/making/declaration) is carried in subtitle. */}
              {scene.v2 ? (
                <ThresholdCrossing sceneKey={scene.key} onSave={onSaveJournal} />
              ) : scene.prompt ? (
                <>
                  <Journal
                    sceneKey={scene.prompt.key}
                    placeholder={scene.prompt.placeholder}
                    rows={scene.prompt.rows}
                    big={scene.prompt.big}
                    onSave={onSaveJournal}
                  />
                  <MarginNotes
                    sceneKey={scene.prompt.key}
                    chapterIdx={chapterIdx}
                    chapterTitle={CHAPTERS[chapterIdx]?.title || ''}
                    movementTitle={scene.title || scene.label || ''}
                    question={scene.closing}
                  />
                </>
              ) : null}
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
