import { asc } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '@/lib/db/connection';
import { collectionImages, collections, galleryImages, settings } from '@/lib/db/schema';
import {
  importFromSupabase,
  supabaseObjectPath,
  type ImageSink,
  type Row,
  type SupabaseSource,
} from '../scripts/lib/supabase-import';
import { createTestDatabase } from './helpers/db';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

const COLLECTION_ID = '11111111-1111-4111-8111-111111111111';

const TABLES: Record<string, Row[]> = {
  collections: [
    {
      id: COLLECTION_ID,
      slug: 'diamant',
      name: 'Diamant',
      tagline: '42 pièces',
      description: null,
      category: 'bijoux',
      status: 'visible',
      position: 1,
      created_at: '2026-08-01T10:00:00+00:00',
      updated_at: '2026-08-02T10:00:00+00:00',
    },
  ],
  collection_images: [
    {
      id: '22222222-2222-4222-8222-222222222222',
      collection_id: COLLECTION_ID,
      storage_path: 'collections/diamant/photo.webp',
      alt: 'Solitaire',
      width: 1200,
      height: 1600,
      position: 0,
      is_primary: true,
      created_at: '2026-08-01T10:00:00+00:00',
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      collection_id: COLLECTION_ID,
      storage_path: 'collections/diamant/disparue.webp',
      alt: 'Disparue',
      width: 10,
      height: 10,
      position: 1,
      is_primary: false,
      created_at: '2026-08-01T10:00:00+00:00',
    },
  ],
  gallery_images: [
    {
      id: '44444444-4444-4444-8444-444444444444',
      storage_path: '/images/parure-or.jpg',
      alt: 'Parure',
      caption: 'Écrin',
      width: 735,
      height: 811,
      col_span: 2,
      row_span: 3,
      status: 'hidden',
      position: 0,
      created_at: '2026-08-01T10:00:00+00:00',
      updated_at: '2026-08-01T10:00:00+00:00',
    },
  ],
  services: [],
  testimonials: [],
  faq: [],
  settings: [
    {
      key: 'visuals',
      value: {
        heroMain: { path: 'content/heromain/vitrine.webp', alt: 'Vitrine' },
        heroCard: { path: '', alt: '' },
      },
      updated_at: '2026-08-01T10:00:00+00:00',
    },
    {
      key: 'about',
      value: {
        portraitPath:
          'https://xyz.supabase.co/storage/v1/object/public/media/content/histoire/portrait.webp',
      },
      updated_at: '2026-08-01T10:00:00+00:00',
    },
  ],
};

const source: SupabaseSource = {
  fetchTable: async (table) => TABLES[table] ?? [],
  downloadObject: async (path) => (path.includes('disparue') ? null : PNG),
};

const saved: string[] = [];
const sink: ImageSink = {
  save: async (path) => {
    saved.push(path);
    return `https://store.public.blob.vercel-storage.com/${path}`;
  },
};

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDatabase());
});

afterAll(() => close());

describe('reprise depuis Supabase', () => {
  it('reconnaît les chemins du compartiment', () => {
    expect(supabaseObjectPath('collections/or/a.webp')).toBe('collections/or/a.webp');
    expect(supabaseObjectPath('media/collections/or/a.webp')).toBe('collections/or/a.webp');
    expect(
      supabaseObjectPath('https://x.supabase.co/storage/v1/object/public/media/content/b%20c.webp'),
    ).toBe('content/b c.webp');
    expect(supabaseObjectPath('/images/parure-or.jpg')).toBeNull();
    expect(supabaseObjectPath('')).toBeNull();
  });

  it('en simulation, ne copie ni n’écrit rien', async () => {
    const report = await importFromSupabase({ db, source, sink, dryRun: true });

    expect(report.collections).toBe(1);
    expect(saved).toHaveLength(0);
    expect(await db.select().from(collections)).toHaveLength(0);
  });

  it('copie les photos, réécrit les chemins et garde identifiants et positions', async () => {
    const report = await importFromSupabase({ db, source, sink });

    expect(report).toMatchObject({
      collections: 1,
      collectionImages: 1,
      gallery: 1,
      settings: 2,
      imagesCopied: 3,
      imagesMissing: ['collections/diamant/disparue.webp'],
    });

    const [collection] = await db.select().from(collections);
    expect(collection).toMatchObject({ id: COLLECTION_ID, slug: 'diamant', position: 1 });
    expect(collection!.created_at.toISOString()).toBe('2026-08-01T10:00:00.000Z');

    const images = await db.select().from(collectionImages).orderBy(asc(collectionImages.position));
    expect(images).toHaveLength(1);
    expect(images[0]!.storage_path).toBe(
      'https://store.public.blob.vercel-storage.com/collections/diamant/photo.webp',
    );

    // Les visuels livrés avec le site ne sont pas recopiés.
    const [tile] = await db.select().from(galleryImages);
    expect(tile).toMatchObject({
      storage_path: '/images/parure-or.jpg',
      status: 'hidden',
      col_span: 2,
    });

    const rows = await db.select().from(settings);
    const visuals = rows.find((row) => row.key === 'visuals')?.value as Record<
      string,
      { path: string }
    >;
    const about = rows.find((row) => row.key === 'about')?.value as { portraitPath: string };

    expect(visuals.heroMain!.path).toBe(
      'https://store.public.blob.vercel-storage.com/content/heromain/vitrine.webp',
    );
    expect(visuals.heroCard!.path).toBe('');
    expect(about.portraitPath).toBe(
      'https://store.public.blob.vercel-storage.com/content/histoire/portrait.webp',
    );
  });
});
