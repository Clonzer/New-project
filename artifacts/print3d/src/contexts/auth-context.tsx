import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/lib/auth-api";
import { authLogin, authLogout, authMe } from "@/lib/auth-api";
import { supabase } from "@/lib/supabase";

// Simple token storage
const setStoredAccessToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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
    // Initialize Supabase session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStoredAccessToken(session.access_token);
          try {
            const { user } = await authMe();
            setUser(user);
          } catch {
            setUser(null);
          }
        }
      } catch (error) {
        console.warn('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          setStoredAccessToken(session.access_token);
          try {
            const { user } = await authMe();
            setUser(user);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
          setStoredAccessToken(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.warn('Auth state change listener failed:', error);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const { token, user: u } = await authLogin(identifier, password);
      setStoredAccessToken(token);
      setUser(u);
      return u;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } finally {
      setStoredAccessToken(null);
      setUser(null);
    }
  }, []);

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
