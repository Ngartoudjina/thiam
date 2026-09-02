import { COLLECTIONS } from '@/constants/collections';
import { BUYBACK } from '@/constants/craft';
import { FAQ_ENTRIES } from '@/constants/faq';
import { MEDIA } from '@/constants/media';
import { SERVICES } from '@/constants/services';
import { LOCATION, MAPS, SITE } from '@/constants/site';
import { DEFAULT_CONTACT, DEFAULT_HOURS } from '@/constants/defaults';
import { absoluteUrl } from '@/lib/seo';
import { toSchemaOpeningHours } from '@/lib/opening-hours';
import { ROUTES } from '@/constants/navigation';
import type { ContactSettings, HoursContent } from '@/lib/schemas/content';
import type { Collection, FaqEntry, Service } from '@/types';

/** Identifiants stables du graphe : les nœuds se référencent entre eux. */
export const SCHEMA_ID = {
  store: absoluteUrl('/#boutique'),
  website: absoluteUrl('/#site'),
  logo: absoluteUrl('/#logo'),
} as const;

interface StoreSchemaInput {
  readonly contact?: ContactSettings;
  readonly hours?: HoursContent;
  readonly services?: readonly Service[];
  readonly collections?: readonly Collection[];
}

/**
 * Données structurées schema.org.
 *
 * Le type de référence est `JewelryStore`, qui hérite de `LocalBusiness` :
 * c'est ce que Google attend pour un commerce physique de bijouterie.
 *
 * Les coordonnées, horaires et prestations proviennent du tableau de bord :
 * une modification en base se répercute donc aussi dans le balisage.
 *
 * Aucun `aggregateRating` n'est déclaré ici, volontairement. Google ignore les
 * notes qu'une entreprise s'attribue à elle-même sur son propre site pour les
 * types `LocalBusiness` et `Organization`, et un balisage d'avis non adossé à
 * de vrais avis collectés expose à une action manuelle. Les étoiles affichées
 * dans les résultats viennent de la fiche Google de l'établissement, à laquelle
 * `hasMap` et `sameAs` rattachent explicitement ce site.
 */
export function buildJewelryStoreSchema({
  contact = DEFAULT_CONTACT,
  hours = DEFAULT_HOURS,
  services = SERVICES,
  collections = COLLECTIONS,
}: StoreSchemaInput = {}): Record<string, unknown> {
  const sameAs = [contact.instagram, contact.facebook, MAPS.placeHref].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    '@id': SCHEMA_ID.store,
    name: SITE.name,
    alternateName: SITE.shortName,
    legalName: SITE.name,
    description: SITE.description,
    slogan: `${SITE.tagline} — ${SITE.taglineSecond}`,
    url: SITE.url,
    telephone: contact.phoneE164,
    email: contact.email,
    // Plusieurs visuels : Google en retient un selon le format du résultat.
    image: [
      absoluteUrl('/opengraph-image'),
      absoluteUrl(MEDIA.heroParure.src),
      absoluteUrl(MEDIA.alliances.src),
      absoluteUrl(MEDIA.rachatPesee.src),
    ],
    logo: {
      '@type': 'ImageObject',
      '@id': SCHEMA_ID.logo,
      url: absoluteUrl('/brand/thiam-logo.png'),
      width: 1772,
      height: 1772,
      caption: SITE.name,
    },
    foundingDate: String(SITE.foundedYear),
    priceRange: '$$$',
    currenciesAccepted: 'XOF',
    paymentAccepted: 'Espèces, Mobile Money, Virement',
    knowsLanguage: ['fr', 'fon', 'yo'],
    address: {
      '@type': 'PostalAddress',
      ...(contact.streetAddress ? { streetAddress: contact.streetAddress } : {}),
      addressLocality: contact.city,
      addressCountry: LOCATION.countryCode,
    },
    // Lien vers la fiche Google : Google rattache ainsi la fiche au site.
    hasMap: MAPS.placeHref,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: LOCATION.latitude,
      longitude: LOCATION.longitude,
    },
    // Zone desservie : la clientèle vient de tout le littoral, pas seulement
    // du quartier de la boutique.
    areaServed: [
      { '@type': 'City', name: LOCATION.city },
      { '@type': 'City', name: 'Porto-Novo' },
      { '@type': 'City', name: 'Abomey-Calavi' },
      { '@type': 'Country', name: LOCATION.country },
    ],
    openingHoursSpecification: toSchemaOpeningHours(hours.days),
    sameAs,
    makesOffer: services.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
      },
      priceCurrency: 'XOF',
      availableAtOrFrom: { '@id': SCHEMA_ID.store },
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Collections',
      itemListElement: collections.map((collection) => ({
        '@type': 'OfferCatalog',
        name: collection.name,
        description: collection.description ?? collection.tagline,
        url: absoluteUrl(`${ROUTES.collections}?univers=${collection.slug}`),
      })),
    },
  };
}

export function buildWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SCHEMA_ID.website,
    url: SITE.url,
    name: SITE.name,
    alternateName: SITE.shortName,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { '@id': SCHEMA_ID.store },
    copyrightHolder: { '@id': SCHEMA_ID.store },
  };
}

export function buildBreadcrumbSchema(
  trail: ReadonlyArray<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

interface WebPageInput {
  readonly name: string;
  readonly description: string;
  readonly path: string;
  readonly image?: string;
  readonly trail?: ReadonlyArray<{ name: string; path: string }>;
}

/**
 * Nœud `WebPage` d'une page donnée, relié au site et à la boutique.
 * C'est lui qui porte le fil d'Ariane : Google rattache le `breadcrumb` à la
 * page plutôt que de le lire isolément.
 */
export function buildWebPageSchema({
  name,
  description,
  path,
  image,
  trail,
}: WebPageInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(path)}#page`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: SITE.language,
    isPartOf: { '@id': SCHEMA_ID.website },
    about: { '@id': SCHEMA_ID.store },
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(image) } } : {}),
    ...(trail ? { breadcrumb: buildBreadcrumbSchema(trail) } : {}),
  };
}

export function buildFaqSchema(entries: readonly FaqEntry[] = FAQ_ENTRIES): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

export function buildCollectionPageSchema(
  collections: readonly Collection[] = COLLECTIONS,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(ROUTES.collections)}#page`,
    url: absoluteUrl(ROUTES.collections),
    name: `Vitrine — ${SITE.name}`,
    description:
      'Les univers présentés en boutique : mariage et alliances, diamant, or 14 à 24 carats, argent, montres et créations sur mesure.',
    inLanguage: SITE.language,
    isPartOf: { '@id': SCHEMA_ID.website },
    about: { '@id': SCHEMA_ID.store },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collections.length,
      itemListElement: collections.map((collection, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: collection.name,
        description: collection.description ?? collection.tagline,
        url: absoluteUrl(`${ROUTES.collections}?univers=${collection.slug}`),
      })),
    },
  };
}

/**
 * Prestation de rachat d'or.
 *
 * C'est l'activité à plus forte intention de recherche de la maison
 * (« rachat d'or Cotonou », « vendre son or ») : elle mérite son propre nœud
 * `Service`, distinct de la simple offre listée sur la boutique.
 */
export function buildBuybackServiceSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl(ROUTES.buyback)}#service`,
    name: 'Rachat d’or au cours du jour',
    serviceType: 'Rachat d’or',
    description: BUYBACK.description,
    url: absoluteUrl(ROUTES.buyback),
    provider: { '@id': SCHEMA_ID.store },
    areaServed: [
      { '@type': 'City', name: LOCATION.city },
      { '@type': 'Country', name: LOCATION.country },
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceLocation: { '@id': SCHEMA_ID.store },
      servicePhone: DEFAULT_CONTACT.phoneE164,
      serviceUrl: absoluteUrl(ROUTES.buyback),
    },
    termsOfService: BUYBACK.steps.map((step) => `${step.title} — ${step.description}`).join(' '),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      description: 'Estimation gratuite et sans engagement, paiement immédiat.',
      availableAtOrFrom: { '@id': SCHEMA_ID.store },
    },
  };
}

/** Prestation « alliances et bijoux de mariage », même logique que le rachat. */
export function buildWeddingServiceSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl(ROUTES.wedding)}#service`,
    name: 'Alliances et bijoux de mariage',
    serviceType: 'Alliances, bagues de fiançailles et parures de dot',
    description:
      'Alliances en or 14 à 24 carats gravées à la main, bagues de fiançailles serties de diamants et parures de dot, façonnées dans notre atelier de Cotonou.',
    url: absoluteUrl(ROUTES.wedding),
    provider: { '@id': SCHEMA_ID.store },
    areaServed: [
      { '@type': 'City', name: LOCATION.city },
      { '@type': 'Country', name: LOCATION.country },
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceLocation: { '@id': SCHEMA_ID.store },
      servicePhone: DEFAULT_CONTACT.phoneE164,
      serviceUrl: absoluteUrl(ROUTES.wedding),
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      description: 'Devis en 48 h, gravure offerte sur les alliances.',
      availableAtOrFrom: { '@id': SCHEMA_ID.store },
    },
  };
}
