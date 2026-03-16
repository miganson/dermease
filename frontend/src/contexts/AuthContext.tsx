import { createContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { authApi } from "../api/endpoints";
import { loadStoredSession, persistSession } from "../lib/storage";
import type { AuthSession, User } from "../types/domain";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const user = await authApi.me();
        if (!active) {
          return;
        }

        const nextSession = session ? { ...session, user } : null;
        setSession(nextSession);
        persistSession(nextSession);
      } catch {
        if (active) {
          setSession(null);
          persistSession(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  async function login(payload: { email: string; password: string }) {
    const nextSession = await authApi.login(payload);
    setSession(nextSession);
    persistSession(nextSession);
  }

  async function register(payload: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
  }) {
    const nextSession = await authApi.register(payload);
    setSession(nextSession);
    persistSession(nextSession);
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setSession(null);
      persistSession(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        accessToken: session?.accessToken ?? null,
        refreshToken: session?.refreshToken ?? null,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

