'use server';

import { CACHE_TAGS } from '@/lib/cache';
import {
  faqSchema,
  galleryImageSchema,
  serviceSchema,
  testimonialSchema,
} from '@/lib/schemas/content';
import { failure, runAction, success, type ActionResult } from '@/services/admin/action-result';
import {
  adminClient,
  createRow,
  deleteRow,
  reorderRows,
  updateRow,
} from '@/services/admin/repository';
import { removeStorageObjects } from '@/services/admin/storage';
import { publishChanges } from '@/services/admin/action-result';

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

const readService = (formData: FormData) =>
  serviceSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') ?? '',
    price: formData.get('price') ?? '',
    icon: formData.get('icon'),
    status: formData.get('status'),
  });

export async function saveServiceAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = readService(formData);
    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    const id = formData.get('id');
    const values = { ...parsed.data };

    return typeof id === 'string' && id.length > 0
      ? updateRow('services', id, values, CACHE_TAGS.services, 'Service mis à jour.')
      : createRow('services', values, CACHE_TAGS.services, 'Service ajouté.');
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

    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    const { isFeatured, ...rest } = parsed.data;
    const values = { ...rest, is_featured: isFeatured };
    const id = formData.get('id');

    // Un seul témoignage peut être mis en avant.
    if (isFeatured) {
      const supabase = await adminClient();
      await supabase.from('testimonials').update({ is_featured: false }).eq('is_featured', true);
    }

    return typeof id === 'string' && id.length > 0
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

    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    const id = formData.get('id');

    return typeof id === 'string' && id.length > 0
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

    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    const storagePath = String(formData.get('storagePath') ?? '');
    const previousPath = String(formData.get('previousStoragePath') ?? '');
    const width = Number(formData.get('width') ?? 0);
    const height = Number(formData.get('height') ?? 0);
    const id = formData.get('id');

    if (!storagePath) return failure('Ajoutez une photo avant d’enregistrer.');

    const values = {
      storage_path: storagePath,
      alt: parsed.data.alt,
      caption: parsed.data.caption || null,
      width,
      height,
      col_span: parsed.data.colSpan as 1 | 2,
      row_span: parsed.data.rowSpan as 2 | 3,
      status: parsed.data.status,
    };

    const result =
      typeof id === 'string' && id.length > 0
        ? await updateRow('gallery_images', id, values, CACHE_TAGS.gallery, 'Photo mise à jour.')
        : await createRow('gallery_images', values, CACHE_TAGS.gallery, 'Photo ajoutée.');

    // L'ancien fichier ne sert plus : on le retire du stockage.
    if (result.ok && previousPath && previousPath !== storagePath) {
      await removeStorageObjects([previousPath]);
    }

    return result;
  });
}

export async function deleteGalleryImageAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();

    const { data } = await supabase
      .from('gallery_images')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();

    const result = await deleteRow('gallery_images', id, CACHE_TAGS.gallery, 'Photo supprimée.');

    if (result.ok && data?.storage_path) {
      await removeStorageObjects([data.storage_path]);
    }

    return result;
  });
}

export async function reorderGalleryAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('gallery_images', ids, CACHE_TAGS.gallery));
}

/** Bascule rapide visible / masqué depuis une liste. */
export async function toggleStatusAction(
  table: 'services' | 'testimonials' | 'faq' | 'gallery_images' | 'collections',
  id: string,
  status: 'visible' | 'hidden',
): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();
    const { error } = await supabase.from(table).update({ status }).eq('id', id);

    if (error) return failure('Changement de statut impossible.');

    const tagByTable = {
      services: CACHE_TAGS.services,
      testimonials: CACHE_TAGS.testimonials,
      faq: CACHE_TAGS.faq,
      gallery_images: CACHE_TAGS.gallery,
      collections: CACHE_TAGS.collections,
    } as const;

    publishChanges(tagByTable[table]);
    return success(status === 'visible' ? 'Élément publié.' : 'Élément masqué.');
  });
}
