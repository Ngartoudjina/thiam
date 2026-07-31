import type { MetadataRoute } from 'next';
import { COLLECTIONS } from '@/constants/collections';
import { ROUTES } from '@/constants/navigation';
import { absoluteUrl } from '@/lib/seo';

/** Plan du site — les univers sont exposés comme autant d'entrées filtrées. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: absoluteUrl(ROUTES.home), lastModified, changeFrequency: 'monthly', priority: 1 },
    {
      url: absoluteUrl(ROUTES.collections),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: absoluteUrl(ROUTES.contact), lastModified, changeFrequency: 'yearly', priority: 0.8 },
    ...COLLECTIONS.map((collection) => ({
      url: absoluteUrl(`${ROUTES.collections}?univers=${collection.slug}`),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    { url: absoluteUrl(ROUTES.legal), lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl(ROUTES.privacy), lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
