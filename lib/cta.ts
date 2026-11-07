import { CONTACT } from '@/constants/site';

/**
 * Destination d'un bouton saisie dans le tableau de bord.
 *
 * Deux mots-clés désignent les numéros des Coordonnées, résolus à l'affichage :
 * changer de numéro met donc à jour chaque bouton, sans repasser sur chacun.
 *
 *   whatsapp    → conversation WhatsApp avec la maison
 *   telephone   → appel direct
 *
 * Toute autre valeur (adresse web, page du site) est servie telle quelle.
 */

export const CTA_KEYWORDS = { whatsapp: 'whatsapp', phone: 'telephone' } as const;

/** Lien WhatsApp de la maquette, figé en base par les premiers imports. */
const LEGACY_WHATSAPP = CONTACT.whatsappHref;

export function resolveCtaHref(
  href: string,
  links: { readonly whatsappHref: string; readonly phoneHref: string },
): string {
  const value = href.trim();
  const keyword = value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  if (keyword === CTA_KEYWORDS.whatsapp || value === LEGACY_WHATSAPP) return links.whatsappHref;
  if (keyword === CTA_KEYWORDS.phone || keyword === 'tel') return links.phoneHref;

  return value;
}

/** Un lien qui quitte le site s'ouvre dans un nouvel onglet ; un appel, non. */
export const isExternalHref = (href: string): boolean => /^https?:\/\//i.test(href);
