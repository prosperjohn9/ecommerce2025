import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const USER_LIST_KEY = 'authUsers'; // array of users
const CURRENT_USER_KEY = 'authUser'; // current session user

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => readJson(USER_LIST_KEY, []));
  const [user, setUser] = useState(() => readJson(CURRENT_USER_KEY, null));

  useEffect(() => {
    writeJson(USER_LIST_KEY, users);
  }, [users]);

  useEffect(() => {
    if (user) writeJson(CURRENT_USER_KEY, user);
    else localStorage.removeItem(CURRENT_USER_KEY);
  }, [user]);

  const signup = ({ username, email, password }) => {
    const u = username.trim();
    const e = email.trim().toLowerCase();
    const p = password;

    if (u.length < 3)
      return { ok: false, message: 'Username must be at least 3 characters.' };
    if (!e.includes('@'))
      return { ok: false, message: 'Please enter a valid email.' };
    if (p.length < 6)
      return { ok: false, message: 'Password must be at least 6 characters.' };

    const usernameTaken = users.some(
      (x) => x.username.toLowerCase() === u.toLowerCase()
    );
    if (usernameTaken)
      return { ok: false, message: 'Username is already taken.' };

    const emailTaken = users.some((x) => x.email === e);
    if (emailTaken)
      return {
        ok: false,
        message: 'An account with this email already exists.',
      };

    const newUser = {
      id: crypto.randomUUID(),
      username: u,
      email: e,
      password: p,
    };
    setUsers((prev) => [...prev, newUser]);

    // auto login after signup (like many sites)
    setUser({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    return { ok: true };
  };

  const login = ({ identifier, password }) => {
    const ident = identifier.trim().toLowerCase();
    const p = password;

    const found = users.find(
      (x) => x.email === ident || x.username.toLowerCase() === ident
    );

    if (!found) return { ok: false, message: 'Account not found.' };
    if (found.password !== p)
      return { ok: false, message: 'Incorrect password.' };

    setUser({ id: found.id, username: found.username, email: found.email });
    return { ok: true };
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, users, signup, login, logout }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
