import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authAPI from '../api/authAPI';
import { errorMessage } from '../api/client';

const AuthContext = createContext(null);

// Older versions of this app kept accounts (with plaintext passwords) and orders
// in localStorage. Delete them from any browser that still has them.
const LEGACY_KEYS = ['authUsers', 'authUser', 'orders'];

function removeLegacyData() {
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage can be blocked (private mode); nothing to clean up then.
    }
  }
}

// The session lives on the server behind an HttpOnly cookie. The browser only
// keeps the signed-in user's public profile in memory: no passwords, no tokens.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    removeLegacyData();

    let active = true;
    authAPI
      .fetchCurrentUser()
      .then((current) => active && setUser(current))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const signup = useCallback(async ({ displayName, email, password }) => {
    try {
      setUser(await authAPI.register({ displayName, email, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: errorMessage(error, 'Sign up failed.') };
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      setUser(await authAPI.login({ email, password }));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: errorMessage(error, 'Login failed.') };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signup, login, logout }),
    [user, loading, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
