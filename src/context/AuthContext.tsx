import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "@/types";
import { apiFetch, getTokens, setTokens, clearTokens, getDeviceId } from "@/services/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobile: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedFields: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "admin_panel_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on mount
  useEffect(() => {
    async function restoreSession() {
      const { accessToken } = getTokens();
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // Try to load cached user profile first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      try {
        // Fetch fresh profile from API
        const profileRes = await apiFetch("/admin/profile");
        if (profileRes && profileRes.data) {
          const profileData = profileRes.data;
          const authUser: AuthUser = {
            id: profileData._id || profileData.id,
            name: profileData.name,
            email: profileData.email,
            mobile: profileData.mobile,
            profileImage: profileData.profileImage,
            role: "Admin",
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          setUser(authUser);
        }
      } catch (err) {
        console.error("Failed to restore session, user might be unauthenticated:", err);
        // If profile fetch fails completely, we clear tokens
        const { accessToken: tokenAfterFetch } = getTokens();
        if (!tokenAfterFetch) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Listen to API-triggered logouts (e.g. when token refresh fails)
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      clearTokens();
    };

    window.addEventListener("auth-logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, []);

  const login: AuthContextValue["login"] = async (mobile, password) => {
    try {
      const numericMobile = Number(mobile.replace(/\D/g, ""));
      if (isNaN(numericMobile) || !numericMobile) {
        return { ok: false, error: "Please enter a valid mobile number." };
      }

      const res = await apiFetch("/admin/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          mobile: numericMobile,
          password,
          deviceInfo: {
            deviceId: getDeviceId(),
            platform: "web",
          },
        }),
      });

      if (res && res.data) {
        const { accessToken, refreshToken, admin } = res.data;
        setTokens(accessToken, refreshToken);

        const authUser: AuthUser = {
          id: admin.id || admin._id,
          name: admin.name,
          email: admin.email,
          mobile: numericMobile,
          role: "Admin",
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        setUser(authUser);
        return { ok: true };
      }

      return { ok: false, error: res.message || "Invalid credentials." };
    } catch (err: any) {
      return { ok: false, error: err.message || "Connection error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      // Call API logout (non-blocking, we clear local tokens immediately anyway)
      await apiFetch("/admin/logout", {
        method: "POST",
        body: JSON.stringify({
          deviceId: getDeviceId(),
        }),
      }).catch((e) => console.error("Error calling logout API:", e));
    } finally {
      clearTokens();
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  };

  const updateUser = (updatedFields: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
