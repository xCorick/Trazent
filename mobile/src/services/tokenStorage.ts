import * as SecureStore from 'expo-secure-store';
import type { LoginResponse } from '@/types';

/**
 * Sesión guardada en el almacén cifrado del sistema (Keystore en Android,
 * Keychain en iOS). Nunca en AsyncStorage, que no cifra.
 */
const KEY = 'trazent.session';

let cache: LoginResponse | null = null;

export const tokenStorage = {
  async read(): Promise<LoginResponse | null> {
    if (cache) return cache;
    const raw = await SecureStore.getItemAsync(KEY);
    cache = raw ? (JSON.parse(raw) as LoginResponse) : null;
    return cache;
  },
  async write(session: LoginResponse): Promise<void> {
    cache = session;
    await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  },
  async clear(): Promise<void> {
    cache = null;
    await SecureStore.deleteItemAsync(KEY);
  },
  getAccessToken: (): string | null => cache?.accessToken ?? null,
};
