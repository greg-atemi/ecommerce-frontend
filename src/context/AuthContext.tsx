import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/api/authApi";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  avatarUrl?: string;
  addresses?: {
    line1: string;
    city: string;
    state: string;
    country: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;   // ← added
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const restored = getUserFromToken(token);
      if (restored) setUser(restored);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem("accessToken", data.accessToken);
      // ✅ Bug 1 fix — decode token instead of setUser({ email })
      const decoded = getUserFromToken(data.accessToken);
      if (decoded) setUser(decoded);
    } catch (err: any) {
      throw new Error(err.response?.data?.message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const { data } = await authApi.register({ firstName, lastName, email, password });
      localStorage.setItem("accessToken", data.accessToken);
      // ✅ Same fix for register
      const decoded = getUserFromToken(data.accessToken);
      if (decoded) setUser(decoded);
    } catch (err: any) {
      throw new Error(err.response?.data?.message ?? "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,   // ← derived, never stale
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function getUserFromToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id ?? payload.userId ?? payload.sub,  // add this
      email: payload.sub,
      firstName: payload.firstName ?? "",
      lastName: payload.lastName ?? "",
      name: `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
      role: payload.role ?? "USER",
      avatarUrl: undefined,
      addresses: [],
    };
  } catch {
    return null;
  }
}