import type { Transition, Variants } from 'framer-motion';

/**
 * Grammaire de mouvement du site, transcrite de la planche
 * « Direction du mouvement » de la maquette :
 *
 *   « Aucune animation ne se répète en boucle. Tout est déclenché une fois,
 *     au premier passage, puis la page reste calme. »
 *
 * Règles : décalage ≤ 80 ms entre éléments d'une même série, amplitude de
 * déplacement comprise entre 16 et 24 px, jamais de rebond ni d'élastique.
 */

/** Départ franc, arrivée qui s'éteint. */
export const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT = [0, 0, 0.2, 1] as const;

export const DURATION = {
  reveal: 0.7,
  state: 0.24,
  zoom: 1.1,
  page: 0.48,
  counter: 0.9,
} as const;

export const STAGGER = {
  /** Décalage standard d'une série (cartes, lignes de tableau…). */
  default: 0.08,
  /** Séries denses : lignes de services, étoiles, entrées de menu. */
  tight: 0.06,
  /** Étoiles d'une notation. */
  stars: 0.05,
} as const;

/** Amplitudes autorisées par la spécification. */
export const SHIFT = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export const transitions = {
  reveal: { duration: DURATION.reveal, ease: EASE_EDITORIAL },
  state: { duration: DURATION.state, ease: EASE_OUT },
  zoom: { duration: DURATION.zoom, ease: EASE_EDITORIAL },
  page: { duration: DURATION.page, ease: EASE_EDITORIAL },
} as const satisfies Record<string, Transition>;

/** Seuil d'entrée dans le cadre — déclenché une seule fois. */
export const VIEWPORT = { once: true, amount: 0.25 } as const;
export const VIEWPORT_EARLY = { once: true, amount: 0.1 } as const;

/** Fondu-montée : la brique de base de toutes les entrées de bloc. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: SHIFT.lg },
  visible: { opacity: 1, y: 0, transition: transitions.reveal },
};

export const fadeUpSm: Variants = {
  hidden: { opacity: 0, y: SHIFT.sm },
  visible: { opacity: 1, y: 0, transition: transitions.reveal },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.reveal },
};

/** « Chaque ligne glisse de 24 px depuis la gauche, en cascade. » */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -SHIFT.lg },
  visible: { opacity: 1, x: 0, transition: transitions.reveal },
};

/** « La photo se révèle par un masque vertical de bas en haut. » */
export const maskUp: Variants = {
  hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: DURATION.reveal * 1.4, ease: EASE_EDITORIAL },
  },
};

/** « Les images arrivent à 1,06 et reviennent à 1,00 » — objectif qui se stabilise. */
export const settleZoom: Variants = {
  hidden: { scale: 1.06 },
  visible: { scale: 1, transition: { duration: DURATION.counter, ease: EASE_EDITORIAL } },
};

/** « Le filet supérieur se trace en largeur avant l'arrivée du texte. » */
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: DURATION.reveal, ease: EASE_EDITORIAL } },
};

export const drawLineVertical: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: DURATION.reveal, ease: EASE_EDITORIAL } },
};

/** Conteneur cadençant ses enfants. */
export const staggerContainer = (
  stagger: number = STAGGER.default,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Titre qui monte ligne par ligne, chaque ligne masquée par son conteneur. */
export const lineRise: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: DURATION.reveal, ease: EASE_EDITORIAL } },
};
