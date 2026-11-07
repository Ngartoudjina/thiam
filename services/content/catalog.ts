import 'server-only';

import { asc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { FAQ_ENTRIES } from '@/constants/faq';
import { GALLERY_TILES, MOBILE_GALLERY_TILES } from '@/constants/gallery';
import { SERVICES } from '@/constants/services';
import { FEATURED_TESTIMONIAL, HERO_TESTIMONIAL, TESTIMONIALS } from '@/constants/testimonials';
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from '@/lib/cache';
import { faq, galleryImages, services, testimonials } from '@/lib/db/schema';
import { serviceIconSchema } from '@/lib/schemas/content';
import { toMediaAsset } from '@/services/content/media';
import { publicDb, readOrFallback } from '@/services/content/read';
import type { FaqEntry, GalleryTile, Service, Testimonial } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

const cachedServices = unstable_cache(
  async (): Promise<readonly Service[] | null> => {
    const db = publicDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(services)
      .where(eq(services.status, 'visible'))
      .orderBy(asc(services.position));

    if (rows.length === 0) return null;

    return rows.map((row) => {
      const icon = serviceIconSchema.safeParse(row.icon);

      return {
        id: row.id,
        icon: icon.success ? icon.data : 'repair',
        title: row.title,
        description: row.description,
        price: row.price,
      };
    });
  },
  ['services-publics'],
  { tags: [CACHE_TAGS.services], revalidate: CONTENT_REVALIDATE_SECONDS },
);

export const getServices = cache((): Promise<readonly Service[]> =>
  readOrFallback('services', cachedServices, SERVICES),
);

/* -------------------------------------------------------------------------- */
/*  Témoignages                                                                */
/* -------------------------------------------------------------------------- */

const clampRating = (value: number): Testimonial['rating'] =>
  Math.min(5, Math.max(1, Math.round(value))) as Testimonial['rating'];

export interface TestimonialsContent {
  /** Avis du bandeau de preuve sociale, sous le hero. */
  readonly hero: Testimonial;
  /** Grand témoignage de la section « Ce que l'on dit de nous ». */
  readonly featured: Testimonial;
  /** Les trois cartes, et le carrousel mobile. */
  readonly cards: readonly Testimonial[];
}

const TESTIMONIALS_FALLBACK: TestimonialsContent = {
  hero: HERO_TESTIMONIAL,
  featured: FEATURED_TESTIMONIAL,
  cards: TESTIMONIALS,
};

const cachedTestimonials = unstable_cache(
  async (): Promise<TestimonialsContent | null> => {
    const db = publicDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.status, 'visible'))
      .orderBy(asc(testimonials.position));

    if (rows.length === 0) return null;

    const all: Testimonial[] = rows.map((row) => ({
      id: row.id,
      quote: row.quote,
      author: row.author,
      context: row.context,
      rating: clampRating(row.rating),
    }));

    const featuredId = rows.find((row) => row.is_featured)?.id;
    const featured = all.find((item) => item.id === featuredId);
    const cards = all.filter((item) => item.id !== featured?.id);

    return {
      hero: cards[0] ?? featured ?? all[0] ?? HERO_TESTIMONIAL,
      featured: featured ?? all[0] ?? FEATURED_TESTIMONIAL,
      cards: cards.length > 0 ? cards : all,
    };
  },
  ['temoignages-publics'],
  { tags: [CACHE_TAGS.testimonials], revalidate: CONTENT_REVALIDATE_SECONDS },
);

export const getTestimonials = cache((): Promise<TestimonialsContent> =>
  readOrFallback('témoignages', cachedTestimonials, TESTIMONIALS_FALLBACK),
);

/* -------------------------------------------------------------------------- */
/*  Questions fréquentes                                                       */
/* -------------------------------------------------------------------------- */

const cachedFaq = unstable_cache(
  async (): Promise<readonly FaqEntry[] | null> => {
    const db = publicDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(faq)
      .where(eq(faq.status, 'visible'))
      .orderBy(asc(faq.position));

    if (rows.length === 0) return null;

    return rows.map((row) => ({ id: row.id, question: row.question, answer: row.answer }));
  },
  ['faq-publique'],
  { tags: [CACHE_TAGS.faq], revalidate: CONTENT_REVALIDATE_SECONDS },
);

export const getFaqEntries = cache((): Promise<readonly FaqEntry[]> =>
  readOrFallback('questions', cachedFaq, FAQ_ENTRIES),
);

/* -------------------------------------------------------------------------- */
/*  Galerie                                                                    */
/* -------------------------------------------------------------------------- */

export interface GalleryContent {
  readonly tiles: readonly GalleryTile[];
  readonly mobileTiles: readonly GalleryTile[];
}

const GALLERY_FALLBACK: GalleryContent = {
  tiles: GALLERY_TILES,
  mobileTiles: MOBILE_GALLERY_TILES,
};

const cachedGallery = unstable_cache(
  async (): Promise<GalleryContent | null> => {
    const db = publicDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.status, 'visible'))
      .orderBy(asc(galleryImages.position));

    const tiles: GalleryTile[] = rows.flatMap((row) => {
      const image = toMediaAsset(row);
      if (!image) return [];

      return [
        {
          id: row.id,
          image,
          ...(row.caption ? { caption: row.caption } : {}),
          span: { cols: row.col_span, rows: row.row_span },
        },
      ];
    });

    if (tiles.length === 0) return null;

    return {
      tiles,
      // Le rail mobile ne montre que les premières tuiles, en format uniforme.
      mobileTiles: tiles.slice(0, 5).map((tile) => ({ ...tile, span: { cols: 1, rows: 2 } })),
    };
  },
  ['galerie-publique'],
  { tags: [CACHE_TAGS.gallery], revalidate: CONTENT_REVALIDATE_SECONDS },
);

export const getGallery = cache((): Promise<GalleryContent> =>
  readOrFallback('galerie', cachedGallery, GALLERY_FALLBACK),
);
