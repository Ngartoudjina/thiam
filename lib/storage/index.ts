import 'server-only';

import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { del, put } from '@vercel/blob';

/**
 * Stockage des images téléversées depuis le tableau de bord.
 *
 * Deux pilotes, une seule interface :
 *
 * - `blob`  — Vercel Blob, en production. Les fichiers sont servis par le CDN
 *             de Vercel, sous une adresse publique et immuable.
 * - `local` — un dossier du disque, servi par la route `/media/…`. Pour le
 *             développement, ou un hébergement sur serveur classique.
 *
 * Le choix suit l'environnement : `STORAGE_DRIVER` s'il est renseigné, sinon
 * Vercel Blob dès qu'un jeton est présent, sinon le disque hors production.
 */

export type StorageDriver = 'blob' | 'local';

const LOCAL_URL_PREFIX = '/media/';

export function storageDriver(): StorageDriver | null {
  const explicit = process.env.STORAGE_DRIVER?.trim();
  if (explicit === 'blob' || explicit === 'local') return explicit;

  // Jeton classique, ou connexion OIDC de Vercel (BLOB_STORE_ID, sans secret
  // durable) : le SDK choisit seul le mode d'authentification disponible.
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_STORE_ID?.trim()) return 'blob';
  if (process.env.NODE_ENV !== 'production') return 'local';

  return null;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      'Le stockage des images n’est pas configuré : reliez un magasin Vercel Blob au projet (BLOB_STORE_ID ou BLOB_READ_WRITE_TOKEN).',
    );
    this.name = 'StorageNotConfiguredError';
  }
}

function localRoot(): string {
  return resolve(process.env.LOCAL_MEDIA_DIR?.trim() || join(process.cwd(), '.data', 'media'));
}

/**
 * Chemin disque d'un objet local, ou `null` s'il sortirait du dossier
 * (« ../ », chemin absolu…). Seules les extensions d'image sont admises.
 */
export function resolveLocalPath(objectPath: string): string | null {
  if (!/^[a-z0-9/._-]+$/i.test(objectPath)) return null;
  if (!['.webp', '.jpg', '.jpeg', '.png'].includes(extname(objectPath).toLowerCase())) return null;

  const root = localRoot();
  const target = resolve(root, normalize(objectPath));

  return target.startsWith(root + sep) ? target : null;
}

/** Enregistre une image et renvoie l'adresse publique à stocker en base. */
export async function saveImage(
  objectPath: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const driver = storageDriver();
  if (!driver) throw new StorageNotConfiguredError();

  if (driver === 'blob') {
    const blob = await put(objectPath, Buffer.from(bytes), {
      access: 'public',
      contentType,
      // Le chemin est déjà unique ; le suffixe aléatoire rend l'adresse
      // impossible à deviner avant publication.
      addRandomSuffix: true,
      cacheControlMaxAge: 31_536_000,
    });

    return blob.url;
  }

  const target = resolveLocalPath(objectPath);
  if (!target) throw new Error(`Chemin de fichier refusé : ${objectPath}`);

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);

  return `${LOCAL_URL_PREFIX}${objectPath}`;
}

/** Lit un objet local, pour la route `/media/…`. */
export async function readLocalImage(objectPath: string): Promise<Buffer | null> {
  const target = resolveLocalPath(objectPath);
  if (!target) return null;

  try {
    return await readFile(target);
  } catch {
    return null;
  }
}

const isBlobUrl = (value: string): boolean => {
  try {
    return new URL(value).hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
};

/**
 * Supprime des images devenues inutiles.
 *
 * Les visuels livrés avec le site (`/images/…`) ne sont jamais touchés. Un
 * échec est journalisé sans interrompre l'action : mieux vaut un fichier
 * orphelin qu'une modification de contenu perdue.
 */
export async function deleteImages(urls: readonly (string | null | undefined)[]): Promise<void> {
  const targets = [...new Set(urls.filter((url): url is string => Boolean(url)))];

  const blobs = targets.filter(isBlobUrl);
  const locals = targets
    .filter((url) => url.startsWith(LOCAL_URL_PREFIX))
    .map((url) => resolveLocalPath(url.slice(LOCAL_URL_PREFIX.length)))
    .filter((path): path is string => path !== null);

  try {
    if (blobs.length > 0) await del(blobs);
    await Promise.all(locals.map((path) => unlink(path).catch(() => undefined)));
  } catch (error) {
    console.warn('[stockage] fichiers non supprimés', error, targets);
  }
}
