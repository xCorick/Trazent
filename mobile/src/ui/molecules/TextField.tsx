import { StyleSheet, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme/tokens';
import { AppText } from '../atoms';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, multiline, ...props }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null, style]}
      />
      {error && (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    fontSize: fontSize.body,
    color: colors.text,
  },
  multiline: { minHeight: 90, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
});
