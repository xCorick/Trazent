import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';
import { outbox } from './outbox';
import type { OutboxItem } from './outbox';
import { syncOutbox } from './sync';

interface OfflineContextValue {
  /** Hay red y no se está simulando la pérdida de señal. */
  online: boolean;
  /** Solo para demostraciones: fuerza el modo sin conexión. */
  simulatedOffline: boolean;
  setSimulatedOffline: (value: boolean) => void;
  pending: OutboxItem[];
  syncing: boolean;
  lastSyncAt: string | null;
  syncNow: () => Promise<void>;
  /** Vuelve a leer la cola (después de guardar algo sin conexión). */
  refreshPending: () => Promise<void>;
  discard: (id: string) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(true);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [pending, setPending] = useState<OutboxItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const online = connected && !simulatedOffline;
  const onlineRef = useRef(online);
  useEffect(() => {
    onlineRef.current = online;
  }, [online]);

  const refreshPending = useCallback(async () => {
    setPending(await outbox.list());
  }, []);

  const syncNow = useCallback(async () => {
    if (!onlineRef.current) return;
    setSyncing(true);
    try {
      const result = await syncOutbox();
      if (result.sent > 0) {
        // Lo enviado ya existe en el servidor: refresca asistencias, tareas y evidencias.
        await queryClient.invalidateQueries();
      }
      setLastSyncAt(new Date().toISOString());
    } finally {
      await refreshPending();
      setSyncing(false);
    }
  }, [queryClient, refreshPending]);

  const discard = useCallback(
    async (id: string) => {
      await outbox.remove(id);
      await refreshPending();
    },
    [refreshPending],
  );

  // Estado de la red del teléfono.
  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        setConnected(state.isConnected !== false && state.isInternetReachable !== false);
      }),
    [],
  );

  // Al recuperar la señal, sincroniza.
  useEffect(() => {
    if (online) void syncNow();
  }, [online, syncNow]);

  // Al volver a abrir la app, también.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') void syncNow();
    });
    return () => subscription.remove();
  }, [syncNow]);

  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  const value = useMemo<OfflineContextValue>(
    () => ({
      online,
      simulatedOffline,
      setSimulatedOffline,
      pending,
      syncing,
      lastSyncAt,
      syncNow,
      refreshPending,
      discard,
    }),
    [online, simulatedOffline, pending, syncing, lastSyncAt, syncNow, refreshPending, discard],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline debe usarse dentro de <OfflineProvider>.');
  return context;
}
