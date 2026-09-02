import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Crumb {
  readonly name: string;
  readonly path: string;
}

interface BreadcrumbProps {
  /** Du plus général au plus précis ; le dernier est la page courante. */
  readonly trail: readonly Crumb[];
  readonly className?: string;
}

/**
 * Fil d'Ariane.
 *
 * Il sert deux fois : au visiteur qui remonte d'un niveau, et à Google qui
 * l'affiche à la place de l'URL dans ses résultats. Le même tableau alimente
 * ce rendu et le balisage `BreadcrumbList` — les deux ne peuvent donc pas
 * diverger.
 */
export function Breadcrumb({ trail, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d’Ariane" className={cn('flex flex-wrap items-center gap-3', className)}>
      {trail.map((crumb, index) => {
        const isCurrent = index === trail.length - 1;

        return (
          <span key={crumb.path} className="flex items-center gap-3">
            {index > 0 ? (
              <span aria-hidden="true" className="text-fog">
                /
              </span>
            ) : null}

            {isCurrent ? (
              <span
                aria-current="page"
                className="text-label-lg tracking-(--tracking-nav) text-gold-ink uppercase"
              >
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="text-label-lg tracking-(--tracking-nav) text-clay uppercase transition-colors duration-(--duration-state) ease-out hover:text-gold-ink"
              >
                {crumb.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
