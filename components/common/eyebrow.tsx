import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

interface EyebrowProps {
  readonly children: string;
  readonly theme?: Theme;
  readonly className?: string;
  /** Filet dégradé, utilisé dans le hero. */
  readonly fade?: boolean;
}

/**
 * Sur-titre : petit filet or suivi d'un libellé en capitales très espacées.
 * « Le filet supérieur se trace en largeur avant l'arrivée du texte. »
 *
 * Composant serveur : le tracé et le fondu sont décrits en CSS et déclenchés
 * par l'observateur unique du site. Auparavant piloté par Framer Motion, il
 * créait une frontière client dans chacune des douze sections.
 */
export function Eyebrow({ children, theme = 'light', className, fade = false }: EyebrowProps) {
  return (
    <div className={cn('flex items-center gap-3.5', className)}>
      <span
        aria-hidden="true"
        data-reveal="draw"
        className={cn(
          'h-px w-8 origin-left md:w-11',
          fade ? 'bg-[linear-gradient(90deg,var(--color-gold),rgba(192,138,98,0))]' : 'bg-gold',
        )}
      />
      <span
        data-reveal="fade"
        className={cn(
          'text-[0.59375rem] tracking-(--tracking-eyebrow) uppercase md:text-micro',
          theme === 'dark' ? 'text-gold-warm' : 'text-gold-ink',
        )}
      >
        {children}
      </span>
    </div>
  );
}
