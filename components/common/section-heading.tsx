import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/common/eyebrow';
import { TextLines } from '@/components/motion/text-lines';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

interface SectionHeadingProps {
  readonly eyebrow: string;
  /** Une entrée par ligne : le titre monte ligne par ligne. */
  readonly lines: readonly ReactNode[];
  readonly description?: string;
  readonly theme?: Theme;
  readonly as?: 'h1' | 'h2' | 'h3';
  readonly id?: string;
  readonly action?: ReactNode;
  readonly className?: string;
  readonly titleClassName?: string;
  readonly descriptionClassName?: string;
}

/**
 * En-tête de section : sur-titre, titre serif sur plusieurs lignes, et texte
 * d'accompagnement aligné en pied à droite. C'est la structure répétée
 * huit fois dans la maquette — elle n'est donc écrite qu'une fois.
 */
export function SectionHeading({
  eyebrow,
  lines,
  description,
  theme = 'light',
  as = 'h2',
  id,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  const hasAside = Boolean(description ?? action);

  return (
    <div
      className={cn(
        'flex flex-col gap-8',
        hasAside && 'lg:flex-row lg:items-end lg:justify-between lg:gap-20',
        className,
      )}
    >
      <div className="max-w-[46rem]">
        <Eyebrow theme={theme} className="mb-6 md:mb-7">
          {eyebrow}
        </Eyebrow>
        <TextLines
          as={as}
          id={id}
          lines={lines}
          className={cn(
            'text-section leading-[1.02] tracking-(--tracking-display)',
            theme === 'dark' ? 'text-ivory' : 'text-ink',
            titleClassName,
          )}
        />
      </div>

      {hasAside ? (
        <div className="lg:mb-3 lg:max-w-[21.25rem] lg:shrink-0">
          {description ? (
            <Reveal variant="up-sm" as="p" delay={0.12}>
              <span
                className={cn(
                  'block text-body leading-[1.75] font-light',
                  theme === 'dark' ? 'text-on-dark-faint' : 'text-clay',
                  descriptionClassName,
                )}
              >
                {description}
              </span>
            </Reveal>
          ) : null}
          {action ? (
            <Reveal variant="up-sm" delay={0.16}>
              {action}
            </Reveal>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
