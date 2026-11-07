import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { COLLECTIONS, PIECES } from '@/constants/collections';
import { SERVICES } from '@/constants/services';
import { DEFAULT_CONTACT } from '@/constants/defaults';
import type { Database } from '@/lib/db/connection';
import { collections, pieces, settings } from '@/lib/db/schema';
import { seedInitialContent } from '@/lib/db/seed';
import { createTestDatabase } from './helpers/db';

const state = vi.hoisted(() => ({ db: null as unknown }));

vi.mock('@/lib/db', () => ({ getDb: () => state.db }));
vi.mock('next/cache', () => ({
  unstable_cache: <T>(fn: T) => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}));

const content = await import('@/services/content');
const { parseSettings, DEFAULT_SETTINGS } = await import('@/services/content/settings');

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDatabase());
});

afterAll(() => close());

beforeEach(() => {
  state.db = null;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('contenu public sans base', () => {
  it('sert le contenu de la maquette', async () => {
    await expect(content.getCollections()).resolves.toBe(COLLECTIONS);
    await expect(content.getPieces()).resolves.toBe(PIECES);
    await expect(content.getSiteSettings()).resolves.toBe(DEFAULT_SETTINGS);
  });
});

describe('contenu public avec une base vide', () => {
  it('sert encore la maquette', async () => {
    state.db = db;
    await expect(content.getCollections()).resolves.toBe(COLLECTIONS);
    await expect(content.getServices()).resolves.toBe(SERVICES);
  });
});

describe('contenu public en panne de base', () => {
  it('journalise et sert la maquette au lieu de faire tomber la page', async () => {
    state.db = {
      select: () => {
        throw new Error('fetch failed');
      },
    };

    await expect(content.getCollections()).resolves.toBe(COLLECTIONS);
    await expect(content.getSiteSettings()).resolves.toBe(DEFAULT_SETTINGS);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('contenu public après import', () => {
  beforeAll(async () => {
    await seedInitialContent(db);
  });

  it('lit les collections, leurs photos et leur ordre', async () => {
    state.db = db;
    const result = await content.getCollections();

    expect(result.map((collection) => collection.slug)).toEqual(
      COLLECTIONS.map((collection) => collection.slug),
    );
    expect(result[0]!.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(result[0]!.image?.src).toBe(COLLECTIONS[0]!.image?.src);
    // « Argent » n'a pas de photo : cadre d'attente.
    expect(result.find((collection) => collection.slug === 'argent')?.image).toBeNull();
  });

  it('n’affiche pas une collection masquée', async () => {
    state.db = db;
    await db.update(collections).set({ status: 'hidden' }).where(eq(collections.slug, 'montres'));

    const result = await content.getCollections();
    expect(result.some((collection) => collection.slug === 'montres')).toBe(false);

    await db.update(collections).set({ status: 'visible' }).where(eq(collections.slug, 'montres'));
  });

  it('lit les pièces avec leur univers et leur poids formaté', async () => {
    state.db = db;
    const result = await content.getPieces();
    const solitaire = result.find((piece) => piece.name === 'Solitaire Aube');

    expect(result).toHaveLength(PIECES.length);
    expect(solitaire).toMatchObject({
      collection: 'diamant',
      weight: '3,2 g',
      weightGrams: 3.2,
      badge: { label: 'Nouveau', tone: 'gold' },
    });
  });

  it('une pièce dont l’univers est supprimé reste en vitrine, sans univers', async () => {
    state.db = db;
    const [created] = await db
      .insert(collections)
      .values({ slug: 'ephemere', name: 'Éphémère' })
      .returning({ id: collections.id });
    await db.insert(pieces).values({ name: 'Bague témoin', collection_id: created!.id });
    await db.delete(collections).where(eq(collections.id, created!.id));

    const result = await content.getPieces();
    expect(result.find((piece) => piece.name === 'Bague témoin')).toMatchObject({
      collection: '',
      weight: '',
      image: null,
    });
  });

  it('lit les réglages enregistrés', async () => {
    state.db = db;
    const result = await content.getSiteSettings();

    expect(result.contact).toEqual(DEFAULT_CONTACT);
    expect(result.catalog.totalInStore).toBeGreaterThan(0);
  });

  it('ignore une image de provenance inconnue plutôt que de casser le rendu', async () => {
    state.db = db;
    await db.insert(pieces).values({
      name: 'Pièce importée',
      storage_path: 'https://exemple.com/photo.jpg',
      image_alt: 'Photo',
    });

    const result = await content.getPieces();
    expect(result.find((piece) => piece.name === 'Pièce importée')?.image).toBeNull();
  });
});

describe('lecture des réglages', () => {
  it('remplace un bloc invalide par sa valeur de repli, sans toucher aux autres', () => {
    const parsed = parseSettings([
      { key: 'contact', value: { phoneDisplay: 'invalide' } },
      { key: 'catalog', value: { totalInStore: 42 } },
    ]);

    expect(parsed.contact).toEqual(DEFAULT_SETTINGS.contact);
    expect(parsed.catalog.totalInStore).toBe(42);
  });

  it('reprend l’ancienne photo du bandeau dans l’emplacement « heroMain »', () => {
    const photo = 'https://abc.public.blob.vercel-storage.com/content/hero/photo.webp';
    const parsed = parseSettings([
      { key: 'hero', value: { ...DEFAULT_SETTINGS.hero, imagePath: photo, imageAlt: 'Parure' } },
    ]);

    expect(parsed.visuals.heroMain).toMatchObject({ path: photo, alt: 'Parure' });
  });

  it('un emplacement « heroMain » renseigné l’emporte sur l’ancienne saisie', () => {
    const current = '/media/content/heromain/actuelle.webp';
    const parsed = parseSettings([
      { key: 'hero', value: { ...DEFAULT_SETTINGS.hero, imagePath: '/media/ancienne.webp' } },
      {
        key: 'visuals',
        value: { ...DEFAULT_SETTINGS.visuals, heroMain: { path: current, alt: 'Actuelle' } },
      },
    ]);

    expect(parsed.visuals.heroMain.path).toBe(current);
  });
});

describe('import du contenu', () => {
  it('refuse un second import et n’écrase pas les réglages saisis', async () => {
    await expect(seedInitialContent(db)).resolves.toBeNull();

    const [contact] = await db.select().from(settings).where(eq(settings.key, 'contact'));
    expect(contact).toBeDefined();
  });
});
