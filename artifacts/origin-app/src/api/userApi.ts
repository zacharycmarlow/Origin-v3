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

// keepalive=true is used on beforeunload so the browser queues the request
// even if the page is being unloaded (spec: keepalive requests survive page close).
async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  keepalive = false,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    keepalive,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

/* ─── Local snapshot helpers ─────────────────────────────── */

export interface LocalSnapshot {
  tileIdx: number;
  responses: Record<string, unknown>;
  stream: StreamEntry[];
  body: BodyEntry[];
  readings: Record<number, ChapterReading>;
  cumulative: CumulativeReading | null;
  archive: string[];
}

/** Capture the complete current localStorage state before a destructive pull. */
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

/**
 * Returns true if the user has any substantive local journey data.
 * Checks ALL persistence keys — not just the main blob — so stream/body/
 * readings/archive are included.
 */
export function hasSubstantialLocalData(): boolean {
  const snap = captureLocalSnapshot();
  return (
    snap.tileIdx > 0 ||
    Object.keys(snap.responses).length > 0 ||
    snap.stream.length > 0 ||
    snap.body.length > 0 ||
    snap.archive.length > 0 ||
    Object.keys(snap.readings).length > 0 ||
    snap.cumulative !== null
  );
}

/* ─── Pull (server → localStorage, server authoritative) ─── */

interface ServerState {
  tileIdx: number;
  responses: Record<string, unknown>;
}

interface ServerEntries {
  stream: StreamEntry[];
  body: BodyEntry[];
}

interface ServerReadings {
  readings: Record<number, ChapterReading>;
  cumulative: CumulativeReading | null;
}

interface ServerArchive {
  unlocked: string[];
}

export interface PullResult {
  success: boolean;
  /** True if the server returned any substantive journey data. */
  serverHasData: boolean;
}

/**
 * Pull the server's journey snapshot and write it to localStorage.
 * Server is authoritative — local state is REPLACED, not merged.
 * This guarantees "sign in on any device → restore exact server progress."
 *
 * The caller is responsible for capturing a local snapshot BEFORE calling
 * this if it needs to offer a migration prompt.
 */
export async function pullAll(): Promise<PullResult> {
  try {
    const [state, entries, readings, archive] = await Promise.all([
      apiFetch<ServerState>("/state"),
      apiFetch<ServerEntries>("/entries"),
      apiFetch<ServerReadings>("/readings"),
      apiFetch<ServerArchive>("/archive"),
    ]);

    // Determine whether server holds any meaningful data
    const serverHasData =
      (state.tileIdx ?? 0) > 0 ||
      Object.keys(state.responses ?? {}).length > 0 ||
      entries.stream.length > 0 ||
      entries.body.length > 0 ||
      (readings.readings && Object.keys(readings.readings).length > 0) ||
      archive.unlocked.length > 0 ||
      readings.cumulative !== null;

    // Write server data to localStorage — server is authoritative.
    // Clear ALL local keys first so stale data from a prior account or prior
    // session can never bleed into the newly signed-in account's view.
    setTileIdx(state.tileIdx ?? 0);

    const STORAGE = "origin.v1";
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state.responses ?? {}));
    } catch { /* noop */ }

    save("streamEntries", entries.stream);
    save("bodyEntries", entries.body);

    // Always replace readings keys entirely — write empty objects/null when
    // server has nothing, so leftover readings from another account are wiped.
    try {
      localStorage.setItem(
        "origin.readings",
        JSON.stringify(readings.readings ?? {}),
      );
      localStorage.setItem(
        "origin.codex",
        JSON.stringify([]), // codex is regenerated from sage readings on demand
      );
      if (readings.cumulative) {
        localStorage.setItem("origin.cumulative", JSON.stringify(readings.cumulative));
      } else {
        localStorage.removeItem("origin.cumulative");
      }
    } catch { /* noop */ }

    // Re-populate in-memory reading store so saveMorpho/Sage/Horizon helpers
    // don't merge on top of stale data in subsequent calls this session.
    if (readings.readings) {
      for (const [chIdxStr, r] of Object.entries(readings.readings)) {
        const chIdx = parseInt(chIdxStr, 10);
        if (r.morpho) saveMorpho(chIdx, r.morpho as MorphoReading);
        if (r.sage) saveSage(chIdx, r.sage as SageReading);
        if (r.horizon) saveHorizon(chIdx, r.horizon as HorizonReading);
      }
    }

    try {
      localStorage.setItem(
        "origin.archive.unlocked",
        JSON.stringify(archive.unlocked),
      );
    } catch { /* noop */ }

    return { success: true, serverHasData };
  } catch {
    return { success: false, serverHasData: false };
  }
}

/* ─── Push (localStorage → server) ─────────────────────── */

/**
 * Push the current localStorage state to the server.
 * keepalive=true is passed on beforeunload to survive page unload.
 */
export async function pushAll(keepalive = false): Promise<void> {
  try {
    const responses = load();
    const tileIdx = getTileIdx();
    const streamEntries = getStreamEntries();
    const bodyEntries = getBodyEntries();
    const readings = getAllReadings();
    const archive = [...getUnlockedArchive()];
    const cumulative = getCumulative();

    await Promise.all([
      apiFetch("/state", { method: "PUT", body: JSON.stringify({ tileIdx, responses }) }, keepalive),
      apiFetch("/entries", {
        method: "PUT",
        body: JSON.stringify({ stream: streamEntries, body: bodyEntries }),
      }, keepalive),
      apiFetch("/readings", {
        method: "PUT",
        body: JSON.stringify({ readings, cumulative }),
      }, keepalive),
      apiFetch("/archive", { method: "PUT", body: JSON.stringify({ unlocked: archive }) }, keepalive),
    ]);
  } catch {
    /* silent — localStorage is source of truth for guests; server is best-effort */
  }
}

/**
 * Restore a previously captured local snapshot to localStorage, then push
 * to the server. Called when a user confirms "save journey" migration.
 * Restores ALL stores including readings and cumulative so no journey data is lost.
 */
export async function pushSnapshot(snapshot: LocalSnapshot): Promise<void> {
  // Restore every store from the snapshot — including readings and cumulative —
  // so the full pre-sign-in guest journey is preserved and pushed.
  setTileIdx(snapshot.tileIdx);
  const STORAGE = "origin.v1";
  try { localStorage.setItem(STORAGE, JSON.stringify(snapshot.responses)); } catch { /* noop */ }
  save("streamEntries", snapshot.stream);
  save("bodyEntries", snapshot.body);
  try {
    localStorage.setItem("origin.archive.unlocked", JSON.stringify(snapshot.archive));
    localStorage.setItem("origin.readings", JSON.stringify(snapshot.readings ?? {}));
    if (snapshot.cumulative) {
      localStorage.setItem("origin.cumulative", JSON.stringify(snapshot.cumulative));
    } else {
      localStorage.removeItem("origin.cumulative");
    }
  } catch { /* noop */ }
  await pushAll();
}

export async function pushTileIdx(tileIdx: number): Promise<void> {
  try {
    const responses = load();
    await apiFetch("/state", {
      method: "PUT",
      body: JSON.stringify({ tileIdx, responses }),
    });
  } catch { /* silent */ }
}

export async function hasServerData(): Promise<boolean> {
  try {
    const state = await apiFetch<ServerState>("/state");
    return state.tileIdx > 0 || Object.keys(state.responses).length > 0;
  } catch {
    return false;
  }
}
