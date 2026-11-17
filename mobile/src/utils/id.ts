import * as Crypto from 'expo-crypto';

/** UUID v4 generado en el teléfono (clientId de asistencias y evidencias). */
export const newId = (): string => Crypto.randomUUID();
