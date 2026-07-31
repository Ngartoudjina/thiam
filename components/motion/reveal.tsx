import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type RevealVariant = 'up' | 'up-sm' | 'fade' | 'left';

/** Balises autorisées : garde la sémantique sans ouvrir la porte à `any`. */
type RevealTag =
  | 'div'
  | 'section'
  | 'article'
  | 'ul'
  | 'ol'
  | 'li'
  | 'span'
  | 'p'
  | 'header'
  | 'figure'
  | 'blockquote';

/**
 * Révélation à l'entrée dans le cadre.
 *
 * Composants serveur : ils n'émettent que des attributs `data-reveal`, l'état
 * initial et l'animation vivant en CSS. Un observateur unique, monté une seule
 * fois dans la mise en page, pose `data-revealed` au premier passage.
 *
 * Auparavant chacun de ces composants était piloté par Framer Motion : le site
 * comptait une centaine de frontières client, autant de morceaux de charge RSC
 * sérialisés dans le HTML et autant d'hydratations. Le mouvement obtenu est
 * identique — « déclenché une fois, au premier passage, puis la page reste
 * calme » — pour une seule frontière au total.
 */
interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly variant?: RevealVariant;
  /** Retard en secondes, aligné sur l'ancienne interface. */
  readonly delay?: number;
  readonly as?: RevealTag;
  readonly amount?: number;
  readonly id?: string;
}

/**
 * Le retard est ramené à deux paliers plutôt qu'à une valeur libre : `attr()`
 * typé, seul moyen de transporter une durée arbitraire jusqu'au CSS, n'est pas
 * encore assez répandu pour être utilisé en production.
 */
const toDelay = (seconds: number | undefined): '1' | '2' | undefined => {
  if (!seconds || seconds <= 0) return undefined;
  return seconds <= 0.15 ? '1' : '2';
};

export function Reveal({
  children,
  className,
  variant = 'up',
  delay,
  as: Component = 'div',
  id,
}: RevealProps) {
  return (
    <Component
      id={id}
      className={cn(className)}
      data-reveal={variant}
      data-reveal-delay={toDelay(delay)}
    >
      {children}
    </Component>
  );
}

interface RevealGroupProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Décalage entre enfants, en secondes (80 ms par défaut). */
  readonly stagger?: number;
  readonly delayChildren?: number;
  readonly as?: RevealTag;
  readonly amount?: number;
  readonly id?: string;
}

/**
 * Conteneur qui cadence l'entrée de ses `RevealItem`.
 * Le décalage est appliqué par le CSS à partir du rang de chaque enfant.
 */
export function RevealGroup({
  children,
  className,
  stagger,
  delayChildren,
  as: Component = 'div',
  id,
}: RevealGroupProps) {
  return (
    <Component
      id={id}
      className={cn(className)}
      data-reveal-group=""
      data-reveal-delay={toDelay(delayChildren ?? stagger)}
    >
      {children}
    </Component>
  );
}

interface RevealItemProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly variant?: RevealVariant;
  readonly as?: RevealTag;
  /** Rang de la ligne : pilote l'indentation en escalier via CSS. */
  readonly step?: number;
}

export function RevealItem({
  children,
  className,
  variant = 'up',
  as: Component = 'div',
  step,
}: RevealItemProps) {
  return (
    <Component className={cn(className)} data-step={step} data-reveal={variant}>
      {children}
    </Component>
  );
}
