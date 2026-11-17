import { deletePhoto } from '@/device/files';
import { attendanceService, evidenceService } from '@/services';
import { errorMessage, isRetryable } from '@/services/apiError';
import { outbox } from './outbox';
import type { OutboxItem } from './outbox';

export interface SyncResult {
  sent: number;
  /** Rechazados por la API (no se reintentan solos; se muestran al usuario). */
  rejected: number;
  /** Quedaron en cola porque se cortó la red o falló el servidor. */
  remaining: number;
}

async function send(item: OutboxItem): Promise<void> {
  if (item.kind === 'check-in') {
    await attendanceService.checkIn({ ...item.payload, capturedOffline: true });
    deletePhoto(item.payload.photoUri);
  } else {
    await evidenceService.upload(item.payload);
    deletePhoto(item.payload.fileUri);
  }
}

let running: Promise<SyncResult> | null = null;

/** Envía la cola en orden. Si ya hay una sincronización en curso, reutiliza esa. */
export function syncOutbox(): Promise<SyncResult> {
  running ??= (async () => {
    const items = await outbox.list();
    const result: SyncResult = { sent: 0, rejected: 0, remaining: 0 };

    for (const [index, item] of items.entries()) {
      // Los que la API ya rechazó esperan a que el usuario los revise.
      if (item.lastError) {
        result.rejected += 1;
        continue;
      }
      try {
        await send(item);
        await outbox.remove(item.id);
        result.sent += 1;
      } catch (error) {
        if (isRetryable(error)) {
          // Sin red o servidor caído: se detiene y reintenta en la siguiente sincronización.
          result.remaining = items.slice(index).filter((rest) => !rest.lastError).length;
          break;
        }
        await outbox.markFailed(item.id, errorMessage(error));
        result.rejected += 1;
      }
    }
    return result;
  })().finally(() => {
    running = null;
  });
  return running;
}
