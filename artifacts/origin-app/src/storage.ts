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
}

export interface BodyEntry {
  id: string;
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

export function getBodyEntries(): BodyEntry[] {
  const entries = load()['bodyEntries'];
  return Array.isArray(entries) ? (entries as BodyEntry[]) : [];
}

export function getStreamEntries(): StreamEntry[] {
  const entries = load()['streamEntries'];
  return Array.isArray(entries) ? (entries as StreamEntry[]) : [];
}

export function deleteStreamEntry(id: string): void {
  save('streamEntries', getStreamEntries().filter(e => e.id !== id));
}
