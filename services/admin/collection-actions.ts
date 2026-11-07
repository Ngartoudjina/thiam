'use server';

import { and, asc, desc, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { CACHE_TAGS } from '@/lib/cache';
import { collectionImages } from '@/lib/db/schema';
import { collectionSchema } from '@/lib/schemas/content';
import { deleteImages } from '@/lib/storage';
import {
  failure,
  publishChanges,
  runAction,
  success,
  type ActionResult,
} from '@/services/admin/action-result';
import {
  createRow,
  deleteRow,
  reorderRows,
  staffDb,
  updateRow,
  writePositions,
} from '@/services/admin/repository';

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

    if (!parsed.success) {
      return failure('Vérifiez les champs.', z.flattenError(parsed.error).fieldErrors);
    }

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
    const db = await staffDb();

    // Les chemins sont relevés avant la suppression : la cascade en base les
    // effacerait, et les fichiers resteraient orphelins dans le stockage.
    const images = await db
      .select({ storage_path: collectionImages.storage_path })
      .from(collectionImages)
      .where(eq(collectionImages.collection_id, id));

    const result = await deleteRow(
      'collections',
      id,
      CACHE_TAGS.collections,
      'Collection supprimée.',
    );

    if (result.ok) await deleteImages(images.map((image) => image.storage_path));

    // Les pièces rattachées perdent leur univers (ON DELETE SET NULL).
    publishChanges(CACHE_TAGS.pieces);
    return result;
  });
}

export async function reorderCollectionsAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('collections', ids, CACHE_TAGS.collections));
}

/* -------------------------------------------------------------------------- */
/*  Photos d'une collection                                                    */
/* -------------------------------------------------------------------------- */

const imageInput = z.object({
  storagePath: z.string().trim().min(1).max(600),
  width: z.number().int().min(0).max(20_000),
  height: z.number().int().min(0).max(20_000),
});

export async function addCollectionImageAction(input: {
  readonly collectionId: string;
  readonly storagePath: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}): Promise<ActionResult> {
  return runAction(async () => {
    const image = imageInput.safeParse(input);
    const alt = input.alt.trim();

    if (!image.success) return failure('La photo envoyée est illisible. Recommencez l’envoi.');
    if (alt.length < 3 || alt.length > 200) {
      return failure(
        'Décrivez la photo en quelques mots : ce texte est lu par les lecteurs d’écran.',
      );
    }

    const db = await staffDb();

    const [last] = await db
      .select({ position: collectionImages.position })
      .from(collectionImages)
      .where(eq(collectionImages.collection_id, input.collectionId))
      .orderBy(desc(collectionImages.position))
      .limit(1);

    await db.insert(collectionImages).values({
      collection_id: input.collectionId,
      storage_path: image.data.storagePath,
      alt,
      width: image.data.width,
      height: image.data.height,
      position: last ? last.position + 1 : 0,
      // La première photo devient l'image principale par défaut.
      is_primary: !last,
    });

    publishChanges(CACHE_TAGS.collections);
    return success('Photo ajoutée.');
  });
}

/**
 * Remplace le fichier d'une photo déjà rattachée, en conservant sa place, son
 * texte alternatif et son statut d'image principale.
 *
 * L'ancien fichier n'est supprimé qu'une fois la ligne mise à jour : on
 * n'efface jamais un fichier avant d'être certain que le nouveau est en place.
 */
export async function replaceCollectionImageAction(input: {
  readonly imageId: string;
  readonly storagePath: string;
  readonly width: number;
  readonly height: number;
}): Promise<ActionResult> {
  return runAction(async () => {
    const image = imageInput.safeParse(input);
    if (!image.success) return failure('La photo envoyée est illisible. Recommencez l’envoi.');

    const db = await staffDb();

    const [previous] = await db
      .select({ storage_path: collectionImages.storage_path })
      .from(collectionImages)
      .where(eq(collectionImages.id, input.imageId))
      .limit(1);

    if (!previous) return failure('Cette photo n’existe plus.');

    await db
      .update(collectionImages)
      .set({
        storage_path: image.data.storagePath,
        width: image.data.width,
        height: image.data.height,
      })
      .where(eq(collectionImages.id, input.imageId));

    if (previous.storage_path !== image.data.storagePath) {
      await deleteImages([previous.storage_path]);
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
    if (trimmed.length < 3 || trimmed.length > 200) {
      return failure(
        'Décrivez la photo en quelques mots : ce texte est lu par les lecteurs d’écran.',
      );
    }

    const db = await staffDb();
    await db.update(collectionImages).set({ alt: trimmed }).where(eq(collectionImages.id, imageId));

    publishChanges(CACHE_TAGS.collections);
    return success('Texte alternatif mis à jour.');
  });
}

export async function deleteCollectionImageAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const db = await staffDb();

    const [image] = await db.delete(collectionImages).where(eq(collectionImages.id, id)).returning({
      storage_path: collectionImages.storage_path,
      collection_id: collectionImages.collection_id,
      is_primary: collectionImages.is_primary,
    });

    if (!image) return failure('Cette photo n’existe plus.');

    await deleteImages([image.storage_path]);

    // La collection ne doit pas rester sans image principale.
    if (image.is_primary) {
      const [next] = await db
        .select({ id: collectionImages.id })
        .from(collectionImages)
        .where(eq(collectionImages.collection_id, image.collection_id))
        .orderBy(asc(collectionImages.position))
        .limit(1);

      if (next) {
        await db
          .update(collectionImages)
          .set({ is_primary: true })
          .where(eq(collectionImages.id, next.id));
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
    const db = await staffDb();

    // L'index unique n'admet qu'une principale, vérifiée ligne par ligne :
    // on libère d'abord l'ancienne, puis on désigne la nouvelle.
    await db
      .update(collectionImages)
      .set({ is_primary: false })
      .where(
        and(
          eq(collectionImages.collection_id, collectionId),
          eq(collectionImages.is_primary, true),
          ne(collectionImages.id, imageId),
        ),
      );

    const updated = await db
      .update(collectionImages)
      .set({ is_primary: true })
      .where(
        and(eq(collectionImages.id, imageId), eq(collectionImages.collection_id, collectionId)),
      )
      .returning({ id: collectionImages.id });

    if (updated.length === 0) return failure('Image principale non modifiée.');

    publishChanges(CACHE_TAGS.collections);
    return success('Image principale définie.');
  });
}

export async function reorderCollectionImagesAction(
  orderedIds: readonly string[],
): Promise<ActionResult> {
  return runAction(async () => {
    const db = await staffDb();
    await writePositions(db, collectionImages, orderedIds);

    publishChanges(CACHE_TAGS.collections);
    return success('Ordre des photos mis à jour.');
  });
}
