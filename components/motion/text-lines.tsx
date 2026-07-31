import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TextLinesProps {
  /** Une entrée par ligne du titre, dans l'ordre d'apparition. */
  readonly lines: readonly ReactNode[];
  readonly className?: string;
  readonly lineClassName?: string;
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4';
  readonly delay?: number;
  readonly id?: string;
}

/**
 * Titre qui monte ligne par ligne — « 24 px, 80 ms d'écart ».
 *
 * Chaque ligne est masquée par son conteneur en `overflow:hidden`, ce qui
 * produit la montée nette voulue par la maquette plutôt qu'un simple fondu.
 *
 * Composant serveur : la cascade est portée par le CSS du groupe, l'entrée
 * déclenchée par l'observateur unique. Il était auparavant animé par Framer
 * Motion et ouvrait une frontière client à chaque titre de section.
 */
export function TextLines({
  lines,
  className,
  lineClassName,
  as: Heading = 'h2',
  id,
}: TextLinesProps) {
  return (
    <Heading id={id} className={cn(className)} data-reveal-group="">
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden pb-[0.08em]">
          <span data-reveal="line" className={cn('block', lineClassName)}>
            {line}
          </span>
        </span>
      ))}
    </Heading>
  );
}
