import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

interface SectionProps {
  readonly children: ReactNode;
  readonly id?: string;
  readonly theme?: Theme;
  readonly className?: string;
  /** Désactive le rythme vertical standard quand la section gère le sien. */
  readonly flush?: boolean;
  readonly labelledBy?: string;
  readonly as?: 'section' | 'div' | 'footer';
}

const THEME_CLASSES: Record<Theme, string> = {
  dark: 'bg-obsidian text-ivory',
  light: 'bg-ivory text-ink',
};

/**
 * Section de page : porte l'alternance sombre / ivoire qui structure toute la
 * maquette, la gouttière et le rythme vertical. Aucune section ne réimplémente
 * ces trois réglages.
 */
export function Section({
  children,
  id,
  theme = 'light',
  className,
  flush = false,
  labelledBy,
  as: Component = 'section',
}: SectionProps) {
  return (
    <Component
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative isolate',
        THEME_CLASSES[theme],
        !flush && 'gutter section-y',
        className,
      )}
    >
      {children}
    </Component>
  );
}

/** Halo doré diffus, présent en fond de plusieurs sections sombres. */
export function GoldHalo({ className }: { readonly className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full',
        'bg-[radial-gradient(circle,rgba(192,138,98,0.14),rgba(192,138,98,0)_66%)]',
        className,
      )}
    />
  );
}
