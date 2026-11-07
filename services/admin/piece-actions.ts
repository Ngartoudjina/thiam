'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { CACHE_TAGS } from '@/lib/cache';
import { pieces } from '@/lib/db/schema';
import { imageSourceSchema } from '@/lib/media-source';
import { pieceSchema } from '@/lib/schemas/content';
import { deleteImages } from '@/lib/storage';
import { failure, runAction, type ActionResult } from '@/services/admin/action-result';
import { createRow, deleteRow, reorderRows, staffDb, updateRow } from '@/services/admin/repository';

const dimension = (value: FormDataEntryValue | null): number =>
  Math.min(20_000, Math.max(0, Math.round(Number(value ?? 0)) || 0));

/**
 * Création ou mise à jour d'une pièce en vitrine.
 *
 * La photo est facultative : sans elle, la carte affiche le cadre d'attente
 * aux couleurs de la maison, comme pour les collections.
 */
export async function savePieceAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = pieceSchema.safeParse({
      name: formData.get('name'),
      detail: formData.get('detail') ?? '',
      detailShort: formData.get('detailShort') ?? '',
      weight: formData.get('weight') ?? '',
      collectionId: formData.get('collectionId') ?? '',
      badgeLabel: formData.get('badgeLabel') ?? '',
      badgeTone: formData.get('badgeTone') ?? 'gold',
      imageAlt: formData.get('imageAlt') ?? '',
      status: formData.get('status'),
    });

    if (!parsed.success) {
      return failure('Vérifiez les champs.', z.flattenError(parsed.error).fieldErrors);
    }

    const rawPath = String(formData.get('storagePath') ?? '');
    const source = rawPath ? imageSourceSchema.safeParse(rawPath) : null;
    if (source && !source.success)
      return failure('La photo doit être déposée depuis ce formulaire.');

    const storagePath = source?.data ?? null;
    const data = parsed.data;

    if (storagePath && data.imageAlt.length < 3) {
      return failure('Vérifiez les champs.', {
        imageAlt: ['Décrivez la photo : ce texte est lu par les lecteurs d’écran.'],
      });
    }

    const values = {
      name: data.name,
      detail: data.detail,
      // La version courte reprend la longue quand elle n'est pas fournie.
      detail_short: data.detailShort || data.detail,
      weight_grams: data.weight,
      collection_id: data.collectionId || null,
      storage_path: storagePath,
      image_alt: storagePath ? data.imageAlt : '',
      image_width: storagePath ? dimension(formData.get('width')) : 0,
      image_height: storagePath ? dimension(formData.get('height')) : 0,
      badge_label: data.badgeLabel || null,
      badge_tone: data.badgeLabel ? data.badgeTone : null,
      status: data.status,
    };

    const idValue = formData.get('id');
    const id = typeof idValue === 'string' && idValue.length > 0 ? idValue : null;

    if (!id) return createRow('pieces', values, CACHE_TAGS.pieces, 'Pièce ajoutée à la vitrine.');

    const db = await staffDb();
    const [current] = await db
      .select({ storage_path: pieces.storage_path })
      .from(pieces)
      .where(eq(pieces.id, id))
      .limit(1);

    const result = await updateRow('pieces', id, values, CACHE_TAGS.pieces, 'Pièce mise à jour.');

    if (result.ok && current?.storage_path && current.storage_path !== storagePath) {
      await deleteImages([current.storage_path]);
    }

    return result;
  });
}

export async function deletePieceAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const db = await staffDb();

    const [current] = await db
      .select({ storage_path: pieces.storage_path })
      .from(pieces)
      .where(eq(pieces.id, id))
      .limit(1);

    const result = await deleteRow('pieces', id, CACHE_TAGS.pieces, 'Pièce retirée de la vitrine.');
    if (result.ok) await deleteImages([current?.storage_path]);

    return result;
  });
}

export async function reorderPiecesAction(ids: readonly string[]): Promise<ActionResult> {
  return runAction(() => reorderRows('pieces', ids, CACHE_TAGS.pieces));
}
