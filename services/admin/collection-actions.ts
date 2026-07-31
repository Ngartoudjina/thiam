'use server';

import { CACHE_TAGS } from '@/lib/cache';
import { collectionSchema } from '@/lib/schemas/content';
import {
  failure,
  publishChanges,
  runAction,
  success,
  type ActionResult,
} from '@/services/admin/action-result';
import {
  adminClient,
  createRow,
  deleteRow,
  reorderRows,
  updateRow,
} from '@/services/admin/repository';
import { removeStorageObjects } from '@/services/admin/storage';

/* -------------------------------------------------------------------------- */
/*  Collection                                                                 */
/* -------------------------------------------------------------------------- */

export async function saveCollectionAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const parsed = collectionSchema.safeParse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      tagline: formData.get('tagline') ?? '',
      description: formData.get('description') ?? '',
      category: formData.get('category'),
      status: formData.get('status'),
    });

    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    const values = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline,
      description: parsed.data.description || null,
      category: parsed.data.category,
      status: parsed.data.status,
    };

    const id = formData.get('id');

    if (typeof id === 'string' && id.length > 0) {
      const result = await updateRow(
        'collections',
        id,
        values,
        CACHE_TAGS.collections,
        'Collection mise à jour.',
      );
      return result.ok ? success(result.message, { id }) : result;
    }

    return createRow('collections', values, CACHE_TAGS.collections, 'Collection créée.');
  });
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();

    // Les fichiers doivent partir avant la ligne : la cascade en base
    // effacerait les chemins et laisserait les objets orphelins.
    const { data: images } = await supabase
      .from('collection_images')
      .select('storage_path')
      .eq('collection_id', id);

    const result = await deleteRow(
      'collections',
      id,
      CACHE_TAGS.collections,
      'Collection supprimée.',
    );

    if (result.ok && images && images.length > 0) {
      await removeStorageObjects(images.map((image) => image.storage_path));
    }

    return result;
  });
}

export async function reorderCollectionsAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('collections', ids, CACHE_TAGS.collections));
}

/* -------------------------------------------------------------------------- */
/*  Photos d'une collection                                                    */
/* -------------------------------------------------------------------------- */

export async function addCollectionImageAction(input: {
  readonly collectionId: string;
  readonly storagePath: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();

    const { data: existing } = await supabase
      .from('collection_images')
      .select('id, position')
      .eq('collection_id', input.collectionId)
      .order('position', { ascending: false })
      .limit(1);

    const isFirst = !existing || existing.length === 0;
    const position = existing?.[0] ? existing[0].position + 1 : 0;

    const { error } = await supabase.from('collection_images').insert({
      collection_id: input.collectionId,
      storage_path: input.storagePath,
      alt: input.alt,
      width: input.width,
      height: input.height,
      position,
      // La première photo devient l'image principale par défaut.
      is_primary: isFirst,
    });

    if (error) return failure('La photo n’a pas pu être associée à la collection.');

    publishChanges(CACHE_TAGS.collections);
    return success('Photo ajoutée.');
  });
}

/**
 * Remplace le fichier d'une photo déjà rattachée, en conservant sa place, son
 * texte alternatif et son statut d'image principale.
 *
 * L'ancien objet est retiré du stockage une fois la ligne mise à jour : on ne
 * supprime jamais un fichier avant d'être certain que le nouveau est en place.
 */
export async function replaceCollectionImageAction(input: {
  readonly imageId: string;
  readonly storagePath: string;
  readonly width: number;
  readonly height: number;
}): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();

    const { data: previous } = await supabase
      .from('collection_images')
      .select('storage_path')
      .eq('id', input.imageId)
      .maybeSingle();

    const { error } = await supabase
      .from('collection_images')
      .update({
        storage_path: input.storagePath,
        width: input.width,
        height: input.height,
      })
      .eq('id', input.imageId);

    if (error) return failure('Le remplacement n’a pas pu être enregistré.');

    if (previous?.storage_path && previous.storage_path !== input.storagePath) {
      await removeStorageObjects([previous.storage_path]);
    }

    publishChanges(CACHE_TAGS.collections);
    return success('Photo remplacée.');
  });
}

export async function updateCollectionImageAltAction(
  imageId: string,
  alt: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const trimmed = alt.trim();
    if (trimmed.length < 3) {
      return failure('Décrivez la photo en quelques mots : ce texte est lu par les lecteurs d’écran.');
    }

    const supabase = await adminClient();
    const { error } = await supabase
      .from('collection_images')
      .update({ alt: trimmed })
      .eq('id', imageId);

    if (error) return failure('Le texte alternatif n’a pas pu être enregistré.');

    publishChanges(CACHE_TAGS.collections);
    return success('Texte alternatif mis à jour.');
  });
}

export async function deleteCollectionImageAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();

    const { data: image } = await supabase
      .from('collection_images')
      .select('storage_path, collection_id, is_primary')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('collection_images').delete().eq('id', id);
    if (error) return failure('Suppression impossible.');

    if (image?.storage_path) await removeStorageObjects([image.storage_path]);

    // La collection ne doit pas rester sans image principale.
    if (image?.is_primary && image.collection_id) {
      const { data: next } = await supabase
        .from('collection_images')
        .select('id')
        .eq('collection_id', image.collection_id)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (next?.id) {
        await supabase.from('collection_images').update({ is_primary: true }).eq('id', next.id);
      }
    }

    publishChanges(CACHE_TAGS.collections);
    return success('Photo supprimée.');
  });
}

export async function setPrimaryImageAction(
  collectionId: string,
  imageId: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();

    // L'index unique n'autorise qu'une principale : on libère avant d'assigner.
    await supabase
      .from('collection_images')
      .update({ is_primary: false })
      .eq('collection_id', collectionId);

    const { error } = await supabase
      .from('collection_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (error) return failure('Image principale non modifiée.');

    publishChanges(CACHE_TAGS.collections);
    return success('Image principale définie.');
  });
}

export async function reorderCollectionImagesAction(
  orderedIds: readonly string[],
): Promise<ActionResult> {
  return runAction(async () => {
    const supabase = await adminClient();

    const results = await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from('collection_images').update({ position: index }).eq('id', id),
      ),
    );

    if (results.some((result) => result.error)) {
      return failure('Le nouvel ordre n’a pas pu être enregistré.');
    }

    publishChanges(CACHE_TAGS.collections);
    return success('Ordre des photos mis à jour.');
  });
}
