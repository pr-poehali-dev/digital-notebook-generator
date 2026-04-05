import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, apiMe, apiLogout } from "@/lib/api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, setUser: () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiMe().then((u) => { setUser(u); setLoading(false); });
  }, []);

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, setUser, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
