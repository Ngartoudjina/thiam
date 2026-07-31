import type { Metadata } from 'next';
import { SITE } from '@/constants/site';

interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly keywords?: readonly string[];
}

const BASE_KEYWORDS = [
  'bijouterie Cotonou',
  'bijoutier Bénin',
  'or 18 carats Cotonou',
  'or 24 carats',
  'alliances Cotonou',
  'diamant Bénin',
  'bijou sur mesure Cotonou',
  'rachat or Cotonou',
  'THIAM 24 Carats',
] as const;

export const absoluteUrl = (path: string): string =>
  new URL(path, SITE.url).toString().replace(/\/$/, path === '/' ? '/' : '');

/**
 * Fabrique la metadata d'une page : titre, description, canonique,
 * Open Graph et Twitter Card, toujours cohérents entre eux.
 */
export function createMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords: [...BASE_KEYWORDS, ...keywords],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
