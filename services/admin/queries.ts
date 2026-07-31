import 'server-only';

import { adminClient } from '@/services/admin/repository';
import type {
  CollectionImageRow,
  CollectionRow,
  FaqRow,
  GalleryImageRow,
  ServiceRow,
  TestimonialRow,
} from '@/types/database';

/**
 * Lectures du tableau de bord.
 *
 * Contrairement à la couche publique, elles retournent aussi les éléments
 * masqués : l'administrateur doit voir ce qui n'est pas publié.
 */

export interface CollectionWithImages extends CollectionRow {
  readonly images: readonly CollectionImageRow[];
}

export async function listCollections(): Promise<readonly CollectionWithImages[]> {
  const supabase = await adminClient();

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('position', { ascending: true });

  if (!collections || collections.length === 0) return [];

  const { data: images } = await supabase
    .from('collection_images')
    .select('*')
    .in(
      'collection_id',
      collections.map((collection) => collection.id),
    )
    .order('position', { ascending: true });

  const byCollection = new Map<string, CollectionImageRow[]>();
  for (const image of images ?? []) {
    const bucket = byCollection.get(image.collection_id) ?? [];
    bucket.push(image);
    byCollection.set(image.collection_id, bucket);
  }

  return collections.map((collection) => ({
    ...collection,
    images: byCollection.get(collection.id) ?? [],
  }));
}

export async function getCollection(id: string): Promise<CollectionWithImages | null> {
  const supabase = await adminClient();

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!collection) return null;

  const { data: images } = await supabase
    .from('collection_images')
    .select('*')
    .eq('collection_id', id)
    .order('position', { ascending: true });

  return { ...collection, images: images ?? [] };
}

export async function listServices(): Promise<readonly ServiceRow[]> {
  const supabase = await adminClient();
  const { data } = await supabase.from('services').select('*').order('position');
  return data ?? [];
}

export async function listTestimonials(): Promise<readonly TestimonialRow[]> {
  const supabase = await adminClient();
  const { data } = await supabase.from('testimonials').select('*').order('position');
  return data ?? [];
}

export async function listFaq(): Promise<readonly FaqRow[]> {
  const supabase = await adminClient();
  const { data } = await supabase.from('faq').select('*').order('position');
  return data ?? [];
}

export async function listGalleryImages(): Promise<readonly GalleryImageRow[]> {
  const supabase = await adminClient();
  const { data } = await supabase.from('gallery_images').select('*').order('position');
  return data ?? [];
}

/** Compteurs de la page d'accueil du tableau de bord. */
export async function getContentSummary() {
  const supabase = await adminClient();

  const counts = await Promise.all(
    (['collections', 'gallery_images', 'services', 'testimonials', 'faq'] as const).map(
      async (table) => {
        const { count } = await supabase.from(table).select('id', { count: 'exact', head: true });
        const { count: visible } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'visible');

        return { table, total: count ?? 0, visible: visible ?? 0 };
      },
    ),
  );

  return counts;
}
