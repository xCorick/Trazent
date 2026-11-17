import type { User } from '@/types';

/** Sesión guardada en el navegador (tokens + usuario). */
export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const KEY = 'trazent.session';

export const tokenStorage = {
  read(): StoredSession | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  },
  write(session: StoredSession) {
    try {
      localStorage.setItem(KEY, JSON.stringify(session));
    } catch {
      // Navegación privada o almacenamiento bloqueado: la sesión dura lo que la pestaña.
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nada que limpiar.
    }
  },
  getAccessToken(): string | null {
    return tokenStorage.read()?.accessToken ?? null;
  },
};
