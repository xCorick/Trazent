/**
 * Configuración leída de las variables de entorno de Vite (.env).
 * Mientras no exista la API, el prototipo usa los datos simulados.
 */
export const env = {
  apiUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''),
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
} as const;
