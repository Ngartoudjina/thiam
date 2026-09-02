import type { MediaAsset } from '@/types';

/** Clés du registre des visuels livrés avec la maquette. */
export type MediaId =
  | 'heroParure'
  | 'bouclesPerle'
  | 'solitaireDiamant'
  | 'alliances'
  | 'parureOr'
  | 'bagueRubis'
  | 'presentationParures'
  | 'collierOrLong'
  | 'ecrinParure'
  | 'parureCristaux'
  | 'bagueOrRosePerle'
  | 'parureMontre'
  | 'bouclesFleurPerle'
  | 'creolesOrZircon'
  | 'rachatPieces'
  | 'rachatPesee'
  | 'rachatComptoir';

/**
 * Visuels livrés avec la maquette, servant de contenu de repli tant que la
 * maison n'a rien téléversé depuis le tableau de bord.
 *
 * Les dimensions sont celles des fichiers sources : elles permettent à
 * `next/image` de réserver l'espace et d'éviter tout décalage de mise en page.
 */
export const MEDIA: Readonly<Record<MediaId, MediaAsset>> = {
  heroParure: {
    src: '/images/hero-parure-or-diamants.jpg',
    width: 736,
    height: 1104,
    alt: 'Parure en or et diamants présentée sur fond sombre',
  },
  bouclesPerle: {
    src: '/images/boucles-or-perle.jpg',
    width: 736,
    height: 981,
    alt: "Boucles d'oreilles en or ornées d'une perle",
  },
  solitaireDiamant: {
    src: '/images/solitaire-diamant.jpg',
    width: 736,
    height: 981,
    alt: 'Bague solitaire sertie d’un diamant',
  },
  alliances: {
    src: '/images/alliances-or-diamant.jpg',
    width: 735,
    height: 802,
    alt: 'Duo d’alliances en or, l’une sertie de diamants',
  },
  parureOr: {
    src: '/images/parure-or.jpg',
    width: 735,
    height: 811,
    alt: 'Parure en or jaune disposée sur un présentoir',
  },
  bagueRubis: {
    src: '/images/bague-rubis-sur-mesure.jpg',
    width: 736,
    height: 736,
    alt: 'Bague sur mesure sertie d’une pierre précieuse',
  },
  presentationParures: {
    src: '/images/presentation-parures.jpg',
    width: 736,
    height: 1104,
    alt: 'Présentation de parures de cérémonie en boutique',
  },
  collierOrLong: {
    src: '/images/collier-or-long.jpg',
    width: 736,
    height: 736,
    alt: 'Collier long en or maille travaillée',
  },
  ecrinParure: {
    src: '/images/ecrin-parure-or.jpg',
    width: 736,
    height: 1104,
    alt: 'Écrin ouvert présentant une parure en or',
  },
  parureCristaux: {
    src: '/images/parure-or-cristaux.jpg',
    width: 736,
    height: 736,
    alt: 'Parure en or rehaussée de cristaux',
  },
  bagueOrRosePerle: {
    src: '/images/bague-or-rose-perle.jpg',
    width: 570,
    height: 664,
    alt: 'Bague en or rose ciselée, sertie d’une perle',
  },
  parureMontre: {
    src: '/images/parure-montre-strass.jpg',
    width: 736,
    height: 981,
    alt: 'Montre à bracelet cuir accompagnée de son collier, ses boucles et sa bague',
  },
  bouclesFleurPerle: {
    src: '/images/boucles-fleur-perle.jpg',
    width: 736,
    height: 736,
    alt: 'Boucles d’oreilles fleur en zircon terminées par une perle',
  },
  creolesOrZircon: {
    src: '/images/creoles-or-zircon.jpg',
    width: 736,
    height: 980,
    alt: 'Créoles en or serties d’un zircon taille poire',
  },

  /* --- Rachat d'or : photographies fournies par la maison --------------- */
  rachatPieces: {
    src: '/images/rachat-or-pieces.jpg',
    width: 1024,
    height: 1280,
    alt: 'Bijoux en or repris par la maison, présentés dans une main gantée',
  },
  rachatPesee: {
    src: '/images/rachat-or-pesee.jpg',
    width: 1024,
    height: 1024,
    alt: 'Lingots et poudre d’or pesés sur une balance de précision',
  },
  rachatComptoir: {
    src: '/images/rachat-or-comptoir.jpg',
    width: 1200,
    height: 1200,
    alt: 'Or apporté au comptoir de la boutique pour estimation',
  },
} as const;

/** Symbole seul — médaillon « T ». Barre de navigation, favicon, tableau de bord. */
export const BRAND_MARK = {
  src: '/brand/thiam-mark.png',
  width: 1770,
  height: 1770,
  alt: 'Symbole de la Bijouterie THIAM 24 Carats',
} as const;

/** Logotype complet : symbole et nom. Vignette de partage, documents. */
export const BRAND_LOGO = {
  src: '/brand/thiam-logo.png',
  width: 1772,
  height: 1772,
  alt: 'Logo de la Bijouterie THIAM 24 Carats',
} as const;

/**
 * Le logo fourni est un bloc carré « symbole + nom ».
 * La maquette n'affiche que le symbole dans la barre de navigation : on
 * recadre par fenêtrage, exactement comme la planche de direction artistique.
 */
export const LOGO_MARK_CROP = {
  scale: 114 / 34,
  offsetXRatio: 40 / 34,
  offsetYRatio: 24 / 42,
  aspectRatio: 34 / 42,
} as const;
