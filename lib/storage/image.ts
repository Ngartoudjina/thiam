import { randomBytes } from 'node:crypto';

/**
 * Règles communes aux images téléversées, sans dépendance serveur lourde :
 * elles sont testées isolément et partagées par la route d'envoi et le script
 * d'import.
 */

export type ImageKind = 'jpeg' | 'png' | 'webp';

export const IMAGE_TYPES: Readonly<Record<ImageKind, { mime: string; extension: string }>> = {
  jpeg: { mime: 'image/jpeg', extension: 'jpg' },
  png: { mime: 'image/png', extension: 'png' },
  webp: { mime: 'image/webp', extension: 'webp' },
};

/**
 * Plafond d'un envoi. Le navigateur compresse avant l'envoi (2 000 px, WebP) :
 * une photo pèse alors quelques centaines de kilo-octets. Le plafond reste
 * sous la limite de 4,5 Mo d'une fonction Vercel.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const UPLOAD_FOLDERS = ['collections', 'pieces', 'gallery', 'content'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const isUploadFolder = (value: unknown): value is UploadFolder =>
  typeof value === 'string' && (UPLOAD_FOLDERS as readonly string[]).includes(value);

const startsWith = (bytes: Uint8Array, signature: readonly number[], offset = 0): boolean =>
  signature.every((byte, index) => bytes[offset + index] === byte);

/**
 * Nature réelle du fichier, lue dans ses premiers octets.
 *
 * Le type annoncé par le navigateur ne prouve rien : on refuse ainsi qu'un
 * document HTML ou SVG — qui pourrait porter du script — soit publié comme
 * une image sous le domaine du site.
 */
export function sniffImage(bytes: Uint8Array): ImageKind | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  // RIFF....WEBP
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'webp';
  }

  return null;
}

/** Segment de chemin sûr : minuscules, chiffres et tirets. */
export function safeSegment(value: string, fallback = 'divers'): string {
  const cleaned = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return cleaned || fallback;
}

/** Chemin d'un nouvel objet : jamais deux fois le même, jamais d'écrasement. */
export function buildObjectPath(folder: UploadFolder, scope: string, kind: ImageKind): string {
  const stamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex');

  return `${folder}/${safeSegment(scope)}/${stamp}-${random}.${IMAGE_TYPES[kind].extension}`;
}
