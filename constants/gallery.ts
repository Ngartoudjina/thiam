import { MEDIA } from '@/constants/media';
import type { GalleryTile } from '@/types';

export const GALLERY_PHOTO_COUNT = 84;

/**
 * Mosaïque « Entrer, un instant, dans la vitrine » — contenu de repli.
 *
 * L'empreinte `span` reproduit la grille bento de la maquette
 * (4 colonnes, lignes de 176 px, `grid-auto-flow: dense`).
 *
 * `placeholder` indique la photo que la maison doit fournir pour cet
 * emplacement ; en attendant, une pièce du catalogue tient la place afin que
 * la galerie ne présente aucun cadre vide. Depuis le tableau de bord, la
 * rubrique Galerie remplace intégralement ces valeurs.
 */
export const GALLERY_TILES: readonly GalleryTile[] = [
  {
    image: MEDIA.presentationParures,
    caption: 'Présentation cérémonie',
    span: { cols: 2, rows: 3 },
  },
  {
    image: MEDIA.collierOrLong,
    span: { cols: 1, rows: 2 },
  },
  {
    image: MEDIA.bouclesPerle,
    placeholder: 'Vitrine de la boutique',
    span: { cols: 1, rows: 2 },
  },
  {
    image: MEDIA.ecrinParure,
    caption: 'Écrin offert',
    objectPosition: 'object-[50%_55%]',
    span: { cols: 2, rows: 2 },
  },
  {
    image: MEDIA.parureCristaux,
    span: { cols: 1, rows: 2 },
  },
  {
    image: MEDIA.creolesOrZircon,
    placeholder: 'Geste d’atelier (mains, gravure)',
    span: { cols: 1, rows: 2 },
  },
  {
    image: MEDIA.alliances,
    placeholder: 'Façade / enseigne de la boutique',
    caption: 'Alliances gravées à la main',
    span: { cols: 2, rows: 2 },
  },
] as const;

/** Sous-ensemble défilant horizontalement sur mobile. */
export const MOBILE_GALLERY_TILES: readonly GalleryTile[] = [
  { image: MEDIA.presentationParures, span: { cols: 1, rows: 2 } },
  { image: MEDIA.ecrinParure, span: { cols: 1, rows: 2 } },
  { image: MEDIA.collierOrLong, span: { cols: 1, rows: 2 } },
  { image: MEDIA.parureOr, placeholder: 'Vitrine', span: { cols: 1, rows: 2 } },
  { image: MEDIA.parureCristaux, span: { cols: 1, rows: 2 } },
] as const;
