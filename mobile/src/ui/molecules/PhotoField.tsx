import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { takePhoto } from '@/device/camera';
import type { CameraFacing } from '@/device/camera';
import { errorMessage } from '@/services/apiError';
import { colors, radius, spacing } from '@/theme/tokens';
import { AppButton, AppText, Icon } from '../atoms';

interface PhotoFieldProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  label: string;
  facing?: CameraFacing;
}

/** Toma una foto con la cámara (sin galería) y muestra la vista previa. */
export function PhotoField({ value, onChange, label, facing = 'back' }: PhotoFieldProps) {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setOpening(true);
    try {
      const uri = await takePhoto(facing);
      if (uri) onChange(uri);
    } catch (error) {
      Alert.alert('Cámara', errorMessage(error));
    } finally {
      setOpening(false);
    }
  };

  if (value) {
    return (
      <View style={styles.previewBox}>
        <Image source={{ uri: value }} style={styles.preview} contentFit="cover" accessibilityLabel="Foto tomada" />
        <AppButton label="Tomar otra" variant="secondary" size="md" icon="camera" onPress={() => void open()} />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void open()}
      disabled={opening}
      style={({ pressed }) => [styles.empty, pressed && styles.pressed]}
    >
      <Icon name="camera" size={30} color={colors.blue700} />
      <AppText variant="label" tone="primary">
        {opening ? 'Abriendo cámara…' : label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 150,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.blue500,
    backgroundColor: colors.blue50,
  },
  pressed: { opacity: 0.8 },
  previewBox: { gap: spacing.sm },
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, backgroundColor: colors.grayBg },
});
