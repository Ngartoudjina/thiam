/**
 * Types partagés du site THIAM 24 Carats.
 * Aucune donnée d'affichage n'est typée `any` : chaque contenu de la maquette
 * possède un contrat explicite, ce qui rend le CMS futur trivial à brancher.
 */

/**
 * Visuel résolu, quelle que soit sa provenance : fichier livré avec la maquette
 * ou objet téléversé dans Supabase Storage. C'est le seul format que les
 * composants d'affichage connaissent.
 */
export interface MediaAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  /** Chemin dans le compartiment de stockage, si l'image en provient. */
  readonly storagePath?: string;
  readonly id?: string;
}

export type Theme = 'dark' | 'light';

export interface NavigationLink {
  readonly label: string;
  readonly href: string;
  /** Vrai pour les ancres internes à la page d'accueil. */
  readonly isSectionAnchor?: boolean;
}

export interface FooterLinkGroup {
  readonly title: string;
  readonly links: readonly NavigationLink[];
}

export type CollectionSlug = 'diamant' | 'mariage' | 'or' | 'argent' | 'montres' | 'sur-mesure';

export interface Collection {
  /** Identifiant en base ; absent pour les collections de repli. */
  readonly id?: string;
  readonly slug: string;
  readonly index: string;
  readonly name: string;
  readonly tagline: string;
  readonly description?: string;
  readonly image: MediaAsset | null;
  /** Photos secondaires, affichées dans le tableau de bord et à venir en vitrine. */
  readonly images?: readonly MediaAsset[];
  /** Description de la photo attendue tant qu'aucune n'est fournie. */
  readonly placeholder?: string;
  /** Position de cadrage de la photo, quand la maquette la précise. */
  readonly objectPosition?: string;
}

export interface Piece {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  /** Version courte affichée sur la grille mobile. */
  readonly detailShort: string;
  readonly weight: string;
  readonly collection: string;
  readonly image: MediaAsset | null;
  readonly badge?: PieceBadge;
}

export interface PieceBadge {
  readonly label: string;
  readonly tone: 'gold' | 'dark';
}

export interface CollectionFilter {
  /** `tout` ou l'identifiant d'un univers publié dans le tableau de bord. */
  readonly slug: string;
  readonly label: string;
  readonly count?: number;
}

export interface CraftPillar {
  readonly index: string;
  readonly title: string;
  readonly description: string;
  /** Formulation courte retenue sur la maquette mobile. */
  readonly mobileTitle?: string;
  readonly mobileDescription?: string;
}

export type ServiceIcon =
  'repair' | 'polish' | 'engrave' | 'bespoke' | 'appraise' | 'buyback' | 'advice';

export interface Service {
  readonly id?: string;
  readonly icon: ServiceIcon;
  readonly title: string;
  readonly description: string;
  readonly price: string;
}

export interface Milestone {
  readonly year: string;
  readonly title: string;
  readonly description: string;
}

export interface Testimonial {
  readonly id?: string;
  readonly quote: string;
  readonly author: string;
  readonly context: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
}

export interface FaqEntry {
  readonly id?: string;
  readonly question: string;
  readonly answer: string;
}

export interface Stat {
  readonly value: number;
  readonly suffix?: string;
  readonly decimals?: number;
  readonly label: string;
  readonly mobileLabel: string;
  /** Valeur affichée telle quelle sur mobile, quand la maquette la raccourcit. */
  readonly mobileDisplay?: string;
}

export interface GalleryTile {
  readonly id?: string;
  readonly image: MediaAsset | null;
  readonly placeholder?: string;
  readonly caption?: string;
  /** Empreinte sur la grille bento desktop (colonnes × lignes). */
  readonly span: { readonly cols: 1 | 2; readonly rows: 2 | 3 };
  readonly objectPosition?: string;
}

export interface TrustSignal {
  readonly icon: 'hallmark' | 'certificate' | 'workshop';
  readonly label: string;
  readonly mobileLabel: string;
}

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OpeningRange {
  readonly opensAt: string;
  readonly closesAt: string;
}

export interface OpeningDay {
  readonly label: string;
  readonly display: string;
  readonly weekdays: readonly WeekdayIndex[];
  readonly ranges: readonly OpeningRange[];
  readonly byAppointmentOnly?: boolean;
}

export interface ProjectTopic {
  readonly value: string;
  readonly label: string;
}
