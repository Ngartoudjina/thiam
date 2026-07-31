import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Échelles maison déclarées dans `@theme` (styles/globals.css).
 *
 * tailwind-merge doit les connaître, sinon il range `text-section` (une taille)
 * et `text-ink` (une couleur) dans le même groupe et n'en garde qu'une : les
 * titres retombent alors à la taille par défaut.
 */
const FONT_SIZES = [
  'hero',
  'page',
  'contact',
  'section',
  'stat',
  'feature',
  'card',
  'form',
  'quote-lg',
  'row',
  'tile',
  'quote',
  'milestone',
  'question',
  'product',
  'lead',
  'body',
  'body-sm',
  'micro',
  'label',
  'label-lg',
  'caption',
  'caption-lg',
  'meta',
  'meta-lg',
  'input',
] as const;

const COLORS = [
  'obsidian',
  'ink',
  'ink-soft',
  'slate',
  'espresso',
  'cacao',
  'graphite',
  'umber',
  'taupe',
  'ivory',
  'porcelain',
  'sand',
  'gold',
  'gold-deep',
  'gold-dim',
  'gold-warm',
  'gold-light',
  'gold-pale',
  'gold-mist',
  'gold-ink',
  'stone',
  'clay',
  'fog',
  'open',
  'open-soft',
  'on-dark',
  'on-dark-muted',
  'on-dark-soft',
  'on-dark-faint',
  'rule-dark',
  'rule-dark-soft',
  'rule-dark-strong',
  'rule-light',
  'rule-light-soft',
  'rule-light-strong',
] as const;

const TRACKING = [
  'display',
  'display-tight',
  'label',
  'button',
  'nav',
  'badge',
  'wordmark',
  'address',
  'eyebrow',
  'wordmark-sub',
] as const;

const SHADOWS = ['card', 'card-hover', 'float', 'dot'] as const;

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...FONT_SIZES],
      color: [...COLORS],
      tracking: [...TRACKING],
      shadow: [...SHADOWS],
    },
  },
});

/**
 * Fusionne des classes Tailwind en résolvant les conflits.
 * Point d'entrée unique du styling conditionnel dans toute l'application.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
