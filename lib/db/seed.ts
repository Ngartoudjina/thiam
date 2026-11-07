import { randomUUID } from 'node:crypto';
import { count } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { COLLECTIONS, PIECES, TOTAL_PIECES } from '@/constants/collections';
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_HOURS,
  DEFAULT_STATS,
  DEFAULT_VISUALS,
} from '@/constants/defaults';
import { FAQ_ENTRIES } from '@/constants/faq';
import { GALLERY_TILES } from '@/constants/gallery';
import { SERVICES } from '@/constants/services';
import { FEATURED_TESTIMONIAL, HERO_TESTIMONIAL, TESTIMONIALS } from '@/constants/testimonials';
import type { Database } from '@/lib/db/connection';
import { parseWeight } from '@/lib/format';
import {
  collectionImages,
  collections,
  faq,
  galleryImages,
  pieces,
  services,
  settings,
  testimonials,
} from '@/lib/db/schema';
import { SETTING_KEYS } from '@/lib/schemas/content';

/**
 * Amorçage du contenu.
 *
 * Recopie en base le contenu livré avec la maquette, pour que le tableau de
 * bord démarre plein plutôt que vide. Les photographies ne sont pas
 * téléversées : elles sont référencées par leur chemin public (`/images/…`),
 * si bien que la vitrine reste strictement identique après l'import.
 *
 * Partagé par le bouton du tableau de bord et par `npm run db:seed`.
 */

export interface SeedReport {
  readonly collections: number;
  readonly collectionImages: number;
  readonly pieces: number;
  readonly gallery: number;
  readonly services: number;
  readonly testimonials: number;
  readonly faq: number;
}

export async function hasCollections(db: Database): Promise<boolean> {
  const [row] = await db.select({ total: count() }).from(collections);
  return (row?.total ?? 0) > 0;
}

/**
 * Insère le contenu de la maquette. Renvoie `null` si des collections
 * existent déjà : on n'écrase jamais un contenu réel par erreur.
 */
export async function seedInitialContent(db: Database): Promise<SeedReport | null> {
  if (await hasCollections(db)) return null;

  // Identifiants tirés à l'avance : les photos et les pièces peuvent ainsi
  // désigner leur collection sans attendre le retour de l'insertion, et tout
  // part en un seul lot.
  const idBySlug = new Map(COLLECTIONS.map((collection) => [collection.slug, randomUUID()]));

  const collectionRows = COLLECTIONS.map((collection, index) => ({
    id: idBySlug.get(collection.slug) ?? randomUUID(),
    slug: collection.slug,
    name: collection.name,
    tagline: collection.tagline,
    description: collection.description ?? null,
    category: 'bijoux',
    status: 'visible' as const,
    position: index,
  }));

  const imageRows = COLLECTIONS.flatMap((collection) => {
    const id = idBySlug.get(collection.slug);
    if (!id || !collection.image) return [];

    return [
      {
        collection_id: id,
        storage_path: collection.image.src,
        alt: collection.image.alt,
        width: collection.image.width,
        height: collection.image.height,
        position: 0,
        is_primary: true,
      },
    ];
  });

  const pieceRows = PIECES.map((piece, index) => ({
    name: piece.name,
    detail: piece.detail,
    detail_short: piece.detailShort,
    weight_grams: parseWeight(piece.weight),
    collection_id: idBySlug.get(piece.collection) ?? null,
    storage_path: piece.image?.src ?? null,
    image_alt: piece.image?.alt ?? '',
    image_width: piece.image?.width ?? 0,
    image_height: piece.image?.height ?? 0,
    badge_label: piece.badge?.label ?? null,
    badge_tone: piece.badge?.tone ?? null,
    status: 'visible' as const,
    position: index,
  }));

  const galleryRows = GALLERY_TILES.flatMap((tile, index) =>
    tile.image
      ? [
          {
            storage_path: tile.image.src,
            alt: tile.image.alt,
            caption: tile.caption ?? null,
            width: tile.image.width,
            height: tile.image.height,
            col_span: tile.span.cols,
            row_span: tile.span.rows,
            status: 'visible' as const,
            position: index,
          },
        ]
      : [],
  );

  const serviceRows = SERVICES.map((service, index) => ({
    icon: service.icon,
    title: service.title,
    description: service.description,
    price: service.price,
    status: 'visible' as const,
    position: index,
  }));

  const testimonialRows = [
    { ...FEATURED_TESTIMONIAL, is_featured: true },
    { ...HERO_TESTIMONIAL, is_featured: false },
    ...TESTIMONIALS.map((testimonial) => ({ ...testimonial, is_featured: false })),
  ].map((testimonial, index) => ({
    quote: testimonial.quote,
    author: testimonial.author,
    context: testimonial.context,
    rating: testimonial.rating,
    is_featured: testimonial.is_featured,
    status: 'visible' as const,
    position: index,
  }));

  const faqRows = FAQ_ENTRIES.map((entry, index) => ({
    question: entry.question,
    answer: entry.answer,
    status: 'visible' as const,
    position: index,
  }));

  const settingRows = [
    { key: SETTING_KEYS.hero, value: DEFAULT_HERO },
    { key: SETTING_KEYS.about, value: DEFAULT_ABOUT },
    { key: SETTING_KEYS.contact, value: DEFAULT_CONTACT },
    { key: SETTING_KEYS.hours, value: DEFAULT_HOURS },
    { key: SETTING_KEYS.stats, value: DEFAULT_STATS },
    { key: SETTING_KEYS.visuals, value: DEFAULT_VISUALS },
    { key: SETTING_KEYS.catalog, value: { totalInStore: TOTAL_PIECES } },
  ];

  const statements = [
    db.insert(collections).values(collectionRows),
    imageRows.length > 0 ? db.insert(collectionImages).values(imageRows) : null,
    pieceRows.length > 0 ? db.insert(pieces).values(pieceRows) : null,
    galleryRows.length > 0 ? db.insert(galleryImages).values(galleryRows) : null,
    db.insert(services).values(serviceRows),
    db.insert(testimonials).values(testimonialRows),
    db.insert(faq).values(faqRows),
    // Un réglage déjà saisi depuis le tableau de bord n'est jamais écrasé.
    db.insert(settings).values(settingRows).onConflictDoNothing({ target: settings.key }),
  ].filter((statement) => statement !== null);

  /*
   * Avec Neon, le lot part en une seule transaction HTTP : tout ou rien. Les
   * autres pilotes (base embarquée des tests) exécutent les instructions une
   * à une.
   */
  if ('batch' in db && typeof db.batch === 'function') {
    await db.batch(statements as unknown as readonly [BatchItem<'pg'>, ...BatchItem<'pg'>[]]);
  } else {
    for (const statement of statements) await statement;
  }

  return {
    collections: collectionRows.length,
    collectionImages: imageRows.length,
    pieces: pieceRows.length,
    gallery: galleryRows.length,
    services: serviceRows.length,
    testimonials: testimonialRows.length,
    faq: faqRows.length,
  };
}
