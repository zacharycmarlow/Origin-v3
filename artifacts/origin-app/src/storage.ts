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
