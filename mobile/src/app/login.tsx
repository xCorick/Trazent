import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm } from '@/features/auth';
import { colors, radius, spacing } from '@/theme/tokens';
import { AppText, Icon } from '@/ui';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Icon name="pin" size={28} color={colors.white} />
            </View>
            <AppText variant="title">Trazent</AppText>
            <AppText variant="small" tone="muted" style={styles.center}>
              Registra tu asistencia, consulta tus tareas y sube tus evidencias.
            </AppText>
          </View>

          <LoginForm />

          <AppText variant="caption" tone="muted" style={styles.center}>
            ¿Eres administrador o supervisor? Usa el panel web.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  brand: { alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.blue700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});
