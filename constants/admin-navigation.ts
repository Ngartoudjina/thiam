import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Gem,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Images,
  Inbox,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquareQuote,
  Tag,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';

export interface AdminNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
  /** Réservé au rôle administrateur. */
  readonly adminOnly?: boolean;
  /** Affiche le nombre de demandes en attente. */
  readonly showsPendingRequests?: boolean;
}

export interface AdminNavGroup {
  readonly title: string;
  readonly items: readonly AdminNavItem[];
}

export const ADMIN_ROUTES = {
  dashboard: '/admin',
  login: '/admin/connexion',
  requests: '/admin/demandes',
  subscribers: '/admin/abonnes',
  collections: '/admin/collections',
  pieces: '/admin/pieces',
  gallery: '/admin/galerie',
  visuals: '/admin/visuels',
  services: '/admin/services',
  testimonials: '/admin/temoignages',
  faq: '/admin/questions',
  hero: '/admin/accueil',
  about: '/admin/histoire',
  contact: '/admin/coordonnees',
  accounts: '/admin/comptes',
  account: '/admin/mon-compte',
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
      {
        label: 'Demandes',
        href: ADMIN_ROUTES.requests,
        icon: Inbox,
        description: 'Messages reçus par le formulaire de contact',
        showsPendingRequests: true,
      },
      {
        label: 'Abonnés',
        href: ADMIN_ROUTES.subscribers,
        icon: Mail,
        description: 'Inscrits à la lettre de la maison',
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
        label: 'Pièces',
        href: ADMIN_ROUTES.pieces,
        icon: Tag,
        description: 'Bijoux en vitrine sur la page Collections',
      },
      {
        label: 'Galerie',
        href: ADMIN_ROUTES.gallery,
        icon: Images,
        description: 'Mosaïque de la vitrine',
      },
      {
        label: 'Visuels',
        href: ADMIN_ROUTES.visuals,
        icon: ImageIcon,
        description: 'Hero, bandeaux et portraits',
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
        icon: BookOpen,
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
  {
    title: 'Réglages',
    items: [
      {
        label: 'Comptes',
        href: ADMIN_ROUTES.accounts,
        icon: Users,
        description: 'Personnes autorisées à modifier le site',
        adminOnly: true,
      },
      {
        label: 'Mon compte',
        href: ADMIN_ROUTES.account,
        icon: UserCog,
        description: 'Nom, mot de passe et sessions',
      },
    ],
  },
] as const;

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);
