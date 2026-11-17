import { Directory, File, Paths } from 'expo-file-system';

/**
 * Las fotos de la cámara quedan en caché y el sistema puede borrarlas. Las que
 * esperan a sincronizarse se copian a documentos, que solo se borra a mano.
 */
const pendingDir = new Directory(Paths.document, 'pending-photos');

export async function persistPhoto(uri: string, id: string): Promise<string> {
  if (!pendingDir.exists) pendingDir.create({ intermediates: true });
  const source = new File(uri);
  const target = new File(pendingDir, `${id}${source.extension || '.jpg'}`);
  if (!target.exists) await source.copy(target);
  return target.uri;
}

/** Borra una foto pendiente cuando ya se envió. Si no existe, no hace nada. */
export function deletePhoto(uri: string): void {
  if (!uri.startsWith(pendingDir.uri)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
