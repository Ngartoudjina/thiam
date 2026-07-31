'use client';

export interface CompressedImage {
  readonly blob: Blob;
  readonly width: number;
  readonly height: number;
  readonly extension: 'webp' | 'jpg';
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const MAX_EDGE = 2000;
const QUALITY = 0.86;

const supportsWebp = (): boolean => {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

/**
 * Compression et redimensionnement dans le navigateur, via `createImageBitmap`
 * et un canvas hors écran.
 *
 * Les photos de bijoux sortent souvent d'un téléphone à 4 000 px et 6 Mo : on
 * les ramène à 2 000 px sur le grand côté et en WebP. Le fichier envoyé pèse
 * alors quelques centaines de kilo-octets, sans dépendance externe et sans
 * jamais transiter par le serveur Next.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Le navigateur n’a pas pu préparer l’image.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const useWebp = supportsWebp();
  const mimeType = useWebp ? 'image/webp' : 'image/jpeg';

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, QUALITY);
  });

  if (!blob) throw new Error('La compression de l’image a échoué.');

  return { blob, width, height, extension: useWebp ? 'webp' : 'jpg' };
}

/** Contrôle de recevabilité avant toute manipulation coûteuse. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return 'Formats acceptés : JPG, PNG ou WEBP.';
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return 'Ce fichier dépasse 10 Mo.';
  }

  return null;
}
