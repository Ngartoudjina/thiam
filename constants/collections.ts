import { MEDIA } from '@/constants/media';
import type { Collection, CollectionFilter, Piece } from '@/types';

/**
 * Contenu de repli.
 *
 * Ces valeurs alimentent le site tant que Supabase n'est pas configuré ou que
 * la table correspondante est vide. Elles servent aussi de source au script
 * d'amorçage (`npm run db:seed`) : le tableau de bord démarre donc avec le
 * contenu exact de la maquette.
 */

/** Les six univers de la section « Six univers, une même exigence ». */
export const COLLECTIONS: readonly Collection[] = [
  {
    slug: 'mariage',
    index: '01',
    name: 'Mariage',
    tagline: 'Gravure offerte',
    description:
      'Alliances, parures de dot et coffrets de cérémonie. Essayage sur rendez-vous, en privé.',
    image: MEDIA.alliances,
  },
  {
    slug: 'diamant',
    index: '02',
    name: 'Diamant',
    tagline: '42 pièces en vitrine',
    description:
      'Solitaires, pavages et pierres certifiées. Chaque diamant est présenté avec son poids, sa pureté et son origine.',
    image: MEDIA.solitaireDiamant,
    objectPosition: 'object-[50%_42%]',
  },
  {
    slug: 'or',
    index: '03',
    name: 'Or',
    tagline: '18K · 21K · 24K',
    image: MEDIA.parureOr,
  },
  {
    slug: 'argent',
    index: '04',
    name: 'Argent',
    tagline: '925 rhodié',
    image: null,
    placeholder: 'Photo bijoux argent',
  },
  {
    slug: 'montres',
    index: '05',
    name: 'Montres',
    tagline: 'Garantie 24 mois',
    image: MEDIA.parureMontre,
  },
  {
    slug: 'sur-mesure',
    index: '06',
    name: 'Sur mesure',
    tagline: 'Dessin en 48 h',
    image: MEDIA.bagueRubis,
  },
] as const;

export const TOTAL_PIECES = 297;

export const COLLECTION_FILTERS: readonly CollectionFilter[] = [
  { slug: 'tout', label: 'Tout', count: TOTAL_PIECES },
  { slug: 'diamant', label: 'Diamant' },
  { slug: 'mariage', label: 'Mariage' },
  { slug: 'or', label: 'Or' },
  { slug: 'argent', label: 'Argent' },
  { slug: 'montres', label: 'Montres' },
  { slug: 'sur-mesure', label: 'Sur mesure' },
] as const;

/** Pièces disponibles en vitrine — écran « Collections » de la maquette. */
export const PIECES: readonly Piece[] = [
  {
    id: 'solitaire-aube',
    name: 'Solitaire Aube',
    detail: 'Or rose 18K · diamant 0,32 ct',
    detailShort: 'Or rose 18K · 0,32 ct',
    weight: '3,2 g',
    collection: 'diamant',
    image: MEDIA.solitaireDiamant,
    badge: { label: 'Nouveau', tone: 'gold' },
  },
  {
    id: 'alliances-serment',
    name: 'Alliances Serment',
    detail: 'Or jaune 18K · duo diamanté',
    detailShort: 'Or 18K · duo diamanté',
    weight: '8,4 g',
    collection: 'mariage',
    image: MEDIA.alliances,
    badge: { label: 'Gravure offerte', tone: 'dark' },
  },
  {
    id: 'parure-heritage',
    name: 'Parure Héritage',
    detail: 'Or 21K · collier 4 rangs + boucles',
    detailShort: 'Or 21K · 4 rangs',
    weight: '62 g',
    collection: 'or',
    image: MEDIA.collierOrLong,
  },
  {
    id: 'bague-braise',
    name: 'Bague Braise',
    detail: 'Or 18K · rubis ovale',
    detailShort: 'Or 18K · rubis',
    weight: '4,1 g',
    collection: 'sur-mesure',
    image: MEDIA.bagueRubis,
  },
  {
    id: 'perles-ivoire',
    name: "Perles d'Ivoire",
    detail: 'Or 18K · perles baroques',
    detailShort: 'Or 18K · perles',
    weight: '5,6 g',
    collection: 'or',
    image: MEDIA.bouclesPerle,
  },
  {
    id: 'parure-ceremonie',
    name: 'Parure Cérémonie',
    detail: 'Or 21K · collier, bracelet, boucles',
    detailShort: 'Or 21K · 3 pièces',
    weight: '48 g',
    collection: 'mariage',
    image: MEDIA.parureCristaux,
    badge: { label: 'Dernière pièce', tone: 'dark' },
  },
] as const;

export const DOWRY_BENEFITS: readonly string[] = [
  'Gravure des prénoms et de la date, offerte',
  'Mise à taille gratuite pendant 12 mois',
  'Règlement en deux ou trois fois',
] as const;
