import {
  load, save, getTileIdx, setTileIdx,
  getStreamEntries, getBodyEntries,
  getAllReadings, getUnlockedArchive, getCumulative,
  saveMorpho, saveSage, saveHorizon, saveCumulative,
} from "../storage";
import type {
  StreamEntry, BodyEntry, ChapterReading,
  MorphoReading, SageReading, HorizonReading, CumulativeReading,
} from "../storage";

const API = "/api/user";

/* Module-level auth token. Updated by AuthContext when the user
   logs in/out. This avoids prop-drilling the token through every
   call site. */
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

async function apiFetch<T>(path: string, init: RequestInit = {}, keepalive = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init.headers as Record<string, string> ?? {}) };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers,
    credentials: "include",
    keepalive,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/* ─── Snapshot helpers ─── */

export interface LocalSnapshot {
  tileIdx: number;
  responses: Record<string, unknown>;
  stream: StreamEntry[];
  body: BodyEntry[];
  readings: Record<number, ChapterReading>;
  cumulative: CumulativeReading | null;
  archive: string[];
}

export function captureLocalSnapshot(): LocalSnapshot {
  return {
    tileIdx: getTileIdx(),
    responses: load(),
    stream: getStreamEntries(),
    body: getBodyEntries(),
    readings: getAllReadings(),
    cumulative: getCumulative(),
    archive: [...getUnlockedArchive()],
  };
}

export function hasSubstantialLocalData(): boolean {
  const s = captureLocalSnapshot();
  return (
    s.tileIdx > 0 ||
    Object.keys(s.responses).length > 0 ||
    s.stream.length > 0 ||
    s.body.length > 0 ||
    s.archive.length > 0 ||
    Object.keys(s.readings).length > 0 ||
    s.cumulative !== null
  );
}

/* ─── Pull ─── */

interface ServerState { tileIdx: number; responses: Record<string, unknown> }
interface ServerEntries { stream: StreamEntry[]; body: BodyEntry[] }
interface ServerReadings { readings: Record<number, ChapterReading>; cumulative: CumulativeReading | null }
interface ServerArchive { unlocked: string[] }

export interface PullResult { success: boolean; serverHasData: boolean }

// Server is authoritative: writes all keys to localStorage, clearing stale data
// from prior accounts (important for account switches on shared browsers).
export async function pullAll(): Promise<PullResult> {
  try {
    const [state, entries, readings, archive] = await Promise.all([
      apiFetch<ServerState>("/state"),
      apiFetch<ServerEntries>("/entries"),
      apiFetch<ServerReadings>("/readings"),
      apiFetch<ServerArchive>("/archive"),
    ]);

    const serverHasData =
      (state.tileIdx ?? 0) > 0 ||
      Object.keys(state.responses ?? {}).length > 0 ||
      entries.stream.length > 0 ||
      entries.body.length > 0 ||
      Object.keys(readings.readings ?? {}).length > 0 ||
      archive.unlocked.length > 0 ||
      readings.cumulative !== null;

    setTileIdx(state.tileIdx ?? 0);
    localStorage.setItem("origin.v1", JSON.stringify(state.responses ?? {}));
    save("streamEntries", entries.stream);
    save("bodyEntries", entries.body);
    // Replace readings keys entirely so stale per-account data is never left behind.
    localStorage.setItem("origin.readings", JSON.stringify(readings.readings ?? {}));
    localStorage.setItem("origin.codex", JSON.stringify([]));
    if (readings.cumulative) {
      localStorage.setItem("origin.cumulative", JSON.stringify(readings.cumulative));
    } else {
      localStorage.removeItem("origin.cumulative");
    }
    // Re-apply readings through storage helpers so in-memory state is consistent.
    for (const [k, r] of Object.entries(readings.readings ?? {})) {
      const ch = parseInt(k, 10);
      if (r.morpho) saveMorpho(ch, r.morpho as MorphoReading);
      if (r.sage) saveSage(ch, r.sage as SageReading);
      if (r.horizon) saveHorizon(ch, r.horizon as HorizonReading);
    }
    localStorage.setItem("origin.archive.unlocked", JSON.stringify(archive.unlocked));

    return { success: true, serverHasData };
  } catch {
    return { success: false, serverHasData: false };
  }
}

/* ─── Push ─── */

export async function pushAll(keepalive = false): Promise<void> {
  try {
    await Promise.all([
      apiFetch("/state", {
        method: "PUT",
        body: JSON.stringify({ tileIdx: getTileIdx(), responses: load() }),
      }, keepalive),
      apiFetch("/entries", {
        method: "PUT",
        body: JSON.stringify({ stream: getStreamEntries(), body: getBodyEntries() }),
      }, keepalive),
      apiFetch("/readings", {
        method: "PUT",
        body: JSON.stringify({ readings: getAllReadings(), cumulative: getCumulative() }),
      }, keepalive),
      apiFetch("/archive", {
        method: "PUT",
        body: JSON.stringify({ unlocked: [...getUnlockedArchive()] }),
      }, keepalive),
    ]);
  } catch { /* localStorage is source of truth; server sync is best-effort */ }
}

// Restore snapshot to localStorage (including readings/cumulative) then push.
// Used when a user confirms "save journey" migration on first sign-in.
export async function pushSnapshot(snapshot: LocalSnapshot): Promise<void> {
  setTileIdx(snapshot.tileIdx);
  localStorage.setItem("origin.v1", JSON.stringify(snapshot.responses));
  save("streamEntries", snapshot.stream);
  save("bodyEntries", snapshot.body);
  localStorage.setItem("origin.archive.unlocked", JSON.stringify(snapshot.archive));
  localStorage.setItem("origin.readings", JSON.stringify(snapshot.readings ?? {}));
  if (snapshot.cumulative) {
    localStorage.setItem("origin.cumulative", JSON.stringify(snapshot.cumulative));
  } else {
    localStorage.removeItem("origin.cumulative");
  }
  await pushAll();
}

export async function pushTileIdx(tileIdx: number): Promise<void> {
  try {
    await apiFetch("/state", {
      method: "PUT",
      body: JSON.stringify({ tileIdx, responses: load() }),
    });
  } catch { /* best-effort */ }
}
