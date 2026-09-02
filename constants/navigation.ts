import type { FooterLinkGroup, NavigationLink } from '@/types';

export const ROUTES = {
  home: '/',
  collections: '/collections',
  /**
   * Deux pages dédiées aux activités à plus forte intention de recherche.
   * Une section d'accueil ne se positionne pas sur « rachat d'or Cotonou » :
   * il faut une adresse propre, un titre propre et un contenu qui ne répète
   * pas l'accueil — sans quoi Google n'en retient qu'une seule des deux.
   */
  buyback: '/rachat-or',
  wedding: '/alliances-mariage',
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
  buyback: 'rachat-or',
  testimonials: 'temoignages',
  faq: 'questions',
  visit: 'nous-trouver',
} as const;

export const PRIMARY_NAV: readonly NavigationLink[] = [
  { label: 'Vitrine', href: ROUTES.collections },
  { label: 'Services', href: `/#${SECTIONS.services}`, isSectionAnchor: true },
  { label: 'Savoir-faire', href: `/#${SECTIONS.craft}`, isSectionAnchor: true },
  { label: 'Histoire', href: `/#${SECTIONS.story}`, isSectionAnchor: true },
  { label: 'Contact', href: ROUTES.contact },
] as const;

export const FOOTER_NAV: readonly FooterLinkGroup[] = [
  {
    title: 'Vitrine',
    links: [
      { label: 'Diamant', href: `${ROUTES.collections}?univers=diamant` },
      { label: 'Mariage & alliances', href: `${ROUTES.collections}?univers=mariage` },
      { label: 'Or 14 / 18 / 21 / 24K', href: `${ROUTES.collections}?univers=or` },
      { label: 'Argent', href: `${ROUTES.collections}?univers=argent` },
      { label: 'Montres', href: `${ROUTES.collections}?univers=montres` },
      { label: 'Sur mesure', href: `${ROUTES.collections}?univers=sur-mesure` },
    ],
  },
  {
    title: 'Maison',
    links: [
      { label: 'Rachat d’or', href: ROUTES.buyback },
      { label: 'Alliances & mariage', href: ROUTES.wedding },
      { label: 'Notre histoire', href: `/#${SECTIONS.story}`, isSectionAnchor: true },
      { label: 'Savoir-faire', href: `/#${SECTIONS.craft}`, isSectionAnchor: true },
      { label: 'Services & tarifs', href: `/#${SECTIONS.services}`, isSectionAnchor: true },
      { label: 'Questions fréquentes', href: `/#${SECTIONS.faq}`, isSectionAnchor: true },
    ],
  },
] as const;

export const LEGAL_NAV: readonly NavigationLink[] = [
  { label: 'Mentions légales', href: ROUTES.legal },
  { label: 'Confidentialité', href: ROUTES.privacy },
] as const;
