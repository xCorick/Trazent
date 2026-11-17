import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { initials } from '@/utils/format';
import { AppText } from './AppText';

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <AppText variant="label" tone="inverse" style={{ fontSize: size * 0.38 }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.blue700, alignItems: 'center', justifyContent: 'center' },
});
