import 'server-only';

import { requireStaff } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  failure,
  publishChanges,
  success,
  type ActionResult,
} from '@/services/admin/action-result';
import type { CacheTag } from '@/lib/cache';
import type { Database } from '@/types/database';

type OrderableTable = 'collections' | 'gallery_images' | 'services' | 'testimonials' | 'faq';
type ManagedTable = OrderableTable | 'collection_images';

type InsertOf<T extends ManagedTable> = Database['public']['Tables'][T]['Insert'];
type UpdateOf<T extends ManagedTable> = Database['public']['Tables'][T]['Update'];

/**
 * Opérations communes à toutes les rubriques du tableau de bord.
 *
 * Chaque fonction commence par vérifier les droits : le middleware protège les
 * pages, ces contrôles-ci protègent les écritures, y compris contre un appel
 * d'action forgé hors interface.
 */

/**
 * Note de typage : postgrest-js dérive le nom des colonnes du nom de la table.
 * Sur une table générique, il ne peut pas conclure que `id` existe partout —
 * alors que les tables gérées ici la possèdent toutes. Les rares `as never`
 * ci-dessous restreignent ce seul point de passage, jamais la donnée elle-même,
 * qui reste typée par `Database`.
 */
async function client() {
  await requireStaff();
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error('Supabase n’est pas configuré.');
  return supabase;
}

/** Prochaine position libre — les nouveautés se posent en fin de liste. */
async function nextPosition(table: OrderableTable): Promise<number> {
  const supabase = await client();

  const { data } = await supabase
    .from(table)
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  return typeof data?.position === 'number' ? data.position + 1 : 0;
}

export async function createRow<T extends OrderableTable>(
  table: T,
  values: Omit<InsertOf<T>, 'position'>,
  tag: CacheTag,
  message: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await client();
  const position = await nextPosition(table);

  const { data, error } = await supabase
    .from(table)
    .insert({ ...values, position } as never)
    .select('id')
    .returns<{ id: string }[]>()
    .single();

  if (error || !data) {
    return failure(
      error?.code === '23505'
        ? 'Un élément portant cet identifiant existe déjà.'
        : 'Enregistrement impossible.',
    );
  }

  publishChanges(tag);
  return success(message, { id: data.id });
}

export async function updateRow<T extends ManagedTable>(
  table: T,
  id: string,
  values: UpdateOf<T>,
  tag: CacheTag,
  message: string,
): Promise<ActionResult> {
  const supabase = await client();

  const { error } = await supabase
    .from(table)
    .update(values as never)
    .eq('id' as never, id as never);

  if (error) {
    return failure(
      error.code === '23505'
        ? 'Un élément portant cet identifiant existe déjà.'
        : 'Mise à jour impossible.',
    );
  }

  publishChanges(tag);
  return success(message);
}

export async function deleteRow<T extends ManagedTable>(
  table: T,
  id: string,
  tag: CacheTag,
  message: string,
): Promise<ActionResult> {
  const supabase = await client();

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id' as never, id as never);
  if (error) return failure('Suppression impossible.');

  publishChanges(tag);
  return success(message);
}

/**
 * Applique un nouvel ordre après un glisser-déposer.
 * Les positions sont réécrites d'un bloc plutôt qu'échangées deux à deux :
 * la liste reste cohérente même si deux personnes réordonnent en même temps.
 */
export async function reorderRows(
  table: OrderableTable,
  orderedIds: readonly string[],
  tag: CacheTag,
): Promise<ActionResult> {
  const supabase = await client();

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from(table)
        .update({ position: index } as never)
        .eq('id' as never, id as never),
    ),
  );

  if (results.some((result) => result.error)) {
    return failure('Le nouvel ordre n’a pas pu être enregistré.');
  }

  publishChanges(tag);
  return success('Ordre mis à jour.');
}

export { client as adminClient };
