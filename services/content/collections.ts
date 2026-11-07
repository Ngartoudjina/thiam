import 'server-only';

import { asc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { COLLECTIONS, PIECES } from '@/constants/collections';
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from '@/lib/cache';
import { collectionImages, collections, pieces } from '@/lib/db/schema';
import { formatWeight } from '@/lib/format';
import { toMediaAsset } from '@/services/content/media';
import { publicDb, readOrFallback } from '@/services/content/read';
import type { CollectionImageRow, CollectionRow } from '@/types/database';
import type { Collection, Piece } from '@/types';

function toCollection(
  row: CollectionRow,
  images: readonly CollectionImageRow[],
  index: number,
): Collection {
  const ordered = [...images].sort((a, b) => a.position - b.position);
  const primary = ordered.find((image) => image.is_primary) ?? ordered[0] ?? null;
  const secondary = ordered.filter((image) => image.id !== primary?.id);

  return {
    id: row.id,
    slug: row.slug,
    index: String(index + 1).padStart(2, '0'),
    name: row.name,
    tagline: row.tagline,
    ...(row.description ? { description: row.description } : {}),
    image: toMediaAsset(primary),
    images: secondary
      .map(toMediaAsset)
      .filter((asset): asset is NonNullable<typeof asset> => asset !== null),
    // Note éditoriale : rappelle où déposer la photo manquante.
    placeholder: `Photo « ${row.name} » — à déposer depuis Collections dans le tableau de bord`,
  };
}

const cachedCollections = unstable_cache(
  async (): Promise<readonly Collection[] | null> => {
    const db = publicDb();
    if (!db) return null;

    const [rows, images] = await Promise.all([
      db
        .select()
        .from(collections)
        .where(eq(collections.status, 'visible'))
        .orderBy(asc(collections.position)),
      db.select().from(collectionImages).orderBy(asc(collectionImages.position)),
    ]);

    if (rows.length === 0) return null;

    return rows.map((row, index) =>
      toCollection(
        row,
        images.filter((image) => image.collection_id === row.id),
        index,
      ),
    );
  },
  ['collections-publiques'],
  { tags: [CACHE_TAGS.collections], revalidate: CONTENT_REVALIDATE_SECONDS },
);

/**
 * Univers affichés sur le site.
 *
 * Retombe sur le contenu de la maquette si la base n'est pas configurée, si
 * la requête échoue, ou si aucune collection n'est publiée : le site vitrine
 * reste toujours complet, y compris pendant l'installation.
 */
export const getCollections = cache((): Promise<readonly Collection[]> =>
  readOrFallback('collections', cachedCollections, COLLECTIONS),
);

const cachedPieces = unstable_cache(
  async (): Promise<readonly Piece[] | null> => {
    const db = publicDb();
    if (!db) return null;

    const rows = await db
      .select({ piece: pieces, collectionSlug: collections.slug })
      .from(pieces)
      .leftJoin(collections, eq(collections.id, pieces.collection_id))
      .where(eq(pieces.status, 'visible'))
      .orderBy(asc(pieces.position));

    if (rows.length === 0) return null;

    return rows.map(({ piece, collectionSlug }) => ({
      id: piece.id,
      name: piece.name,
      detail: piece.detail,
      detailShort: piece.detail_short || piece.detail,
      weight: formatWeight(piece.weight_grams),
      weightGrams: piece.weight_grams,
      collection: collectionSlug ?? '',
      image: toMediaAsset({
        storage_path: piece.storage_path,
        alt: piece.image_alt || piece.name,
        width: piece.image_width,
        height: piece.image_height,
      }),
      ...(piece.badge_label
        ? { badge: { label: piece.badge_label, tone: piece.badge_tone ?? 'gold' } }
        : {}),
    }));
  },
  ['pieces-publiques'],
  { tags: [CACHE_TAGS.pieces, CACHE_TAGS.collections], revalidate: CONTENT_REVALIDATE_SECONDS },
);

/** Pièces en vitrine, dans l'ordre choisi depuis le tableau de bord. */
export const getPieces = cache((): Promise<readonly Piece[]> =>
  readOrFallback('pièces', cachedPieces, PIECES),
);
