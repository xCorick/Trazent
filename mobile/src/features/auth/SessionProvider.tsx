import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services';
import { tokenStorage } from '@/services/tokenStorage';
import type { LoginRequest, User } from '@/types';

interface SessionContextValue {
  user: User | null;
  /** true mientras se lee la sesión guardada al abrir la app. */
  restoring: boolean;
  login: (request: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    tokenStorage
      .read()
      .then((session) => {
        if (session) {
          authService.restoreSession(session.user);
          setUser(session.user);
        }
      })
      .catch(() => undefined) // Sesión ilegible: se pide iniciar sesión de nuevo.
      .finally(() => setRestoring(false));
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request);
    await tokenStorage.write(response);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Sin red también se puede cerrar sesión en el teléfono.
    } finally {
      await tokenStorage.clear();
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient]);

  const value = useMemo(() => ({ user, restoring, login, logout }), [user, restoring, login, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  return context;
}
