import type { LucideIcon } from 'lucide-react';
import {
  Gem,
  HelpCircle,
  Home,
  Images,
  LayoutDashboard,
  MapPin,
  MessageSquareQuote,
  Wrench,
} from 'lucide-react';

export interface AdminNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
}

export interface AdminNavGroup {
  readonly title: string;
  readonly items: readonly AdminNavItem[];
}

export const ADMIN_ROUTES = {
  dashboard: '/admin',
  login: '/admin/connexion',
  collections: '/admin/collections',
  gallery: '/admin/galerie',
  services: '/admin/services',
  testimonials: '/admin/temoignages',
  faq: '/admin/questions',
  hero: '/admin/accueil',
  about: '/admin/histoire',
  contact: '/admin/coordonnees',
} as const;

export const ADMIN_NAV: readonly AdminNavGroup[] = [
  {
    title: 'Vue d’ensemble',
    items: [
      {
        label: 'Tableau de bord',
        href: ADMIN_ROUTES.dashboard,
        icon: LayoutDashboard,
        description: 'État du contenu publié',
      },
    ],
  },
  {
    title: 'Vitrine',
    items: [
      {
        label: 'Collections',
        href: ADMIN_ROUTES.collections,
        icon: Gem,
        description: 'Univers, photos et ordre d’affichage',
      },
      {
        label: 'Galerie',
        href: ADMIN_ROUTES.gallery,
        icon: Images,
        description: 'Mosaïque de la vitrine',
      },
      {
        label: 'Services',
        href: ADMIN_ROUTES.services,
        icon: Wrench,
        description: 'Prestations après-vente et tarifs',
      },
    ],
  },
  {
    title: 'Confiance',
    items: [
      {
        label: 'Témoignages',
        href: ADMIN_ROUTES.testimonials,
        icon: MessageSquareQuote,
        description: 'Avis clients affichés sur l’accueil',
      },
      {
        label: 'Questions',
        href: ADMIN_ROUTES.faq,
        icon: HelpCircle,
        description: 'Questions fréquentes',
      },
    ],
  },
  {
    title: 'Pages',
    items: [
      {
        label: 'Accueil',
        href: ADMIN_ROUTES.hero,
        icon: Home,
        description: 'Bandeau principal et chiffres clés',
      },
      {
        label: 'Histoire',
        href: ADMIN_ROUTES.about,
        icon: LayoutDashboard,
        description: 'Récit de la maison et chronologie',
      },
      {
        label: 'Coordonnées',
        href: ADMIN_ROUTES.contact,
        icon: MapPin,
        description: 'Téléphone, WhatsApp, adresse, horaires',
      },
    ],
  },
] as const;

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);
