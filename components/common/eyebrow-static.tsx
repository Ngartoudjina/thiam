import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

interface EyebrowStaticProps {
  readonly children: string;
  readonly theme?: Theme;
  readonly className?: string;
  /** Filet dégradé, utilisé dans le hero. */
  readonly fade?: boolean;
}

/**
 * Sur-titre du premier écran.
 *
 * Même rendu que `Eyebrow`, mais sans JavaScript : le hero doit être peint
 * avant l'hydratation. Le filet se trace en CSS, le reste du site continue
 * d'utiliser la version pilotée par Framer Motion, qui se déclenche à l'entrée
 * dans le cadre.
 */
export function EyebrowStatic({
  children,
  theme = 'light',
  className,
  fade = false,
}: EyebrowStaticProps) {
  return (
    <div className={cn('flex items-center gap-3.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'hero-draw h-px w-8 origin-left md:w-11',
          fade ? 'bg-[linear-gradient(90deg,var(--color-gold),rgba(192,138,98,0))]' : 'bg-gold',
        )}
      />
      <span
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
