import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { usePrivy, useLogin, getAccessToken } from '@privy-io/react-auth';
import { setAuthToken } from '../api/userApi';

/* Privy's user type — accessed via the usePrivy hook. We use a loose
   type here since the exact shape depends on the SDK version. */
type PrivyUser = {
  id: string;
  email?: { address: string };
  phone?: { number: string };
  linkedAccounts?: Array<{ type: string; address?: string }>;
};

/* ═══════════════════════════════════════════════════════════════
   AuthContext — provides a unified auth interface for the app.

   Uses Privy for authentication. When a user is logged in, they get
   a unique profile and per-user storage namespace so each user has
   their own isolated app instance. When logged out, the app runs in
   guest mode with shared localStorage.

   Privy provides:
   - Email / phone / social login (Google, Twitter, etc.)
   - Embedded wallets for users who don't have one
   - User identity with a stable user ID

   The app secret is kept server-side only (in .env, not exposed to
   the browser). Only the public app ID is used in the frontend.
   ═══════════════════════════════════════════════════════════════ */

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
  walletAddress?: string;
}

interface AuthContextValue {
  ready: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
  /** Returns a short-lived Privy JWT for backend API calls. */
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  authenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  getAuthToken: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

/** Convert a Privy user to our unified AuthUser shape. */
function toAuthUser(privyUser: PrivyUser): AuthUser {
  const email = privyUser.email?.address;
  const phone = privyUser.phone?.number;
  // Privy provides linked accounts — get wallet if available
  const wallet = privyUser.linkedAccounts?.find(
    (a: any) => a.type === 'wallet',
  );
  return {
    id: privyUser.id,
    email,
    phone,
    name: email?.split('@')[0] || phone,
    walletAddress: wallet?.address,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, logout: privyLogout } = usePrivy();
  const { login: privyLogin } = useLogin();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      setUser(toAuthUser(privyUser));
    } else if (ready && !authenticated) {
      setUser(null);
    }
    // Keep the API module's token in sync with auth state.
    if (ready && !authenticated) {
      setAuthToken(null);
    }
  }, [ready, authenticated, privyUser]);

  // Fetch and cache the access token whenever the user is authenticated.
  useEffect(() => {
    if (!ready || !authenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!cancelled && token) setAuthToken(token);
      } catch { /* token refresh will retry */ }
    })();
    // Refresh token every 10 minutes (Privy tokens are short-lived).
    const interval = setInterval(async () => {
      try {
        const token = await getAccessToken();
        if (!cancelled && token) setAuthToken(token);
      } catch { /* noop */ }
    }, 10 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [ready, authenticated]);

  const login = useCallback(() => {
    privyLogin();
  }, [privyLogin]);

  const logout = useCallback(() => {
    privyLogout();
    setUser(null);
  }, [privyLogout]);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!authenticated) return null;
    try {
      return await getAccessToken();
    } catch {
      return null;
    }
  }, [authenticated]);

  return (
    <AuthContext.Provider value={{ ready, authenticated, user, login, logout, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}
