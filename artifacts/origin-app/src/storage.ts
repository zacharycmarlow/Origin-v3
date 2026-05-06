import type { Chapter } from "./chapters";

const STORAGE = "origin.v1";

export function load(): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem(STORAGE) || "{}"); } catch { return {}; }
}

export function save(k: string, v: unknown): void {
  const d = load(); d[k] = v; localStorage.setItem(STORAGE, JSON.stringify(d));
}

export function getTileIdx(): number {
  try { return parseInt(localStorage.getItem("origin.tile") || "0", 10) || 0; } catch { return 0; }
}

export function setTileIdx(idx: number): void {
  localStorage.setItem("origin.tile", String(idx));
}

export function resetAll(): void {
  localStorage.removeItem(STORAGE);
  localStorage.removeItem("origin.tile");
  localStorage.removeItem("origin.readings");
  localStorage.removeItem("origin.codex");
  localStorage.removeItem("origin.cumulative");
  localStorage.removeItem("origin.archive.unlocked");
  localStorage.removeItem("origin.body");
  localStorage.removeItem("origin.stream");
}

export interface BodyEntry {
  id: string;
  zoneId: string;
  energyCenter: string;
  chapter: number;
  note: string;
  timestamp: number;
}

export interface StreamEntry {
  id: string;
  chapter: number;
  text: string;
  timestamp: number;
}

const LEGACY_ZONE_MAP: Record<string, string> = {
  head: 'head', brow: 'brow', forehead: 'brow', 'third eye': 'brow',
  jaw: 'jaw', mouth: 'jaw',
  throat: 'throat', neck: 'throat',
  shoulders: 'shoulders', shoulder: 'shoulders',
  heart: 'heart', chest: 'heart',
  gut: 'gut', solar: 'gut', 'solar plexus': 'gut',
  belly: 'belly', stomach: 'belly', sacral: 'belly',
  root: 'root', pelvis: 'root', hips: 'root',
  hands: 'hands', hand: 'hands',
  back: 'back', spine: 'back',
};

export function getBodyEntries(): BodyEntry[] {
  const entries = load()['bodyEntries'];
  if (!Array.isArray(entries)) return [];
  let mutated = false;
  const normalized = (entries as BodyEntry[]).map(e => {
    if (e && typeof e === 'object' && !e.zoneId && typeof e.energyCenter === 'string') {
      const key = e.energyCenter.trim().toLowerCase();
      const mapped = LEGACY_ZONE_MAP[key];
      if (mapped) { mutated = true; return { ...e, zoneId: mapped }; }
      mutated = true;
      return { ...e, zoneId: 'heart' };
    }
    return e;
  });
  if (mutated) save('bodyEntries', normalized);
  return normalized;
}

export function getStreamEntries(): StreamEntry[] {
  const entries = load()['streamEntries'];
  return Array.isArray(entries) ? (entries as StreamEntry[]) : [];
}

export function deleteStreamEntry(id: string): void {
  save('streamEntries', getStreamEntries().filter(e => e.id !== id));
}

export function addStreamEntry(chapter: number, text: string): StreamEntry {
  const entry: StreamEntry = {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    chapter, text: text.trim(), timestamp: Date.now(),
  };
  const list = getStreamEntries();
  list.push(entry);
  save('streamEntries', list);
  return entry;
}

export function addBodyEntry(zoneId: string, zoneName: string, chapter: number, note: string): BodyEntry {
  const entry: BodyEntry = {
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    zoneId, energyCenter: zoneName, chapter, note: note.trim(), timestamp: Date.now(),
  };
  const list = getBodyEntries();
  list.push(entry);
  save('bodyEntries', list);
  return entry;
}

export function deleteBodyEntry(id: string): void {
  save('bodyEntries', getBodyEntries().filter(e => e.id !== id));
}

/* ─────────────── Readings (Morpho / Sage / Horizon) ─────────────── */

export interface Beat {
  title: string;
  thread: string;
  text: string;
  storageKey?: string;
}

export interface MarginalNote {
  passage: string;
  insight: string;
}

export interface MorphoReading {
  marginalNotes: MarginalNote[];
  throughLine: string;
  subtext: string;
}

export interface SageReading {
  resonance: string;
  personalizedCodes: { title: string; body: string; researcher?: string }[];
  personalizedLore: { title: string; body: string; tradition?: string }[];
}

export interface HorizonReading {
  whisper: string;
  generatedAt: number;
}

export interface ChapterReading {
  morpho?: MorphoReading;
  sage?: SageReading;
  horizon?: HorizonReading;
}

export interface CodexEntry {
  id: string;
  chapter: number;
  kind: 'code' | 'lore';
  title: string;
  body: string;
  timestamp: number;
}

export interface CumulativeReading {
  morpho: MorphoReading;
  sage: SageReading;
  horizon?: HorizonReading;
  generatedAt: number;
}

const READINGS_KEY = "origin.readings";
const CODEX_KEY = "origin.codex";
const CUMULATIVE_KEY = "origin.cumulative";
const ARCHIVE_UNLOCK_KEY = "origin.archive.unlocked";

/** Set of unlocked archive entry IDs ("chapterIdx|kind|title"). */
export function getUnlockedArchive(): Set<string> {
  const raw = readJson<string[]>(ARCHIVE_UNLOCK_KEY, []);
  return new Set(raw);
}

export function isArchiveUnlocked(chapterIdx: number, kind: 'code' | 'lore', title: string): boolean {
  return getUnlockedArchive().has(`${chapterIdx}|${kind}|${title}`);
}

export function unlockArchive(chapterIdx: number, kind: 'code' | 'lore', title: string): void {
  const set = getUnlockedArchive();
  set.add(`${chapterIdx}|${kind}|${title}`);
  writeJson(ARCHIVE_UNLOCK_KEY, [...set]);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAllReadings(): Record<number, ChapterReading> {
  return readJson<Record<number, ChapterReading>>(READINGS_KEY, {});
}

export function getReading(chapterIdx: number): ChapterReading {
  const all = getAllReadings();
  return all[chapterIdx] || {};
}

export function saveMorpho(chapterIdx: number, morpho: MorphoReading): void {
  const all = getAllReadings();
  all[chapterIdx] = { ...(all[chapterIdx] || {}), morpho };
  writeJson(READINGS_KEY, all);
}

export function saveSage(chapterIdx: number, sage: SageReading): void {
  const all = getAllReadings();
  all[chapterIdx] = { ...(all[chapterIdx] || {}), sage };
  writeJson(READINGS_KEY, all);

  // Append personalized codes/lore to flat codex.
  const codex = getCodex();
  const ts = Date.now();
  for (const c of sage.personalizedCodes || []) {
    codex.push({
      id: `cx-c-${chapterIdx}-${ts}-${Math.random().toString(36).slice(2, 6)}`,
      chapter: chapterIdx, kind: 'code', title: c.title, body: c.body, timestamp: ts,
    });
  }
  for (const l of sage.personalizedLore || []) {
    codex.push({
      id: `cx-l-${chapterIdx}-${ts}-${Math.random().toString(36).slice(2, 6)}`,
      chapter: chapterIdx, kind: 'lore', title: l.title, body: l.body, timestamp: ts,
    });
  }
  // De-dupe by chapter+kind+title (in case Sage is regenerated).
  const seen = new Set<string>();
  const dedup: CodexEntry[] = [];
  for (const e of codex) {
    const k = `${e.chapter}|${e.kind}|${e.title}`;
    if (seen.has(k)) continue;
    seen.add(k);
    dedup.push(e);
  }
  writeJson(CODEX_KEY, dedup);
}

export function saveHorizon(chapterIdx: number, horizon: HorizonReading): void {
  const all = getAllReadings();
  all[chapterIdx] = { ...(all[chapterIdx] || {}), horizon };
  writeJson(READINGS_KEY, all);
}

export function getCodex(): CodexEntry[] {
  return readJson<CodexEntry[]>(CODEX_KEY, []);
}

export function getCumulative(): CumulativeReading | null {
  return readJson<CumulativeReading | null>(CUMULATIVE_KEY, null);
}

export function saveCumulative(r: CumulativeReading): void {
  writeJson(CUMULATIVE_KEY, r);
}

/* ─────────────── Chapter completion + beat extraction ─────────────── */

function nonEmpty(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Extract the user's writing across a chapter as a list of "beats".
 * Each beat aggregates one section the user wrote into.
 */
export function extractChapterBeats(chapter: Chapter): Beat[] {
  const stored = load();
  const beats: Beat[] = [];

  for (const scene of chapter.scenes) {
    if (scene.kind === 'prompt' && scene.key) {
      beats.push({
        title: scene.title || 'Reflection',
        thread: scene.body?.split('\n')[0]?.slice(0, 160) || '',
        text: nonEmpty(stored[scene.key]) ? (stored[scene.key] as string) : '',
        storageKey: scene.key,
      });
    } else if (scene.kind === 'broadcast' && scene.key) {
      beats.push({
        title: scene.title || 'The Broadcast',
        thread: 'transcribing the voice',
        text: nonEmpty(stored[scene.key]) ? (stored[scene.key] as string) : '',
        storageKey: scene.key,
      });
    } else if (scene.kind === 'voices' && scene.key) {
      const raw = stored[scene.key];
      const voices = Array.isArray(raw) ? (raw as string[]).filter(nonEmpty) : [];
      beats.push({
        title: scene.title || 'The Voices',
        thread: 'inherited scripts',
        text: voices.join('\n'),
        storageKey: scene.key,
      });
    } else if (scene.kind === 'gratitude' && scene.keys && scene.items) {
      const parts: string[] = [];
      scene.keys.forEach((k, i) => {
        if (nonEmpty(stored[k])) parts.push(`${scene.items![i]}\n${stored[k]}`);
      });
      beats.push({
        title: scene.title || 'Gratitude',
        thread: 'received · given · caused',
        text: parts.join('\n\n'),
      });
    } else if (scene.kind === 'declaration' && scene.keys) {
      const parts: string[] = [];
      scene.keys.forEach(k => { if (nonEmpty(stored[k])) parts.push(`I am ${stored[k]}`); });
      beats.push({
        title: scene.title || 'I Am',
        thread: 'declarations',
        text: parts.join('\n'),
      });
    } else if (scene.kind === 'gathering' && scene.lines) {
      const parts: string[] = [];
      for (const line of scene.lines) {
        if (line.fixed) { parts.push(line.label); continue; }
        if (line.key && nonEmpty(stored[line.key])) {
          parts.push(`${line.label} ${stored[line.key]}`);
        }
      }
      beats.push({
        title: scene.title || 'The Gathering',
        thread: 'the whole arc, in one breath',
        text: parts.join('\n'),
      });
    } else if (scene.kind === 'threshold' && scene.prompt?.key) {
      beats.push({
        title: scene.label || 'The Threshold',
        thread: scene.body?.split('\n')[0]?.slice(0, 160) || '',
        text: nonEmpty(stored[scene.prompt.key]) ? (stored[scene.prompt.key] as string) : '',
        storageKey: scene.prompt.key,
      });
    }
  }
  return beats;
}

/**
 * A chapter is complete when every scene that has writable keys has user content
 * in at least one of those keys. Fixed lines (e.g. gathering scene scaffolding)
 * are excluded from the check so they can't mark a chapter complete on their own.
 */
export function isChapterComplete(chapter: Chapter): boolean {
  const stored = load();
  let writableScenes = 0;
  let filledScenes = 0;

  for (const scene of chapter.scenes) {
    const keys: string[] = [];
    if ((scene.kind === 'prompt' || scene.kind === 'broadcast' || scene.kind === 'voices') && scene.key) {
      keys.push(scene.key);
    } else if ((scene.kind === 'gratitude' || scene.kind === 'declaration') && scene.keys) {
      keys.push(...scene.keys);
    } else if (scene.kind === 'gathering' && scene.lines) {
      for (const line of scene.lines) {
        if (!line.fixed && line.key) keys.push(line.key);
      }
    } else if (scene.kind === 'threshold' && scene.prompt?.key) {
      keys.push(scene.prompt.key);
    }
    if (keys.length === 0) continue;
    writableScenes++;
    const filled = keys.some(k => {
      const v = stored[k];
      if (Array.isArray(v)) return v.some(nonEmpty);
      return nonEmpty(v);
    });
    if (filled) filledScenes++;
  }

  return writableScenes > 0 && filledScenes === writableScenes;
}
