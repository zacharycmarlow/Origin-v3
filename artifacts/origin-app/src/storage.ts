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

// Map legacy energyCenter strings to current zone ids, so entries written
// before the zoneId field existed still resolve to a body zone.
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
      if (mapped) {
        mutated = true;
        return { ...e, zoneId: mapped };
      }
      // Unknown legacy center — park on heart so it stays visible.
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
    chapter,
    text: text.trim(),
    timestamp: Date.now(),
  };
  const list = getStreamEntries();
  list.push(entry);
  save('streamEntries', list);
  return entry;
}

export function addBodyEntry(zoneId: string, zoneName: string, chapter: number, note: string): BodyEntry {
  const entry: BodyEntry = {
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    zoneId,
    energyCenter: zoneName,
    chapter,
    note: note.trim(),
    timestamp: Date.now(),
  };
  const list = getBodyEntries();
  list.push(entry);
  save('bodyEntries', list);
  return entry;
}

export function deleteBodyEntry(id: string): void {
  save('bodyEntries', getBodyEntries().filter(e => e.id !== id));
}
