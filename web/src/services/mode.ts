import { env } from '@/config/env';

/**
 * true mientras se trabaja con los datos simulados de src/mocks (VITE_USE_MOCKS).
 * Es una herramienta de desarrollo: se quita cuando todas las consultas usen la API.
 */
export const mocksEnabled = env.useMocks;
