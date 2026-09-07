/**
 * IndexedDB storage wrapper using idb-keyval.
 *
 * Provides the same get/set interface as the existing localStorage helpers
 * in src/storage.ts, so callers can switch over incrementally.
 *
 * All keys are namespaced under the "origin." prefix to mirror the
 * localStorage convention used throughout the app.
 */
import { get as idbGet, set as idbSet, del as idbDel, clear as idbClear, keys as idbKeys } from "idb-keyval";

const PREFIX = "origin.";

function namespaced(key: string): string {
  return key.startsWith(PREFIX) ? key : PREFIX + key;
}

/** Retrieve a value from IndexedDB, returning null when absent. */
export async function idbLoad<T = unknown>(key: string): Promise<T | null> {
  try {
    const val = await idbGet(namespaced(key));
    return (val === undefined ? null : val) as T | null;
  } catch {
    return null;
  }
}

/** Store a value in IndexedDB. */
export async function idbSave(key: string, value: unknown): Promise<void> {
  try {
    await idbSet(namespaced(key), value);
  } catch {
    /* swallow quota / availability errors */
  }
}

/** Remove a single key from IndexedDB. */
export async function idbRemove(key: string): Promise<void> {
  try {
    await idbDel(namespaced(key));
  } catch {
    /* ignore */
  }
}

/** Wipe all origin-namespaced entries from IndexedDB. */
export async function idbResetAll(): Promise<void> {
  try {
    const allKeys = await idbKeys();
    await Promise.all(
      allKeys
        .filter((k) => String(k).startsWith(PREFIX))
        .map((k) => idbDel(k)),
    );
  } catch {
    /* ignore */
  }
}

/** Convenience: mirror of storage.getTileIdx but async/IDB-backed. */
export async function idbGetTileIdx(): Promise<number> {
  const val = await idbLoad<number>("origin.tile");
  return typeof val === "number" && Number.isFinite(val) ? val : 0;
}

/** Convenience: mirror of storage.setTileIdx but async/IDB-backed. */
export async function idbSetTileIdx(idx: number): Promise<void> {
  await idbSave("origin.tile", idx);
}
