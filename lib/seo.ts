import type { Metadata } from 'next';
import { LOCATION, SITE } from '@/constants/site';

interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly keywords?: readonly string[];
  /**
   * Vignette de partage propre à la page. À défaut, celle de la maison
   * (`/opengraph-image`) est reprise par héritage depuis la mise en page.
   */
  readonly image?: { readonly src: string; readonly alt: string };
  /** Page de service ou d'article plutôt que simple page de site. */
  readonly type?: 'website' | 'article';
  /** Retire la page de l'index — pages utilitaires sans valeur de recherche. */
  readonly noIndex?: boolean;
}

/**
 * Mots-clés communs à toutes les pages.
 *
 * Ils ne pèsent plus dans le classement depuis longtemps, mais restent lus par
 * certains moteurs et agrégateurs locaux ; surtout, ils tiennent lieu de
 * mémo partagé sur les requêtes que la maison vise réellement.
 */
const BASE_KEYWORDS = [
  'bijouterie Cotonou',
  'bijoutier Bénin',
  'joaillier Cotonou',
  'THIAM 24 Carats',
] as const;

/** Requêtes visées par page — reprises dans les titres et les intertitres. */
export const PAGE_KEYWORDS = {
  home: [
    'bijouterie à Cotonou',
    'or 18 carats Cotonou',
    'or 21 carats Cotonou',
    'or 24 carats Cotonou',
    'diamant Cotonou',
    'bijou sur mesure Bénin',
  ],
  collections: [
    'bijoux or Cotonou',
    'parure or Bénin',
    'bague diamant Cotonou',
    'bijoux argent Cotonou',
    'montres Cotonou',
  ],
  buyback: [
    "rachat d'or Cotonou",
    'vendre son or à Cotonou',
    "prix de l'or au gramme Cotonou",
    "cours de l'or Bénin",
    'rachat bijoux cassés Cotonou',
    'or dentaire rachat',
  ],
  wedding: [
    'alliances Cotonou',
    'alliances mariage Bénin',
    'bague de fiançailles Cotonou',
    'parure de dot Bénin',
    'gravure alliance Cotonou',
  ],
  contact: ['bijouterie ouverte Cotonou', 'adresse bijouterie Cotonou'],
} as const satisfies Record<string, readonly string[]>;

/** URL absolue et canonique d'un chemin interne. */
export const absoluteUrl = (path: string): string => new URL(path, SITE.url).toString();

/**
 * Vignette de partage par défaut — celle que `app/opengraph-image.tsx` génère.
 *
 * Next ne la rattache automatiquement qu'aux pages qui ne déclarent pas leur
 * propre bloc `openGraph`. Comme toutes les pages passent ici, il faut la
 * poser explicitement : sans elle, un lien partagé sur WhatsApp ou Facebook
 * s'affiche en texte nu, sans image.
 */
const DEFAULT_SHARE_IMAGE = {
  src: '/opengraph-image',
  alt: `${SITE.name} — ${SITE.tagline}`,
} as const;

/**
 * Fabrique la metadata d'une page : titre, description, canonique, Open Graph
 * et Twitter Card, toujours cohérents entre eux.
 *
 * La canonique est systématique : sans elle, `?univers=`, `?utm_source=` et la
 * variante sans `www` seraient autant de pages distinctes aux yeux de Google.
 */
export function createMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  type = 'website',
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const share = image ?? DEFAULT_SHARE_IMAGE;

  return {
    title,
    description,
    keywords: [...BASE_KEYWORDS, ...keywords],
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title,
      description,
      images: [{ url: share.src, width: 1200, height: 630, alt: share.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [share.src],
    },
    other: {
      // Repères géographiques hérités des annuaires locaux : peu de moteurs les
      // lisent encore, mais ils ne coûtent rien et servent au référencement
      // régional en Afrique de l'Ouest.
      'geo.region': `${LOCATION.countryCode}-LI`,
      'geo.placename': LOCATION.city,
      'geo.position': `${LOCATION.latitude};${LOCATION.longitude}`,
      ICBM: `${LOCATION.latitude}, ${LOCATION.longitude}`,
    },
  };
}
