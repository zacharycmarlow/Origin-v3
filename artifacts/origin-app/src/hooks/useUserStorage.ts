import { useAuth } from '../auth/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   useUserStorage — per-user localStorage namespace.

   When a user is logged in via Privy, all localStorage keys are
   prefixed with their user ID so each user has their own isolated
   app instance. When logged out, the app uses the default (guest)
   storage keys — preserving backward compatibility with existing
   guest data.

   This hook returns a storage namespace string that components can
   use to scope their reads/writes. When the namespace changes (user
   logs in/out), components should re-hydrate their state.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Returns a storage namespace prefix for the current user.
 * - Logged in: `privy:{userId}:` — each user gets isolated storage
 * - Guest: '' — uses default localStorage keys (backward compatible)
 */
export function useStorageNamespace(): string {
  const { user } = useAuth();
  return user ? `privy:${user.id}:` : '';
}

/**
 * Get a namespaced storage key for the current user.
 * Use this when reading/writing localStorage directly.
 */
export function useNamespacedKey(key: string): string {
  const ns = useStorageNamespace();
  return ns ? `${ns}${key}` : key;
}

/**
 * Migrate guest data to a user's namespace on first login.
 * Copies all origin.* and origin.v1 keys from guest storage to
 * the user's namespaced storage, so their existing journey carries
 * over when they sign in for the first time.
 */
export function migrateGuestToUser(userId: string): void {
  const prefix = `privy:${userId}:`;
  const guestKeys = [
    'origin.v1',
    'origin.tile',
    'origin.readings',
    'origin.codex',
    'origin.cumulative',
    'origin.archive.unlocked',
    'origin.body',
    'origin.stream',
    'origin.margins',
    'origin.synthesis',
    'origin.story',
    'origin.birth',
    'origin.pace',
    'origin.daily',
    'origin.streamEntries',
    'origin.bodyEntries',
  ];

  for (const key of guestKeys) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      const namespacedKey = `${prefix}${key}`;
      // Don't overwrite if the user already has data
      if (localStorage.getItem(namespacedKey) === null) {
        localStorage.setItem(namespacedKey, value);
      }
    }
  }
}
