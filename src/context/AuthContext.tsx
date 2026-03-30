import React, { createContext, useContext, useState, useMemo } from "react";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock user for development
const MOCK_USER: User = {
  id: "user-1",
  email: "greg@systechlimited.com",
  name: "Greg Atemi",
  avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=GA",
  addresses: [
    {
      id: "addr-1",
      line1: "14 Waiyaki Way",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00100",
      country: "KE",
      isDefault: true,
    },
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login: async (email: string, _password: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));
        setUser({ ...MOCK_USER, email });
        setIsLoading(false);
      },
      logout: () => setUser(null),
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
