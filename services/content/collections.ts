import 'server-only';

import { unstable_cache } from 'next/cache';
import { COLLECTIONS } from '@/constants/collections';
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from '@/lib/cache';
import { createPublicSupabase } from '@/lib/supabase/server';
import { toMediaAsset } from '@/services/content/media';
import type { CollectionImageRow, CollectionRow } from '@/types/database';
import type { Collection } from '@/types';

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
    placeholder: `Photo ${row.name.toLowerCase()}`,
  };
}

/**
 * Univers affichés sur le site.
 *
 * Retombe sur le contenu de la maquette si Supabase n'est pas configuré, si la
 * requête échoue, ou si la table est vide : le site vitrine reste toujours
 * complet, y compris pendant l'installation.
 */
export const getCollections = unstable_cache(
  async (): Promise<readonly Collection[]> => {
    const supabase = createPublicSupabase();
    if (!supabase) return COLLECTIONS;

    const { data: rows, error } = await supabase
      .from('collections')
      .select('*')
      .eq('status', 'visible')
      .order('position', { ascending: true });

    if (error || !rows || rows.length === 0) return COLLECTIONS;

    const { data: images } = await supabase
      .from('collection_images')
      .select('*')
      .in(
        'collection_id',
        rows.map((row) => row.id),
      )
      .order('position', { ascending: true });

    const byCollection = new Map<string, CollectionImageRow[]>();
    for (const image of images ?? []) {
      const bucket = byCollection.get(image.collection_id) ?? [];
      bucket.push(image);
      byCollection.set(image.collection_id, bucket);
    }

    return rows.map((row, index) => toCollection(row, byCollection.get(row.id) ?? [], index));
  },
  ['collections-publiques'],
  { tags: [CACHE_TAGS.collections], revalidate: CONTENT_REVALIDATE_SECONDS },
);
