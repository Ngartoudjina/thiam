import type { OpeningDay } from '@/types';

const RAW_PHONE = '2290197844022';

/**
 * Identité et coordonnées de la maison.
 * Source unique : toute la mise en page lit ces valeurs, jamais des chaînes
 * codées en dur dans les composants.
 */
export const SITE = {
  name: 'Bijouterie THIAM 24 Carats',
  shortName: 'THIAM 24 Carats',
  wordmark: 'THIAM',
  wordmarkSuffix: '24 CARATS',
  /** Slogan de la maison, tel que retenu par la direction. */
  tagline: 'Une référence de qualité',
  taglineSecond: 'Or, argent et diamant',
  description:
    'Bijoutier joaillier à Cotonou. Or 14, 18, 21 et 24 carats, diamants, alliances et créations sur mesure. Pesée devant vous, certificat nominatif, atelier sur place.',
  locale: 'fr_BJ',
  language: 'fr',
  foundedYear: 2012,
  copyrightYear: 2026,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thiam24carats.bj',
} as const;

export const CONTACT = {
  phoneDisplay: '+229 01 97 84 40 22',
  phoneHref: `tel:+${RAW_PHONE}`,
  phoneE164: `+${RAW_PHONE}`,
  whatsappHref: `https://wa.me/${RAW_PHONE}`,
  /** Message pré-rempli : réduit la friction du premier contact. */
  whatsappWithMessage: (message: string): string =>
    `https://wa.me/${RAW_PHONE}?text=${encodeURIComponent(message)}`,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'thiam24carats@gmail.com',
} as const;

export const LOCATION = {
  city: 'Cotonou',
  country: 'Bénin',
  countryCode: 'BJ',
  cityCountry: 'Cotonou, Bénin',
  /** Renseigné par la maison — la maquette indique « à compléter ». */
  streetAddress: process.env.NEXT_PUBLIC_STREET_ADDRESS ?? '',
  streetAddressFallback: 'Adresse détaillée à compléter',
  /** Relevées sur la fiche Google de l'établissement. */
  latitude: 6.35966,
  longitude: 2.425658,
  timeZone: 'Africa/Porto-Novo',
  mapsQuery: process.env.NEXT_PUBLIC_MAPS_QUERY ?? 'Bijouterie THIAM 24 Carats, Cotonou, Bénin',
} as const;

const COORDS = `${LOCATION.latitude},${LOCATION.longitude}`;

/**
 * Cartographie.
 *
 * Les liens visent les coordonnées exactes de la fiche Google de la maison,
 * et non une recherche par nom : un itinéraire ne peut alors pas se tromper
 * d'établissement. Aucune clé d'API n'est nécessaire, ni pour les liens ni
 * pour la carte intégrée.
 */
export const MAPS = {
  /** Fiche complète de l'établissement sur Google Maps. */
  placeHref:
    'https://www.google.com/maps/place/Bijouterie+THIAM+24+CARATS/@6.35966,2.425658,17z/data=!3m1!4b1!4m6!3m5!1s0x102355ea6e9265c7:0x9cedde16500004fa!8m2!3d6.35966!4d2.425658!16s%2Fg%2F11xg89zbrw',

  /** Itinéraire depuis la position du visiteur. */
  directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${COORDS}`,

  searchHref: `https://www.google.com/maps/search/?api=1&query=${COORDS}`,

  /** Carte intégrée, centrée sur la boutique et légendée à son nom. */
  embedSrc:
    process.env.NEXT_PUBLIC_MAPS_EMBED_SRC ||
    `https://maps.google.com/maps?q=${encodeURIComponent(LOCATION.mapsQuery)}&ll=${COORDS}&z=17&hl=fr&output=embed`,
} as const;

/**
 * Horaires d'ouverture — relevés sur les écrans Contact de la maquette.
 * Modélisés en données pour piloter à la fois l'affichage, le badge
 * « Ouvert maintenant » et le JSON-LD `openingHoursSpecification`.
 */
export const OPENING_HOURS: readonly OpeningDay[] = [
  {
    label: 'Lundi — Jeudi',
    display: '09h — 21h',
    weekdays: [1, 2, 3, 4],
    ranges: [{ opensAt: '09:00', closesAt: '21:00' }],
  },
  {
    label: 'Vendredi',
    display: '09h — 13h · 14h — 21h',
    weekdays: [5],
    ranges: [
      { opensAt: '09:00', closesAt: '13:00' },
      { opensAt: '14:00', closesAt: '21:00' },
    ],
  },
  {
    label: 'Samedi',
    display: '09h — 21h',
    weekdays: [6],
    ranges: [{ opensAt: '09:00', closesAt: '21:00' }],
  },
  {
    label: 'Dimanche',
    display: 'Sur rendez-vous',
    weekdays: [0],
    ranges: [],
    byAppointmentOnly: true,
  },
] as const;

export const OPENING_SUMMARY = 'Lun — Sam · 09h — 21h';

export const SOCIAL = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? '',
} as const;

/** Messages WhatsApp contextuels : le CTA sait d'où part le visiteur. */
export const WHATSAPP_INTENTS = {
  appointment: 'Bonjour, je souhaite prendre rendez-vous à la bijouterie THIAM 24 Carats.',
  question: 'Bonjour, j’ai une question sur vos bijoux.',
  bespoke: 'Bonjour, je souhaite faire réaliser une pièce sur mesure.',
  buyback: 'Bonjour, je souhaite faire estimer de l’or en vue d’un rachat.',
  fitting: 'Bonjour, je souhaite réserver un essayage pour un coffret de dot.',
  service: (service: string): string =>
    `Bonjour, je souhaite des informations sur votre service « ${service} ».`,
  piece: (piece: string): string => `Bonjour, la pièce « ${piece} » est-elle toujours disponible ?`,
} as const;
