/**
 * Configuración por entorno. Expo solo expone al código las variables que
 * empiezan con EXPO_PUBLIC_ (ver .env.example).
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000',
  /** Mientras no exista la API, la app usa datos simulados en memoria. */
  useMocks: process.env.EXPO_PUBLIC_USE_MOCKS !== 'false',
} as const;
