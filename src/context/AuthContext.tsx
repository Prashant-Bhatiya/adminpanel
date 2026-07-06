import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "admin_panel_auth_user";

// Demo credentials — wire this up to your real API in login() below.
const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "admin123";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    // Simulate network latency. Replace this block with a real fetch()
    // call to your backend's /auth/login endpoint.
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const authUser: AuthUser = {
        id: "u_1",
        name: "Alex Morgan",
        email: DEMO_EMAIL,
        role: "Administrator",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return { ok: true };
    }

    return { ok: false, error: "Invalid email or password." };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
