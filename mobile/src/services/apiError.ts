export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Error que vale la pena reintentar más tarde: sin red, tiempo agotado, sesión
 * vencida (se reintenta al volver a iniciar sesión) o falla del servidor.
 */
export function isRetryable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true; // fetch lanza TypeError cuando no hay red.
  return error.status === 401 || error.status === 408 || error.status === 429 || error.status >= 500;
}

/** Mensaje legible para mostrar al usuario. */
export function errorMessage(error: unknown, fallback = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
