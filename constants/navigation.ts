import type { FooterLinkGroup, NavigationLink } from '@/types';

export const ROUTES = {
  home: '/',
  collections: '/collections',
  contact: '/contact',
  legal: '/mentions-legales',
  privacy: '/confidentialite',
} as const;

/** Ancres des sections de la page d'accueil. */
export const SECTIONS = {
  collections: 'collections',
  craft: 'savoir-faire',
  gallery: 'galerie',
  story: 'histoire',
  services: 'services',
  testimonials: 'temoignages',
  faq: 'questions',
  visit: 'nous-trouver',
} as const;

export const PRIMARY_NAV: readonly NavigationLink[] = [
  { label: 'Collections', href: ROUTES.collections },
  { label: 'Savoir-faire', href: `/#${SECTIONS.craft}`, isSectionAnchor: true },
  { label: 'Services', href: `/#${SECTIONS.services}`, isSectionAnchor: true },
  { label: 'Histoire', href: `/#${SECTIONS.story}`, isSectionAnchor: true },
  { label: 'Contact', href: ROUTES.contact },
] as const;

export const FOOTER_NAV: readonly FooterLinkGroup[] = [
  {
    title: 'Collections',
    links: [
      { label: 'Diamant', href: `${ROUTES.collections}?univers=diamant` },
      { label: 'Mariage & alliances', href: `${ROUTES.collections}?univers=mariage` },
      { label: 'Or 18 / 21 / 24K', href: `${ROUTES.collections}?univers=or` },
      { label: 'Argent', href: `${ROUTES.collections}?univers=argent` },
      { label: 'Montres', href: `${ROUTES.collections}?univers=montres` },
      { label: 'Sur mesure', href: `${ROUTES.collections}?univers=sur-mesure` },
    ],
  },
  {
    title: 'Maison',
    links: [
      { label: 'Notre histoire', href: `/#${SECTIONS.story}`, isSectionAnchor: true },
      { label: 'Savoir-faire', href: `/#${SECTIONS.craft}`, isSectionAnchor: true },
      { label: 'Services & tarifs', href: `/#${SECTIONS.services}`, isSectionAnchor: true },
      { label: 'Garanties', href: `/#${SECTIONS.craft}`, isSectionAnchor: true },
      { label: 'Questions fréquentes', href: `/#${SECTIONS.faq}`, isSectionAnchor: true },
    ],
  },
] as const;

export const LEGAL_NAV: readonly NavigationLink[] = [
  { label: 'Mentions légales', href: ROUTES.legal },
  { label: 'Confidentialité', href: ROUTES.privacy },
] as const;
