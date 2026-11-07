'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { CACHE_TAGS, type CacheTag } from '@/lib/cache';
import { galleryImages, testimonials } from '@/lib/db/schema';
import { imageSourceSchema } from '@/lib/media-source';
import {
  faqSchema,
  galleryImageSchema,
  serviceSchema,
  testimonialSchema,
} from '@/lib/schemas/content';
import { deleteImages } from '@/lib/storage';
import { failure, runAction, type ActionResult } from '@/services/admin/action-result';
import {
  createRow,
  deleteRow,
  reorderRows,
  setRowStatus,
  staffDb,
  updateRow,
  type OrderedTableName,
} from '@/services/admin/repository';
import type { ContentStatus } from '@/types/database';

const readId = (formData: FormData): string | null => {
  const id = formData.get('id');
  return typeof id === 'string' && id.length > 0 ? id : null;
};

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveServiceAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = serviceSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description') ?? '',
      price: formData.get('price') ?? '',
      icon: formData.get('icon'),
      status: formData.get('status'),
    });

    if (!parsed.success) {
      return failure('Vérifiez les champs.', z.flattenError(parsed.error).fieldErrors);
    }

    const id = readId(formData);

    return id
      ? updateRow('services', id, parsed.data, CACHE_TAGS.services, 'Service mis à jour.')
      : createRow('services', parsed.data, CACHE_TAGS.services, 'Service ajouté.');
  });
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  return runAction(() => deleteRow('services', id, CACHE_TAGS.services, 'Service supprimé.'));
}

export async function reorderServicesAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('services', ids, CACHE_TAGS.services));
}

/* -------------------------------------------------------------------------- */
/*  Témoignages                                                                */
/* -------------------------------------------------------------------------- */

export async function saveTestimonialAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = testimonialSchema.safeParse({
      quote: formData.get('quote'),
      author: formData.get('author'),
      context: formData.get('context') ?? '',
      rating: formData.get('rating'),
      isFeatured: formData.get('isFeatured') === 'on',
      status: formData.get('status'),
    });

    if (!parsed.success) {
      return failure('Vérifiez les champs.', z.flattenError(parsed.error).fieldErrors);
    }

    const { isFeatured, ...rest } = parsed.data;
    const values = { ...rest, is_featured: isFeatured };
    const id = readId(formData);

    // Un seul témoignage peut être mis en avant.
    if (isFeatured) {
      const db = await staffDb();
      await db
        .update(testimonials)
        .set({ is_featured: false })
        .where(eq(testimonials.is_featured, true));
    }

    return id
      ? updateRow('testimonials', id, values, CACHE_TAGS.testimonials, 'Témoignage mis à jour.')
      : createRow('testimonials', values, CACHE_TAGS.testimonials, 'Témoignage ajouté.');
  });
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  return runAction(() =>
    deleteRow('testimonials', id, CACHE_TAGS.testimonials, 'Témoignage supprimé.'),
  );
}

export async function reorderTestimonialsAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('testimonials', ids, CACHE_TAGS.testimonials));
}

/* -------------------------------------------------------------------------- */
/*  Questions fréquentes                                                       */
/* -------------------------------------------------------------------------- */

export async function saveFaqAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = faqSchema.safeParse({
      question: formData.get('question'),
      answer: formData.get('answer'),
      status: formData.get('status'),
    });

    if (!parsed.success) {
      return failure('Vérifiez les champs.', z.flattenError(parsed.error).fieldErrors);
    }

    const id = readId(formData);

    return id
      ? updateRow('faq', id, parsed.data, CACHE_TAGS.faq, 'Question mise à jour.')
      : createRow('faq', parsed.data, CACHE_TAGS.faq, 'Question ajoutée.');
  });
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  return runAction(() => deleteRow('faq', id, CACHE_TAGS.faq, 'Question supprimée.'));
}

export async function reorderFaqAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('faq', ids, CACHE_TAGS.faq));
}

/* -------------------------------------------------------------------------- */
/*  Galerie                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveGalleryImageAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = galleryImageSchema.safeParse({
      alt: formData.get('alt'),
      caption: formData.get('caption') ?? '',
      colSpan: formData.get('colSpan'),
      rowSpan: formData.get('rowSpan'),
      status: formData.get('status'),
    });

    if (!parsed.success) {
      return failure('Vérifiez les champs.', z.flattenError(parsed.error).fieldErrors);
    }

    const source = imageSourceSchema.safeParse(formData.get('storagePath') ?? '');
    if (!source.success || !source.data) return failure('Ajoutez une photo avant d’enregistrer.');

    const values = {
      storage_path: source.data,
      alt: parsed.data.alt,
      caption: parsed.data.caption || null,
      width: Math.max(0, Math.round(Number(formData.get('width') ?? 0)) || 0),
      height: Math.max(0, Math.round(Number(formData.get('height') ?? 0)) || 0),
      col_span: parsed.data.colSpan as 1 | 2,
      row_span: parsed.data.rowSpan as 2 | 3,
      status: parsed.data.status,
    };

    const id = readId(formData);
    let previousPath: string | null = null;

    if (id) {
      const db = await staffDb();
      const [current] = await db
        .select({ storage_path: galleryImages.storage_path })
        .from(galleryImages)
        .where(eq(galleryImages.id, id))
        .limit(1);
      previousPath = current?.storage_path ?? null;
    }

    const result = id
      ? await updateRow('gallery_images', id, values, CACHE_TAGS.gallery, 'Photo mise à jour.')
      : await createRow('gallery_images', values, CACHE_TAGS.gallery, 'Photo ajoutée.');

    // L'ancien fichier ne sert plus : on le retire du stockage.
    if (result.ok && previousPath && previousPath !== values.storage_path) {
      await deleteImages([previousPath]);
    }

    return result;
  });
}

export async function deleteGalleryImageAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const db = await staffDb();

    const [current] = await db
      .select({ storage_path: galleryImages.storage_path })
      .from(galleryImages)
      .where(eq(galleryImages.id, id))
      .limit(1);

    const result = await deleteRow('gallery_images', id, CACHE_TAGS.gallery, 'Photo supprimée.');
    if (result.ok && current) await deleteImages([current.storage_path]);

    return result;
  });
}

export async function reorderGalleryAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('gallery_images', ids, CACHE_TAGS.gallery));
}

/* -------------------------------------------------------------------------- */
/*  Visibilité                                                                 */
/* -------------------------------------------------------------------------- */

const TAG_BY_TABLE: Readonly<Record<OrderedTableName, CacheTag>> = {
  collections: CACHE_TAGS.collections,
  pieces: CACHE_TAGS.pieces,
  gallery_images: CACHE_TAGS.gallery,
  services: CACHE_TAGS.services,
  testimonials: CACHE_TAGS.testimonials,
  faq: CACHE_TAGS.faq,
};

const statusInput = z.object({
  table: z.enum(['collections', 'pieces', 'gallery_images', 'services', 'testimonials', 'faq']),
  status: z.enum(['visible', 'hidden']),
});

/** Bascule rapide visible / masqué depuis une liste. */
export async function toggleStatusAction(
  table: OrderedTableName,
  id: string,
  status: ContentStatus,
): Promise<ActionResult> {
  return runAction(async () => {
    // Les arguments d'une action serveur viennent du réseau : on ne fait
    // confiance ni au nom de table ni au statut reçus.
    const parsed = statusInput.safeParse({ table, status });
    if (!parsed.success) return failure('Changement de statut impossible.');

    return setRowStatus(parsed.data.table, id, parsed.data.status, TAG_BY_TABLE[parsed.data.table]);
  });
}
