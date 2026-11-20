import { useEffect } from 'react';
import { Platform } from 'react-native';
import { getExpoPushToken } from '@/device/notifications';
import { deviceService } from '@/services';
import { DevicePlatform } from '@/types';

/**
 * Registra el token de notificaciones del teléfono en la API para el usuario con sesión.
 * Sin permiso o sin red no pasa nada: se vuelve a intentar al abrir la app.
 */
export function usePushRegistration(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getExpoPushToken();
        if (!token || cancelled) return;
        await deviceService.registerToken({
          token,
          platform: Platform.OS === 'ios' ? DevicePlatform.IOS : DevicePlatform.Android,
        });
      } catch (error) {
        console.warn('No se pudo registrar el token de notificaciones.', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);
}
