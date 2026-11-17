import * as ImagePicker from 'expo-image-picker';

export type CameraFacing = 'front' | 'back';

/**
 * Abre la cámara y devuelve la URI local de la foto, o null si el usuario canceló.
 * Solo cámara (sin galería): la foto debe tomarse en el momento.
 */
export async function takePhoto(facing: CameraFacing = 'back'): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Sin permiso de cámara. Actívalo en los ajustes del teléfono.');
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.6,
    exif: false,
    cameraType: facing === 'front' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
  });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
