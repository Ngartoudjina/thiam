import type { MetadataRoute } from 'next';
import { MEDIA } from '@/constants/media';
import { ROUTES } from '@/constants/navigation';
import { absoluteUrl } from '@/lib/seo';

/**
 * Plan du site.
 *
 * Seules les vraies pages y figurent. Les univers de la vitrine
 * (`/collections?univers=…`) en sont volontairement absents : ce sont des
 * filtres sur une même page, dont la canonique pointe vers `/collections`.
 * Les déclarer ici enverrait à Google un signal contraire à cette canonique.
 *
 * Chaque entrée porte son visuel principal : les images ainsi déclarées
 * peuvent remonter dans Google Images, où la bijouterie a tout à gagner.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl(ROUTES.home),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      images: [absoluteUrl(MEDIA.heroParure.src)],
    },
    {
      url: absoluteUrl(ROUTES.collections),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [absoluteUrl(MEDIA.presentationParures.src)],
    },
    {
      url: absoluteUrl(ROUTES.buyback),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [absoluteUrl(MEDIA.rachatPesee.src)],
    },
    {
      url: absoluteUrl(ROUTES.wedding),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [absoluteUrl(MEDIA.alliances.src)],
    },
    {
      url: absoluteUrl(ROUTES.contact),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: absoluteUrl(ROUTES.legal), lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl(ROUTES.privacy), lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
