/**
 * Étiquettes de cache du contenu éditorial.
 *
 * Chaque lecture publique est mémorisée sous une étiquette ; les actions du
 * tableau de bord invalident l'étiquette correspondante. C'est ce qui rend une
 * modification visible immédiatement sur le site, sans redéploiement.
 */
export const CACHE_TAGS = {
  collections: 'contenu:collections',
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
 * Ce n'est qu'un filet de sécurité : la fraîcheur est assurée par
 * l'invalidation par étiquette, déclenchée à chaque écriture du tableau de
 * bord. Une heure évite de réinterroger Supabase pour rien sur un contenu qui
 * change quelques fois par mois.
 */
export const CONTENT_REVALIDATE_SECONDS = 3600;
