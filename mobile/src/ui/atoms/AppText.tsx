import { StyleSheet, Text } from 'react-native';
import type { TextProps } from 'react-native';
import { colors, fontSize } from '@/theme/tokens';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'small' | 'caption';
type TextTone = 'default' | 'muted' | 'primary' | 'inverse' | 'danger';

interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: TextTone;
}

const toneColor: Record<TextTone, string> = {
  default: colors.text,
  muted: colors.muted,
  primary: colors.blue700,
  inverse: colors.white,
  danger: colors.danger,
};

/** Texto con la tipografía de la app. Úsalo en lugar de <Text> directo. */
export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  return <Text {...props} style={[styles[variant], { color: toneColor[tone] }, style]} />;
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.title, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: fontSize.heading, fontWeight: '700' },
  body: { fontSize: fontSize.body, lineHeight: 22 },
  label: { fontSize: fontSize.small, fontWeight: '600' },
  small: { fontSize: fontSize.small, lineHeight: 20 },
  caption: { fontSize: fontSize.caption, lineHeight: 17 },
});
