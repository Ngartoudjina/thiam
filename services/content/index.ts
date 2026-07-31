import 'server-only';

import { getCollections } from '@/services/content/collections';
import {
  getFaqEntries,
  getGallery,
  getServices,
  getTestimonials,
} from '@/services/content/catalog';
import { getSiteSettings } from '@/services/content/settings';

export { getCollections } from '@/services/content/collections';
export {
  getFaqEntries,
  getGallery,
  getServices,
  getTestimonials,
} from '@/services/content/catalog';
export { contactLinks, getSiteSettings } from '@/services/content/settings';
export type { GalleryContent, TestimonialsContent } from '@/services/content/catalog';
export type { SiteSettings } from '@/services/content/settings';

/**
 * Charge en une fois tout ce dont la page d'accueil a besoin.
 * Les requêtes partent en parallèle : une seule attente pour l'ensemble.
 */
export async function getHomeContent() {
  const [settings, collections, services, testimonials, faq, gallery] = await Promise.all([
    getSiteSettings(),
    getCollections(),
    getServices(),
    getTestimonials(),
    getFaqEntries(),
    getGallery(),
  ]);

  return { settings, collections, services, testimonials, faq, gallery } as const;
}

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>;
