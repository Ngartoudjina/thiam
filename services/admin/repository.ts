import 'server-only';

import { eq, sql, type SQL } from 'drizzle-orm';
import { requireStaff } from '@/lib/auth';
import { requireDb, type Database } from '@/lib/db';
import {
  type collectionImages,
  collections,
  faq,
  galleryImages,
  pieces,
  services,
  testimonials,
} from '@/lib/db/schema';
import { publishChanges, success, type ActionResult } from '@/services/admin/action-result';
import type { CacheTag } from '@/lib/cache';
import type { ContentStatus } from '@/types/database';

/**
 * Opérations communes à toutes les rubriques du tableau de bord.
 *
 * Chaque point d'entrée commence par vérifier les droits : le middleware
 * protège les pages, ces contrôles-ci protègent les écritures, y compris
 * contre un appel d'action forgé hors interface.
 */

export const ORDERED_TABLES = {
  collections,
  pieces,
  gallery_images: galleryImages,
  services,
  testimonials,
  faq,
} as const;

export type OrderedTableName = keyof typeof ORDERED_TABLES;
type OrderedTable = (typeof ORDERED_TABLES)[OrderedTableName];
type PositionedTable = OrderedTable | typeof collectionImages;

/** Base de données, après contrôle des droits. */
export async function staffDb(): Promise<Database> {
  await requireStaff();
  return requireDb();
}

/** Prochaine position libre : les nouveautés se posent en fin de liste. */
export async function nextPosition(
  db: Database,
  table: PositionedTable,
  where?: SQL,
): Promise<number> {
  const [row] = await db
    .select({ next: sql<number>`coalesce(max(${table.position}), -1)::integer + 1` })
    .from(table)
    .where(where);

  return Number(row?.next ?? 0);
}

/**
 * Applique un nouvel ordre en une seule instruction.
 *
 * Les positions sont réécrites d'un bloc plutôt qu'échangées deux à deux : la
 * liste reste cohérente même si deux personnes réordonnent en même temps, et
 * l'instruction unique est atomique.
 */
export async function writePositions(
  db: Database,
  table: PositionedTable,
  orderedIds: readonly string[],
): Promise<void> {
  const ids = orderedIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (ids.length === 0) return;

  const cases = sql.join(
    ids.map((id, index) => sql`when ${table.id} = ${id}::uuid then ${index}::integer`),
    sql` `,
  );
  const list = sql.join(
    ids.map((id) => sql`${id}::uuid`),
    sql`, `,
  );

  await db.execute(
    sql`update ${table} set position = case ${cases} else ${table.position} end where ${table.id} in (${list})`,
  );
}

export async function createRow<N extends OrderedTableName>(
  name: N,
  values: Omit<(typeof ORDERED_TABLES)[N]['$inferInsert'], 'position'>,
  tag: CacheTag,
  message: string,
): Promise<ActionResult<{ id: string }>> {
  const db = await staffDb();
  const table: OrderedTable = ORDERED_TABLES[name];
  const position = await nextPosition(db, table);

  const [row] = (await db
    .insert(table)
    .values({ ...values, position } as never)
    .returning({ id: table.id })) as { id: string }[];

  publishChanges(tag);
  return success(message, { id: row?.id ?? '' });
}

export async function updateRow<N extends OrderedTableName>(
  name: N,
  id: string,
  values: Partial<(typeof ORDERED_TABLES)[N]['$inferInsert']>,
  tag: CacheTag,
  message: string,
): Promise<ActionResult> {
  const db = await staffDb();
  const table: OrderedTable = ORDERED_TABLES[name];

  await db
    .update(table)
    .set(values as never)
    .where(eq(table.id, id));

  publishChanges(tag);
  return success(message);
}

export async function deleteRow(
  name: OrderedTableName,
  id: string,
  tag: CacheTag,
  message: string,
): Promise<ActionResult> {
  const db = await staffDb();
  const table: OrderedTable = ORDERED_TABLES[name];

  await db.delete(table).where(eq(table.id, id));

  publishChanges(tag);
  return success(message);
}

export async function reorderRows(
  name: OrderedTableName,
  orderedIds: readonly string[],
  tag: CacheTag,
): Promise<ActionResult> {
  const db = await staffDb();
  await writePositions(db, ORDERED_TABLES[name], orderedIds);

  publishChanges(tag);
  return success('Ordre mis à jour.');
}

export async function setRowStatus(
  name: OrderedTableName,
  id: string,
  status: ContentStatus,
  tag: CacheTag,
): Promise<ActionResult> {
  const db = await staffDb();
  const table: OrderedTable = ORDERED_TABLES[name];

  await db
    .update(table)
    .set({ status } as never)
    .where(eq(table.id, id));

  publishChanges(tag);
  return success(status === 'visible' ? 'Élément publié.' : 'Élément masqué.');
}
