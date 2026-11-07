/**
 * Étiquettes de cache du contenu éditorial.
 *
 * Chaque lecture publique est mémorisée sous une étiquette ; les actions du
 * tableau de bord invalident l'étiquette correspondante. C'est ce qui rend une
 * modification visible immédiatement sur le site, sans redéploiement.
 */
export const CACHE_TAGS = {
  collections: 'contenu:collections',
  pieces: 'contenu:pieces',
  gallery: 'contenu:galerie',
  services: 'contenu:services',
  testimonials: 'contenu:temoignages',
  faq: 'contenu:faq',
  settings: 'contenu:reglages',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Durée de vie maximale d'une entrée.
 *
 * La fraîcheur est assurée par l'invalidation par étiquette, déclenchée à
 * chaque écriture du tableau de bord. Ce délai ne couvre que les écritures
 * faites hors de l'application (import en ligne de commande, console Neon) :
 * elles apparaissent au plus tard dans l'heure — ou aussitôt avec le bouton
 * « Actualiser le site » du tableau de bord. Une lecture par heure au plus
 * laisse la base en veille l'essentiel du temps.
 */
export const CONTENT_REVALIDATE_SECONDS = 3600;
