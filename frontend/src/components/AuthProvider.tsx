"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  joinedAt: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserData: (key: string, value: any) => void;
  getUserData: (key: string) => any;
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true,
  login: async () => {}, register: async () => {},
  logout: () => {}, updateUserData: () => {}, getUserData: () => null,
});

// Simple hash for demo — in production use bcrypt on a real backend
function simpleHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h.toString(36);
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("qti_session");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const accounts: Record<string, any> = JSON.parse(localStorage.getItem("qti_accounts") || "{}");
    const key = email.toLowerCase();
    if (!accounts[key]) throw new Error("No account found. Please register.");
    if (accounts[key].hash !== simpleHash(password)) throw new Error("Incorrect password.");
    const u: User = accounts[key].user;
    setUser(u);
    localStorage.setItem("qti_session", JSON.stringify(u));
  }

  async function register(name: string, email: string, password: string) {
    const accounts: Record<string, any> = JSON.parse(localStorage.getItem("qti_accounts") || "{}");
    const key = email.toLowerCase();
    if (accounts[key]) throw new Error("An account with this email already exists.");
    const u: User = { id: generateId(), email: key, name, joinedAt: new Date().toISOString() };
    accounts[key] = { user: u, hash: simpleHash(password) };
    localStorage.setItem("qti_accounts", JSON.stringify(accounts));
    setUser(u);
    localStorage.setItem("qti_session", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("qti_session");
  }

  // Per-user data store (portfolio, alerts, subscriptions)
  function updateUserData(key: string, value: any) {
    if (!user) return;
    const store = JSON.parse(localStorage.getItem(`qti_data_${user.id}`) || "{}");
    store[key] = value;
    localStorage.setItem(`qti_data_${user.id}`, JSON.stringify(store));
  }

  function getUserData(key: string): any {
    if (!user) return null;
    try {
      const store = JSON.parse(localStorage.getItem(`qti_data_${user.id}`) || "{}");
      return store[key] ?? null;
    } catch { return null; }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserData, getUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
