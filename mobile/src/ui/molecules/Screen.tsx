import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';

interface ScreenProps {
  children: ReactNode;
  /** Las pantallas con encabezado nativo (Stack) no necesitan el margen superior. */
  withHeader?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Contenido fijo abajo (p. ej. el botón principal de un formulario). */
  footer?: ReactNode;
}

/** Contenedor base de cada pantalla: área segura, scroll y "jalar para actualizar". */
export function Screen({ children, withHeader = false, refreshing = false, onRefresh, footer }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={withHeader ? ['left', 'right'] : ['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue700} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
