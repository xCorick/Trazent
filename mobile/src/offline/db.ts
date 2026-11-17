import * as SQLite from 'expo-sqlite';

/**
 * Base local del teléfono (SQLite). Por ahora solo guarda la cola de envíos
 * pendientes; más adelante puede guardar tareas y sitios para leerlos sin señal.
 */
const DB_NAME = 'trazent.db';
const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const version = row?.user_version ?? 0;

  // Migraciones locales en orden; cada una sube user_version.
  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS outbox (
        id          TEXT PRIMARY KEY NOT NULL,
        kind        TEXT NOT NULL,
        payload     TEXT NOT NULL,
        created_at  TEXT NOT NULL,
        attempts    INTEGER NOT NULL DEFAULT 0,
        last_error  TEXT
      );
      PRAGMA user_version = ${SCHEMA_VERSION};
    `);
  }
  return db;
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= open();
  return dbPromise;
}
