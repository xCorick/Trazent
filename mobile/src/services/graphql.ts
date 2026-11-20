import { env } from '@/config/env';
import { ApiError } from './apiError';
import { tokenStorage } from './tokenStorage';

const TIMEOUT_MS = 15_000;

/**
 * Marca un documento GraphQL. No transforma nada: sirve para que Prettier y el editor
 * lo reconozcan, y permite insertar fragmentos con `${...}`.
 */
export const gql = (strings: TemplateStringsArray, ...fragments: string[]) =>
  strings.reduce((text, part, index) => text + part + (fragments[index] ?? ''), '');

interface GraphQLErrorItem {
  message: string;
  extensions?: { code?: string };
}

/**
 * Códigos de error que la API pone en `errors[].extensions.code` (ver docs/api-graphql.md).
 * Se traducen a un estatus HTTP para que isRetryable() decida igual que antes.
 */
const STATUS_BY_CODE: Record<string, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  BAD_USER_INPUT: 422,
  GRAPHQL_PARSE_FAILED: 400,
  GRAPHQL_VALIDATION_FAILED: 400,
};

/** Ejecuta una query o mutation contra `<API>/graphql`. */
export async function graphql<TData>(document: string, variables?: object): Promise<TData> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = tokenStorage.getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${env.apiUrl}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: document, variables }),
      signal: controller.signal,
    });

    let body: { data?: TData | null; errors?: GraphQLErrorItem[] } | undefined;
    try {
      body = (await response.json()) as typeof body;
    } catch {
      // Respuesta sin JSON (por ejemplo, un error del proxy).
    }

    const error = body?.errors?.[0];
    if (error) {
      const code = error.extensions?.code ?? '';
      // Un código desconocido se trata como falla del servidor (se puede reintentar).
      throw new ApiError(error.message, STATUS_BY_CODE[code] ?? (response.ok ? 500 : response.status));
    }
    if (!response.ok) throw new ApiError(`Error ${response.status}`, response.status);
    if (!body?.data) throw new ApiError('La API no devolvió datos.', 500);
    // TODO: renovar el access token con el refresh token ante UNAUTHENTICATED.
    return body.data;
  } finally {
    clearTimeout(timeout);
  }
}
