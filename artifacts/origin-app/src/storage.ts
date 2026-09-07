import type { Chapter } from "./chapters";
import { idbLoad, idbSave, idbRemove, idbResetAll } from "./lib/storage-idb";

/* ─────────────── Storage keys ───────────────
   Large, user-generated data lives in IndexedDB (via the idb-keyval
   helpers in ./lib/storage-idb). Small preference / navigation values
   stay in localStorage for synchronous, zero-cost reads. */

const STORAGE = "origin.v1"; // journal entries (scene key -> user writing)

const READINGS_KEY = "origin.readings";
const CODEX_KEY = "origin.codex";
const CUMULATIVE_KEY = "origin.cumulative";
const MARGINS_KEY = "origin.margins";
const SYNTHESIS_KEY = "origin.synthesis";
const ORIGIN_STORY_KEY = "origin.story";

/* localStorage-only (small) keys */
const ARCHIVE_UNLOCK_KEY = "origin.archive.unlocked";
const BIRTH_KEY = "origin.birth";
const PACE_KEY = "origin.pace";
const DAILY_UNLOCKS_KEY = "origin.daily";

/* One-time migration flag */
const MIGRATION_FLAG = "origin-idb-migrated";

/* All keys that should be migrated from localStorage -> IDB. */
const IDB_KEYS = [
  STORAGE,
  READINGS_KEY,
  CODEX_KEY,
  CUMULATIVE_KEY,
  MARGINS_KEY,
  SYNTHESIS_KEY,
  ORIGIN_STORY_KEY,
];

/* ─────────────── In-memory cache ───────────────
   IDB is async, but every existing caller reads synchronously. We hydrate
   an in-memory cache once on app load (see initStorage); after that, reads
   hit the cache and writes update the cache + persist to IDB in the
   background. */

const journalCache: Record<string, unknown> = {};
const idbCache = new Map<string, unknown>();

let hydrated = false;
let initPromise: Promise<void> | null = null;

/** True once the IDB cache has been hydrated (safe for sync reads). */
export function isStorageHydrated(): boolean {
  return hydrated;
}

/**
 * Hydrate the in-memory cache from IndexedDB and run the one-time
 * localStorage -> IDB migration. Idempotent; safe to call multiple times.
 */
export function initStorage(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await migrateLocalStorageToIdb();

    // Journal entries (object keyed by scene key).
    const journal = await idbLoad<Record<string, unknown>>(STORAGE);
    if (journal && typeof journal === "object") {
      for (const k of Object.keys(journal)) {
        if (!(k in journalCache)) journalCache[k] = journal[k];
      }
    }

    // Everything else IDB-backed.
    for (const key of IDB_KEYS) {
      if (key === STORAGE) continue;
      if (idbCache.has(key)) continue;
      const v = await idbLoad(key);
      if (v !== null) idbCache.set(key, v);
    }

    hydrated = true;
  })();
  return initPromise;
}

/**
 * One-time migration: if legacy localStorage data exists and hasn't been
 * migrated yet, copy it into IndexedDB and mark the migration complete.
 */
async function migrateLocalStorageToIdb(): Promise<void> {
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  let touched = false;
  for (const key of IDB_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      await idbSave(key, JSON.parse(raw));
      touched = true;
    } catch {
      /* ignore malformed entries */
    }
  }

  // Mark migration complete regardless — we don't want to retry every load.
  // (Only set the flag if IDB is actually available; if every save failed we
  // still set it to avoid an infinite retry loop, since the source data is
  // unchanged and a retry wouldn't help.)
  void touched;
  try {
    localStorage.setItem(MIGRATION_FLAG, "1");
  } catch {
    /* localStorage unavailable — nothing we can do */
  }
}

/* ─────────────── Journal entries (IDB-backed) ─────────────── */

export function load(): Record<string, unknown> {
  return journalCache;
}

export function save(k: string, v: unknown): void {
  journalCache[k] = v;
  void idbSave(STORAGE, journalCache);
}

export function getTileIdx(): number {
  try { return parseInt(localStorage.getItem("origin.tile") || "0", 10) || 0; } catch { return 0; }
}

export function setTileIdx(idx: number): void {
  localStorage.setItem("origin.tile", String(idx));
}

export function resetAll(): void {
  // Wipe caches.
  for (const k of Object.keys(journalCache)) delete journalCache[k];
  idbCache.clear();

  // Wipe IDB.
  void idbResetAll();

  // Wipe localStorage (both large-legacy and small keys).
  localStorage.removeItem(STORAGE);
  localStorage.removeItem("origin.tile");
  localStorage.removeItem(READINGS_KEY);
  localStorage.removeItem(CODEX_KEY);
  localStorage.removeItem(CUMULATIVE_KEY);
  localStorage.removeItem(ARCHIVE_UNLOCK_KEY);
  localStorage.removeItem(MARGINS_KEY);
  localStorage.removeItem(SYNTHESIS_KEY);
  localStorage.removeItem(ORIGIN_STORY_KEY);
  localStorage.removeItem(BIRTH_KEY);
  localStorage.removeItem(PACE_KEY);
  localStorage.removeItem(DAILY_UNLOCKS_KEY);
  localStorage.removeItem(MIGRATION_FLAG);
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
  const entries = journalCache['bodyEntries'];
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
  const entries = journalCache['streamEntries'];
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

/* ─────────────── localStorage helpers (small values) ─────────────── */

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

/* ─────────────── IDB-cached helpers (large values) ─────────────── */

function readCached<T>(key: string, fallback: T): T {
  if (!idbCache.has(key)) return fallback;
  return idbCache.get(key) as T;
}

function writeCached(key: string, value: unknown): void {
  idbCache.set(key, value);
  void idbSave(key, value);
}

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

export function getAllReadings(): Record<number, ChapterReading> {
  return readCached<Record<number, ChapterReading>>(READINGS_KEY, {});
}

export function getReading(chapterIdx: number): ChapterReading {
  const all = getAllReadings();
  return all[chapterIdx] || {};
}

export function saveMorpho(chapterIdx: number, morpho: MorphoReading): void {
  const all = getAllReadings();
  all[chapterIdx] = { ...(all[chapterIdx] || {}), morpho };
  writeCached(READINGS_KEY, all);
}

export function saveSage(chapterIdx: number, sage: SageReading): void {
  const all = getAllReadings();
  all[chapterIdx] = { ...(all[chapterIdx] || {}), sage };
  writeCached(READINGS_KEY, all);

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
  writeCached(CODEX_KEY, dedup);
}

export function saveHorizon(chapterIdx: number, horizon: HorizonReading): void {
  const all = getAllReadings();
  all[chapterIdx] = { ...(all[chapterIdx] || {}), horizon };
  writeCached(READINGS_KEY, all);
}

export function getCodex(): CodexEntry[] {
  return readCached<CodexEntry[]>(CODEX_KEY, []);
}

export function getCumulative(): CumulativeReading | null {
  return readCached<CumulativeReading | null>(CUMULATIVE_KEY, null);
}

export function saveCumulative(r: CumulativeReading): void {
  writeCached(CUMULATIVE_KEY, r);
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
        thread: scene.body?.split('\n')[0]?.replace(/^[!^] /, '').slice(0, 160) || '',
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
        thread: scene.body?.split('\n')[0]?.replace(/^[!^] /, '').slice(0, 160) || '',
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

/* ─────────────── Margins — Morpho reads a submitted page ─────────────── */

export interface PageMargins {
  marginalNotes: MarginalNote[];
  invitation: string;
  generatedAt: number;
}

export function getAllMargins(): Record<string, PageMargins> {
  return readCached<Record<string, PageMargins>>(MARGINS_KEY, {});
}

export function getMargins(sceneKey: string): PageMargins | undefined {
  return getAllMargins()[sceneKey];
}

export function saveMargins(sceneKey: string, margins: PageMargins): void {
  const all = getAllMargins();
  all[sceneKey] = margins;
  writeCached(MARGINS_KEY, all);
}

/* ─────────────── The Storyteller — chapter syntheses ─────────────── */

export interface ChapterSynthesis {
  title: string;
  story: string;
  closing: string;
  generatedAt: number;
}

export function getAllSyntheses(): Record<number, ChapterSynthesis> {
  return readCached<Record<number, ChapterSynthesis>>(SYNTHESIS_KEY, {});
}

export function getSynthesis(chapterIdx: number): ChapterSynthesis | undefined {
  return getAllSyntheses()[chapterIdx];
}

export function saveSynthesis(chapterIdx: number, synthesis: ChapterSynthesis): void {
  const all = getAllSyntheses();
  all[chapterIdx] = synthesis;
  writeCached(SYNTHESIS_KEY, all);
}

/* ─────────────── The Origin Story — the full telling ─────────────── */

export interface OriginStoryMovement {
  movement: string;
  heading: string;
  text: string;
}

export interface OriginStory {
  title: string;
  movements: OriginStoryMovement[];
  dedication: string;
  generatedAt: number;
}

export function getOriginStory(): OriginStory | undefined {
  return readCached<OriginStory | undefined>(ORIGIN_STORY_KEY, undefined);
}

export function saveOriginStory(story: OriginStory): void {
  writeCached(ORIGIN_STORY_KEY, story);
}

/* ─────────────── Birth data — the invisible archetype layer ───────────────
   Collected once, early. Computed server-side into a background character
   sketch. Never surfaced to the user as any named system. */

export interface BirthData {
  date: string;      // YYYY-MM-DD
  time?: string;     // HH:MM, optional
  place?: string;    // free text, optional
  savedAt: number;
}

export function getBirthData(): BirthData | undefined {
  return readJson<BirthData | undefined>(BIRTH_KEY, undefined);
}

export function saveBirthData(data: BirthData): void {
  writeJson(BIRTH_KEY, data);
}

/* ─────────────── Pace — free scroll or one chapter a day ─────────────── */

export type Pace = "free" | "daily";

export function getPace(): Pace {
  return localStorage.getItem(PACE_KEY) === "daily" ? "daily" : "free";
}

export function setPace(pace: Pace): void {
  localStorage.setItem(PACE_KEY, pace);
}

/** chapterIdx → ISO date (YYYY-MM-DD) it was unlocked. Chapter 0 always unlocked. */
export function getDailyUnlocks(): Record<number, string> {
  return readJson<Record<number, string>>(DAILY_UNLOCKS_KEY, {});
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Unlock the next chapter if the previous is complete and it's a new day. */
export function tryUnlockDaily(chapterIdx: number): boolean {
  if (chapterIdx === 0) return true;
  const unlocks = getDailyUnlocks();
  if (unlocks[chapterIdx]) return true;
  const prevUnlockedOn = chapterIdx === 1 ? null : unlocks[chapterIdx - 1];
  const today = todayIso();
  if (chapterIdx === 1 || (prevUnlockedOn && prevUnlockedOn < today)) {
    unlocks[chapterIdx] = today;
    writeJson(DAILY_UNLOCKS_KEY, unlocks);
    return true;
  }
  return false;
}

/** In daily pace, is this chapter open yet? (Free pace: always.) */
export function isChapterDayOpen(chapterIdx: number): boolean {
  if (getPace() === "free") return true;
  if (chapterIdx === 0) return true;
  const unlocks = getDailyUnlocks();
  if (unlocks[chapterIdx]) return true;
  return tryUnlockDaily(chapterIdx);
}

/* ─────────────── Per-key removal (used by sync / migration tooling) ─────────────── */

/** Remove a single IDB-backed key from cache + IndexedDB. */
export function removeIdbKey(key: string): void {
  idbCache.delete(key);
  void idbRemove(key);
}
