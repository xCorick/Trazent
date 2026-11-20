import { Stack } from 'expo-router';
import { useSession } from '@/features/auth';
import { usePushRegistration } from '@/features/notifications';
import { OfflineProvider } from '@/offline';
import { colors } from '@/theme/tokens';

/**
 * Pantallas con sesión. La cola sin conexión y el registro de notificaciones viven
 * aquí: solo funcionan cuando hay un contratista con sesión iniciada.
 */
export default function AppLayout() {
  const { user } = useSession();
  usePushRegistration(user?.id);

  return (
    <OfflineProvider>
      <Stack
        screenOptions={{
          headerTintColor: colors.blue700,
          headerTitleStyle: { color: colors.text },
          headerBackTitle: 'Atrás',
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tarea/[taskId]" options={{ title: 'Detalle de la tarea' }} />
      </Stack>
    </OfflineProvider>
  );
}
