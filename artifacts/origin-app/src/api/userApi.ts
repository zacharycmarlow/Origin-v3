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

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

/* ─── Pull (server → localStorage) ─────────────────────── */

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

export async function pullAll(): Promise<boolean> {
  try {
    const [state, entries, readings, archive] = await Promise.all([
      apiFetch<ServerState>("/state"),
      apiFetch<ServerEntries>("/entries"),
      apiFetch<ServerReadings>("/readings"),
      apiFetch<ServerArchive>("/archive"),
    ]);

    const localTile = getTileIdx();
    const serverTile = state.tileIdx ?? 0;
    const maxTile = Math.max(localTile, serverTile);
    setTileIdx(maxTile);

    const localResponses = load();
    const merged = { ...state.responses, ...localResponses };
    const STORAGE = "origin.v1";
    try { localStorage.setItem(STORAGE, JSON.stringify(merged)); } catch { /* noop */ }

    if (entries.stream.length > 0) {
      const localStream = getStreamEntries();
      const allStream = mergeById([...entries.stream, ...localStream]);
      save("streamEntries", allStream);
    }
    if (entries.body.length > 0) {
      const localBody = getBodyEntries();
      const allBody = mergeById([...entries.body, ...localBody]);
      save("bodyEntries", allBody);
    }

    if (readings.readings) {
      const serverReadings = readings.readings;
      for (const [chIdxStr, r] of Object.entries(serverReadings)) {
        const chIdx = parseInt(chIdxStr, 10);
        if (r.morpho) saveMorpho(chIdx, r.morpho as MorphoReading);
        if (r.sage) saveSage(chIdx, r.sage as SageReading);
        if (r.horizon) saveHorizon(chIdx, r.horizon as HorizonReading);
      }
    }
    if (readings.cumulative) {
      saveCumulative(readings.cumulative);
    }

    if (archive.unlocked.length > 0) {
      const existing = getUnlockedArchive();
      for (const id of archive.unlocked) existing.add(id);
      try { localStorage.setItem("origin.archive.unlocked", JSON.stringify([...existing])); } catch { /* noop */ }
    }

    return true;
  } catch {
    return false;
  }
}

function mergeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return [...map.values()];
}

/* ─── Push (localStorage → server) ─────────────────────── */

export async function pushAll(): Promise<void> {
  try {
    const responses = load();
    const tileIdx = getTileIdx();
    const streamEntries = getStreamEntries();
    const bodyEntries = getBodyEntries();
    const readings = getAllReadings();
    const archive = [...getUnlockedArchive()];
    const cumulative = getCumulative();

    await Promise.all([
      apiFetch("/state", { method: "PUT", body: JSON.stringify({ tileIdx, responses }) }),
      apiFetch("/entries", {
        method: "PUT",
        body: JSON.stringify({ stream: streamEntries, body: bodyEntries }),
      }),
      apiFetch("/readings", {
        method: "PUT",
        body: JSON.stringify({ readings, cumulative }),
      }),
      apiFetch("/archive", { method: "PUT", body: JSON.stringify({ unlocked: archive }) }),
    ]);
  } catch {
    /* silent — localStorage is source of truth */
  }
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
