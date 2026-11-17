import { Stack } from 'expo-router';
import { OfflineProvider } from '@/offline';
import { colors } from '@/theme/tokens';

/**
 * Pantallas con sesión. La cola sin conexión vive aquí: solo sincroniza
 * cuando hay un contratista con sesión iniciada.
 */
export default function AppLayout() {
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
