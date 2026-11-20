import { File, UploadType } from 'expo-file-system';
import { ApiError } from './apiError';
import { gql, graphql } from './graphql';

/**
 * Subida directa y firmada a Cloudinary (patrón Valet Key): la API solo firma y
 * después verifica; la foto nunca pasa por la API.
 *   1. createSignature → la API devuelve la firma y el public_id (derivado del clientId).
 *   2. POST multipart directo a Cloudinary con esos mismos campos.
 *   3. El llamador registra la asistencia o evidencia con el public_id (photoKey / fileKey).
 * Como el public_id depende del clientId, repetir la subida sobrescribe la misma foto.
 */

export type UploadKind = 'ATTENDANCE' | 'EVIDENCE';

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  /** Tipo de entrega de Cloudinary; "authenticated" = fotos privadas. */
  deliveryType: string;
}

const CREATE_SIGNATURE = gql`
  mutation CreateUploadSignature($input: UploadSignatureInput!) {
    uploads {
      createSignature(input: $input) {
        cloudName
        apiKey
        timestamp
        signature
        folder
        publicId
        deliveryType
      }
    }
  }
`;

/** Sube una foto local y devuelve su public_id en Cloudinary. */
export async function uploadImage(kind: UploadKind, clientId: string, localUri: string): Promise<string> {
  const { uploads } = await graphql<{ uploads: { createSignature: UploadSignature } }>(CREATE_SIGNATURE, {
    input: { kind, clientId },
  });
  const sig = uploads.createSignature;

  const result = await new File(localUri).upload(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType: 'image/jpeg',
    // Exactamente los campos firmados por la API, más api_key y signature.
    parameters: {
      api_key: sig.apiKey,
      timestamp: String(sig.timestamp),
      signature: sig.signature,
      folder: sig.folder,
      public_id: sig.publicId,
      type: sig.deliveryType,
    },
  });

  if (result.status < 200 || result.status >= 300) {
    let message = `Cloudinary respondió ${result.status}`;
    try {
      message = (JSON.parse(result.body) as { error?: { message?: string } }).error?.message ?? message;
    } catch {
      // Cuerpo sin JSON.
    }
    // 4xx = firma o archivo inválido (no se reintenta solo); 5xx = se reintenta.
    throw new ApiError(message, result.status);
  }

  const { public_id } = JSON.parse(result.body) as { public_id: string };
  return public_id;
}
