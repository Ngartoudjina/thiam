import 'server-only';

import { asc, count, desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { purgeExpiredContactRequests } from '@/lib/retention';
import {
  collectionImages,
  collections,
  contactRequests,
  faq,
  galleryImages,
  newsletterSubscribers,
  pieces,
  services,
  testimonials,
  users,
} from '@/lib/db/schema';
import { staffDb } from '@/services/admin/repository';
import type {
  CollectionImageRow,
  CollectionRow,
  ContactRequestRow,
  FaqRow,
  GalleryImageRow,
  NewsletterSubscriberRow,
  PieceRow,
  RequestStatus,
  ServiceRow,
  TestimonialRow,
  UserRow,
} from '@/types/database';

/**
 * Lectures du tableau de bord.
 *
 * Contrairement à la couche publique, elles retournent aussi les éléments
 * masqués : l'administrateur doit voir ce qui n'est pas publié. Elles ne sont
 * jamais mises en cache.
 */

export interface CollectionWithImages extends CollectionRow {
  readonly images: readonly CollectionImageRow[];
}

export async function listCollections(): Promise<readonly CollectionWithImages[]> {
  const db = await staffDb();

  const [rows, images] = await Promise.all([
    db.select().from(collections).orderBy(asc(collections.position)),
    db.select().from(collectionImages).orderBy(asc(collectionImages.position)),
  ]);

  return rows.map((collection) => ({
    ...collection,
    images: images.filter((image) => image.collection_id === collection.id),
  }));
}

export async function getCollection(id: string): Promise<CollectionWithImages | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const db = await staffDb();

  const [[collection], images] = await Promise.all([
    db.select().from(collections).where(eq(collections.id, id)).limit(1),
    db
      .select()
      .from(collectionImages)
      .where(eq(collectionImages.collection_id, id))
      .orderBy(asc(collectionImages.position)),
  ]);

  return collection ? { ...collection, images } : null;
}

/** Univers proposés dans le formulaire d'une pièce. */
export async function listCollectionOptions(): Promise<
  readonly Pick<CollectionRow, 'id' | 'name' | 'slug'>[]
> {
  const db = await staffDb();

  return db
    .select({ id: collections.id, name: collections.name, slug: collections.slug })
    .from(collections)
    .orderBy(asc(collections.position));
}

export async function listPieces(): Promise<readonly PieceRow[]> {
  const db = await staffDb();
  return db.select().from(pieces).orderBy(asc(pieces.position));
}

export async function listServices(): Promise<readonly ServiceRow[]> {
  const db = await staffDb();
  return db.select().from(services).orderBy(asc(services.position));
}

export async function listTestimonials(): Promise<readonly TestimonialRow[]> {
  const db = await staffDb();
  return db.select().from(testimonials).orderBy(asc(testimonials.position));
}

export async function listFaq(): Promise<readonly FaqRow[]> {
  const db = await staffDb();
  return db.select().from(faq).orderBy(asc(faq.position));
}

export async function listGalleryImages(): Promise<readonly GalleryImageRow[]> {
  const db = await staffDb();
  return db.select().from(galleryImages).orderBy(asc(galleryImages.position));
}

/* -------------------------------------------------------------------------- */
/*  Relation client                                                            */
/* -------------------------------------------------------------------------- */

export async function listContactRequests(
  filter: RequestStatus | 'all',
): Promise<readonly ContactRequestRow[]> {
  const db = await staffDb();
  await purgeExpiredContactRequests(db);

  return db
    .select()
    .from(contactRequests)
    .where(filter === 'all' ? undefined : eq(contactRequests.status, filter))
    .orderBy(desc(contactRequests.created_at))
    .limit(500);
}

export async function countNewContactRequests(): Promise<number> {
  const db = await staffDb();

  const [row] = await db
    .select({ total: count() })
    .from(contactRequests)
    .where(eq(contactRequests.status, 'new'));

  return row?.total ?? 0;
}

export async function listSubscribers(): Promise<readonly NewsletterSubscriberRow[]> {
  const db = await staffDb();
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.created_at));
}

/* -------------------------------------------------------------------------- */
/*  Comptes                                                                    */
/* -------------------------------------------------------------------------- */

const userColumns = {
  id: users.id,
  email: users.email,
  full_name: users.full_name,
  role: users.role,
  last_login_at: users.last_login_at,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

/** Comptes du tableau de bord, sans jamais l'empreinte du mot de passe. */
export async function listUsers(): Promise<readonly UserRow[]> {
  await requireAdmin();
  const db = await staffDb();

  return db.select(userColumns).from(users).orderBy(asc(users.created_at));
}

/* -------------------------------------------------------------------------- */
/*  Vue d'ensemble                                                             */
/* -------------------------------------------------------------------------- */

const SUMMARY_TABLES = {
  collections,
  pieces,
  gallery_images: galleryImages,
  services,
  testimonials,
  faq,
} as const;

export type SummaryTable = keyof typeof SUMMARY_TABLES;

export interface ContentSummaryEntry {
  readonly table: SummaryTable;
  readonly total: number;
  readonly visible: number;
}

/** Compteurs de la page d'accueil du tableau de bord, en une requête par table. */
export async function getContentSummary(): Promise<readonly ContentSummaryEntry[]> {
  const db = await staffDb();

  return Promise.all(
    (Object.keys(SUMMARY_TABLES) as SummaryTable[]).map(async (name) => {
      const table = SUMMARY_TABLES[name];

      const rows = await db
        .select({ status: table.status, total: count() })
        .from(table)
        .groupBy(table.status);

      const total = rows.reduce((sum, row) => sum + row.total, 0);
      const visible = rows.find((row) => row.status === 'visible')?.total ?? 0;

      return { table: name, total, visible };
    }),
  );
}
