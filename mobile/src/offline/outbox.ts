import type { CheckInRequest, UploadEvidenceRequest } from '@/types';
import { getDb } from './db';

/**
 * Patrón outbox: lo que se captura sin señal se guarda aquí y sync.ts lo envía
 * en orden al volver la conexión. El id de cada fila es el clientId de la
 * operación, así que la API no duplica si un envío se repite.
 */

export type OutboxItem =
  | { id: string; kind: 'check-in'; payload: CheckInRequest; createdAt: string; attempts: number; lastError?: string }
  | {
      id: string;
      kind: 'evidence';
      payload: UploadEvidenceRequest;
      createdAt: string;
      attempts: number;
      lastError?: string;
    };

export type OutboxKind = OutboxItem['kind'];

interface OutboxRow {
  id: string;
  kind: OutboxKind;
  payload: string;
  created_at: string;
  attempts: number;
  last_error: string | null;
}

const fromRow = (row: OutboxRow): OutboxItem =>
  ({
    id: row.id,
    kind: row.kind,
    payload: JSON.parse(row.payload) as unknown,
    createdAt: row.created_at,
    attempts: row.attempts,
    lastError: row.last_error ?? undefined,
  }) as OutboxItem;

export const outbox = {
  async enqueue(item: Pick<OutboxItem, 'kind' | 'payload'> & { id: string }): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR IGNORE INTO outbox (id, kind, payload, created_at) VALUES (?, ?, ?, ?)',
      item.id,
      item.kind,
      JSON.stringify(item.payload),
      new Date().toISOString(),
    );
  },

  async list(): Promise<OutboxItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<OutboxRow>('SELECT * FROM outbox ORDER BY created_at ASC');
    return rows.map(fromRow);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM outbox WHERE id = ?', id);
  },

  async markFailed(id: string, error: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?', error, id);
  },
};
