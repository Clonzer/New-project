import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setStoredAccessToken, type User } from "@workspace/api-client-react";
import { authLogin, authLogout, authMe } from "@/lib/auth-api";

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: u } = await authMe();
      setUser(u);
    } catch {
      setUser(null);
      setStoredAccessToken(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: u } = await authMe();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) {
          setUser(null);
          setStoredAccessToken(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: u } = await authLogin(email, password);
      setStoredAccessToken(token);
      setUser(u);
      await queryClient.invalidateQueries();
      return u;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } finally {
      setStoredAccessToken(null);
      setUser(null);
      await queryClient.invalidateQueries();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
