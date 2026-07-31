import 'server-only';

import { unstable_cache } from 'next/cache';
import { FAQ_ENTRIES } from '@/constants/faq';
import { GALLERY_TILES, MOBILE_GALLERY_TILES } from '@/constants/gallery';
import { SERVICES } from '@/constants/services';
import { FEATURED_TESTIMONIAL, HERO_TESTIMONIAL, TESTIMONIALS } from '@/constants/testimonials';
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from '@/lib/cache';
import { serviceIconSchema } from '@/lib/schemas/content';
import { createPublicSupabase } from '@/lib/supabase/server';
import { toMediaAsset } from '@/services/content/media';
import type { FaqEntry, GalleryTile, Service, Testimonial } from '@/types';

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

export const getServices = unstable_cache(
  async (): Promise<readonly Service[]> => {
    const supabase = createPublicSupabase();
    if (!supabase) return SERVICES;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'visible')
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) return SERVICES;

    return data.map((row) => {
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

/* -------------------------------------------------------------------------- */
/*  Témoignages                                                                */
/* -------------------------------------------------------------------------- */

const clampRating = (value: number): Testimonial['rating'] => {
  const rounded = Math.min(5, Math.max(1, Math.round(value)));
  return rounded as Testimonial['rating'];
};

export interface TestimonialsContent {
  /** Avis du bandeau de preuve sociale, sous le hero. */
  readonly hero: Testimonial;
  /** Grand témoignage de la section « Ce que l'on dit de nous ». */
  readonly featured: Testimonial;
  /** Les trois cartes, et le carrousel mobile. */
  readonly cards: readonly Testimonial[];
}

export const getTestimonials = unstable_cache(
  async (): Promise<TestimonialsContent> => {
    const fallback: TestimonialsContent = {
      hero: HERO_TESTIMONIAL,
      featured: FEATURED_TESTIMONIAL,
      cards: TESTIMONIALS,
    };

    const supabase = createPublicSupabase();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'visible')
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) return fallback;

    const all: Testimonial[] = data.map((row) => ({
      id: row.id,
      quote: row.quote,
      author: row.author,
      context: row.context,
      rating: clampRating(row.rating),
    }));

    const featuredRow = data.find((row) => row.is_featured);
    const featured = featuredRow ? all.find((item) => item.id === featuredRow.id) : undefined;

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

/* -------------------------------------------------------------------------- */
/*  Questions fréquentes                                                       */
/* -------------------------------------------------------------------------- */

export const getFaqEntries = unstable_cache(
  async (): Promise<readonly FaqEntry[]> => {
    const supabase = createPublicSupabase();
    if (!supabase) return FAQ_ENTRIES;

    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('status', 'visible')
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) return FAQ_ENTRIES;

    return data.map((row) => ({ id: row.id, question: row.question, answer: row.answer }));
  },
  ['faq-publique'],
  { tags: [CACHE_TAGS.faq], revalidate: CONTENT_REVALIDATE_SECONDS },
);

/* -------------------------------------------------------------------------- */
/*  Galerie                                                                    */
/* -------------------------------------------------------------------------- */

export interface GalleryContent {
  readonly tiles: readonly GalleryTile[];
  readonly mobileTiles: readonly GalleryTile[];
}

export const getGallery = unstable_cache(
  async (): Promise<GalleryContent> => {
    const fallback: GalleryContent = {
      tiles: GALLERY_TILES,
      mobileTiles: MOBILE_GALLERY_TILES,
    };

    const supabase = createPublicSupabase();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('status', 'visible')
      .order('position', { ascending: true });

    if (error || !data || data.length === 0) return fallback;

    const tiles: GalleryTile[] = data.map((row) => ({
      id: row.id,
      image: toMediaAsset(row),
      ...(row.caption ? { caption: row.caption } : {}),
      span: { cols: row.col_span, rows: row.row_span },
    }));

    return {
      tiles,
      // Le rail mobile ne montre que les premières tuiles, en format uniforme.
      mobileTiles: tiles.slice(0, 5).map((tile) => ({ ...tile, span: { cols: 1, rows: 2 } })),
    };
  },
  ['galerie-publique'],
  { tags: [CACHE_TAGS.gallery], revalidate: CONTENT_REVALIDATE_SECONDS },
);
