/**
 * "Continue where you left off" persistence.
 *
 * Saves / restores the last tile index (or scroll position) to localStorage
 * under the key "origin.lastPosition" so the app can resume the user's place
 * on next visit.
 */
const KEY = "origin.lastPosition";

/**
 * Persist the current tile index (or scroll position) to localStorage.
 */
export function savePosition(tileIdx: number): void {
  try {
    localStorage.setItem(KEY, String(tileIdx));
  } catch {
    /* localStorage may be unavailable (private mode / quota) — ignore */
  }
}

/**
 * Read the last saved position, or null if none has been recorded.
 */
export function getPosition(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Clear the saved position (e.g. after a full reset).
 */
export function clearPosition(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
