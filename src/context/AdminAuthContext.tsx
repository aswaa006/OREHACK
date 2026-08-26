import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getAdminUser,
  setAdminToken,
  setAdminUser,
  clearAdminSession,
  loginAdmin as apiLogin,
  type AdminUser,
} from "@/lib/admin-api";

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // BYPASS AUTH FOR TESTING
    const bypassUser: AdminUser = { id: "bypass-admin-id", email: "admin@orehack.com", role: "SUPER_ADMIN" };
    setUser(bypassUser);
    setAdminToken("bypass-token");
    setAdminUser(bypassUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: userData } = await apiLogin(email, password);
    setAdminToken(token);
    setAdminUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
