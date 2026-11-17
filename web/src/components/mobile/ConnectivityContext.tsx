import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * PROTOTIPO MÓVIL · Simula la conexión del teléfono para mostrar el modo offline.
 * En la app nativa este estado lo da @react-native-community/netinfo.
 */
interface ConnectivityValue {
  offline: boolean;
  toggle: () => void;
}

const ConnectivityContext = createContext<ConnectivityValue>({ offline: false, toggle: () => undefined });

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [offline, setOffline] = useState(false);
  const value = useMemo(() => ({ offline, toggle: () => setOffline((current) => !current) }), [offline]);
  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export const useConnectivity = () => useContext(ConnectivityContext);
