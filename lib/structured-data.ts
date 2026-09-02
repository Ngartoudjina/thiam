import { COLLECTIONS } from '@/constants/collections';
import { FAQ_ENTRIES } from '@/constants/faq';
import { SERVICES } from '@/constants/services';
import { LOCATION, MAPS, SITE } from '@/constants/site';
import { DEFAULT_CONTACT, DEFAULT_HOURS } from '@/constants/defaults';
import { RATING } from '@/constants/testimonials';
import { absoluteUrl } from '@/lib/seo';
import { toSchemaOpeningHours } from '@/lib/opening-hours';
import { ROUTES } from '@/constants/navigation';
import type { ContactSettings, HoursContent } from '@/lib/schemas/content';
import type { Collection, FaqEntry, Service } from '@/types';

interface StoreSchemaInput {
  readonly contact?: ContactSettings;
  readonly hours?: HoursContent;
  readonly services?: readonly Service[];
  readonly collections?: readonly Collection[];
}

/**
 * Données structurées schema.org.
 * Le type de référence est `JewelryStore`, qui hérite de `LocalBusiness` :
 * c'est ce que Google attend pour un commerce physique de bijouterie.
 *
 * Les coordonnées, horaires et prestations proviennent du tableau de bord :
 * une modification en base se répercute donc aussi dans le balisage.
 */
export function buildJewelryStoreSchema({
  contact = DEFAULT_CONTACT,
  hours = DEFAULT_HOURS,
  services = SERVICES,
  collections = COLLECTIONS,
}: StoreSchemaInput = {}): Record<string, unknown> {
  const sameAs = [contact.instagram, contact.facebook].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    '@id': absoluteUrl('/#boutique'),
    name: SITE.name,
    alternateName: SITE.shortName,
    description: SITE.description,
    url: SITE.url,
    telephone: contact.phoneE164,
    email: contact.email,
    image: absoluteUrl('/opengraph-image'),
    logo: absoluteUrl('/brand/thiam-logo.png'),
    foundingDate: String(SITE.foundedYear),
    priceRange: '$$$',
    currenciesAccepted: 'XOF',
    paymentAccepted: 'Espèces, Mobile Money, Virement',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.streetAddress || undefined,
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
    openingHoursSpecification: toSchemaOpeningHours(hours.days),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: RATING.value,
      reviewCount: RATING.count,
      bestRating: RATING.best,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    makesOffer: services.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
      },
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Collections',
      itemListElement: collections.map((collection) => ({
        '@type': 'OfferCatalog',
        name: collection.name,
        description: collection.description ?? collection.tagline,
      })),
    },
  };
}

export function buildWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#site'),
    url: SITE.url,
    name: SITE.name,
    inLanguage: SITE.language,
    publisher: { '@id': absoluteUrl('/#boutique') },
  };
}

export function buildFaqSchema(
  entries: readonly FaqEntry[] = FAQ_ENTRIES,
): Record<string, unknown> {
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

export function buildCollectionPageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: absoluteUrl(ROUTES.collections),
    name: 'Collections — Bijouterie THIAM 24 Carats',
    about: { '@id': absoluteUrl('/#boutique') },
  };
}
