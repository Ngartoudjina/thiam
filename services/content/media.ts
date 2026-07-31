import { publicStorageUrl } from '@/lib/supabase/env';
import type { MediaAsset } from '@/types';

interface StoredImage {
  readonly id?: string;
  readonly storage_path: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

/** Dimensions de repli lorsque la ligne n'en porte pas — évite un `fill` sans ratio. */
const FALLBACK_SIZE = { width: 1200, height: 1200 } as const;

/** Convertit une ligne de la base en visuel prêt à l'affichage. */
export function toMediaAsset(row: StoredImage | null | undefined): MediaAsset | null {
  if (!row?.storage_path) return null;

  return {
    ...(row.id ? { id: row.id } : {}),
    src: publicStorageUrl(row.storage_path),
    storagePath: row.storage_path,
    alt: row.alt,
    width: row.width > 0 ? row.width : FALLBACK_SIZE.width,
    height: row.height > 0 ? row.height : FALLBACK_SIZE.height,
  };
}

/** Variante pour un simple chemin de stockage, tel que stocké dans `settings`. */
export function pathToMediaAsset(
  storagePath: string | undefined,
  alt: string,
  fallback: MediaAsset,
): MediaAsset {
  if (!storagePath) return fallback;

  return {
    src: publicStorageUrl(storagePath),
    storagePath,
    alt: alt || fallback.alt,
    width: fallback.width,
    height: fallback.height,
  };
}
