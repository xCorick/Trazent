import { NativeTabs } from 'expo-router/native-tabs';
import { useOffline } from '@/offline';
import { colors } from '@/theme/tokens';
import { icons } from '@/ui';

/** Pestañas nativas (Material en Android, UITabBar en iOS). */
export default function TabsLayout() {
  const { pending } = useOffline();

  return (
    <NativeTabs tintColor={colors.blue700} backgroundColor={colors.white} indicatorColor={colors.blue100}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={icons.home.ios} md={icons.home.android} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="asistencia">
        <NativeTabs.Trigger.Label>Asistencia</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={icons.camera.ios} md={icons.camera.android} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tareas">
        <NativeTabs.Trigger.Label>Mis tareas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={icons.tasks.ios} md={icons.tasks.android} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={icons.profile.ios} md={icons.profile.android} />
        {pending.length > 0 && <NativeTabs.Trigger.Badge>{String(pending.length)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
