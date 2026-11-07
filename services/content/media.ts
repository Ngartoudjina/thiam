import { isAllowedImageSource } from '@/lib/media-source';
import type { MediaAsset } from '@/types';

interface StoredImage {
  readonly id?: string;
  readonly storage_path: string | null;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

/** Dimensions de repli lorsque la ligne n'en porte pas — évite un `fill` sans ratio. */
const FALLBACK_SIZE = { width: 1200, height: 1200 } as const;

/**
 * Convertit une ligne de la base en visuel prêt à l'affichage.
 *
 * Une adresse de provenance inconnue (reliquat d'une ancienne base, saisie
 * manuelle) donne `null` — le cadre d'attente — plutôt qu'une erreur de rendu
 * de `next/image`.
 */
export function toMediaAsset(row: StoredImage | null | undefined): MediaAsset | null {
  if (!row?.storage_path || !isAllowedImageSource(row.storage_path)) return null;

  return {
    ...(row.id ? { id: row.id } : {}),
    src: row.storage_path,
    storagePath: row.storage_path,
    alt: row.alt,
    width: row.width > 0 ? row.width : FALLBACK_SIZE.width,
    height: row.height > 0 ? row.height : FALLBACK_SIZE.height,
  };
}

/** Variante pour une image enregistrée dans `settings`. */
export function pathToMediaAsset(
  storagePath: string | undefined,
  alt: string,
  fallback: MediaAsset,
  size?: { readonly width?: number; readonly height?: number },
): MediaAsset {
  if (!storagePath || !isAllowedImageSource(storagePath)) return fallback;

  const width = size?.width ?? 0;
  const height = size?.height ?? 0;

  return {
    src: storagePath,
    storagePath,
    alt: alt || fallback.alt,
    width: width > 0 ? width : fallback.width,
    height: height > 0 ? height : fallback.height,
  };
}

/**
 * Visuel d'un emplacement fixe.
 * L'image téléversée depuis le tableau de bord l'emporte ; à défaut, la
 * photographie livrée avec la maquette tient la place.
 */
export function resolveVisual(
  visual:
    | {
        readonly path: string;
        readonly alt: string;
        readonly width?: number;
        readonly height?: number;
      }
    | undefined,
  fallback: MediaAsset,
): MediaAsset {
  return pathToMediaAsset(visual?.path, visual?.alt ?? '', fallback, visual);
}
