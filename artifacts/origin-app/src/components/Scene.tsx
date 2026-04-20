import { Scene as SceneType } from '../chapters';
import BreathPacer from './BreathPacer';
import Journal from './Journal';
import ShameMask from './ShameMask';
import VoicesList from './VoicesList';
import Declarations from './Declarations';
import Gratitude from './Gratitude';
import Gathering from './Gathering';
import MoveTimer from './MoveTimer';
import Broadcast from './Broadcast';

interface Props {
  scene: SceneType;
  idx: number;
  total: number;
}

export default function Scene({ scene }: Props) {
  return (
    <div className="scene">
      {scene.title && <h3 className="scene-title">{scene.title}</h3>}
      {scene.label && <div className="scene-label">{scene.label}</div>}
      {scene.body && <p className="scene-body">{scene.body}</p>}

      {(scene.kind === 'arrive') && scene.breath && (
        <BreathPacer label={scene.breath.label} cycles={scene.breath.cycles} />
      )}
      {scene.kind === 'breath' && scene.breath && (
        <BreathPacer label={scene.breath.label} cycles={scene.breath.cycles} />
      )}
      {scene.kind === 'prompt' && scene.key && (
        <Journal sceneKey={scene.key} placeholder="" rows={scene.rows || 4} />
      )}
      {scene.kind === 'reflection' && <div className="reflection-mark">◦</div>}
      {scene.kind === 'shame' && scene.body && <ShameMask body={scene.body} />}
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
      {scene.kind === 'broadcast' && scene.key && (
        <Broadcast sceneKey={scene.key} minutes={scene.minutes || 4} />
      )}
      {scene.kind === 'finale' && (
        <div className="finale">
          <div className="finale-mark">∎</div>
          <div className="finale-words">the end.</div>
          <div className="finale-sub">the beginning of chapter one.</div>
        </div>
      )}

      {scene.after && scene.after.length > 0 && (
        <div className="scene-after">
          {scene.after.map((line, i) => (
            line.kind === 'shame'
              ? <ShameMask key={i} body={line.text} />
              : <p key={i} className={'after-line after-' + (line.kind || 'note')}>{line.text}</p>
          ))}
        </div>
      )}
      {scene.breathAfter && (
        <div className="scene-breath-after">
          <BreathPacer label={scene.breathAfter.label} cycles={scene.breathAfter.cycles} />
        </div>
      )}
    </div>
  );
}
