import { asc, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Database } from '@/lib/db/connection';
import { collectionImages, collections, services } from '@/lib/db/schema';
import { createTestDatabase } from './helpers/db';

vi.mock('next/cache', () => ({
  unstable_cache: <T>(fn: T) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}));

const { nextPosition, writePositions } = await import('@/services/admin/repository');

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDatabase());
});

afterAll(() => close());

describe('positions', () => {
  it('place les nouveautés en fin de liste', async () => {
    expect(await nextPosition(db, services)).toBe(0);

    await db.insert(services).values({ title: 'Polissage', position: 0 });
    await db.insert(services).values({ title: 'Gravure', position: 4 });

    expect(await nextPosition(db, services)).toBe(5);
  });

  it('réécrit l’ordre d’un bloc et ignore les identifiants invalides', async () => {
    await db.delete(services);
    const rows = await db
      .insert(services)
      .values(['A', 'B', 'C'].map((title, position) => ({ title, position })))
      .returning({ id: services.id, title: services.title });

    const [a, b, c] = rows;
    await writePositions(db, services, [c!.id, 'pas-un-uuid', a!.id, b!.id]);

    const ordered = await db.select().from(services).orderBy(asc(services.position));
    expect(ordered.map((row) => row.title)).toEqual(['C', 'A', 'B']);
    expect(ordered.map((row) => row.position)).toEqual([0, 1, 2]);
  });

  it('fonctionne pour les photos d’une collection', async () => {
    const [collection] = await db
      .insert(collections)
      .values({ slug: 'or', name: 'Or' })
      .returning({ id: collections.id });

    const photos = await db
      .insert(collectionImages)
      .values(
        ['/images/a.jpg', '/images/b.jpg'].map((path, position) => ({
          collection_id: collection!.id,
          storage_path: path,
          position,
        })),
      )
      .returning({ id: collectionImages.id });

    await writePositions(db, collectionImages, [photos[1]!.id, photos[0]!.id]);

    const [first] = await db
      .select()
      .from(collectionImages)
      .where(eq(collectionImages.position, 0));
    expect(first!.storage_path).toBe('/images/b.jpg');
  });

  it('l’index unique interdit deux images principales dans une collection', async () => {
    const [collection] = await db
      .insert(collections)
      .values({ slug: 'diamant', name: 'Diamant' })
      .returning({ id: collections.id });

    await db
      .insert(collectionImages)
      .values({ collection_id: collection!.id, storage_path: '/images/a.jpg', is_primary: true });

    await expect(
      db
        .insert(collectionImages)
        .values({ collection_id: collection!.id, storage_path: '/images/b.jpg', is_primary: true }),
    ).rejects.toThrow();
  });
});
