import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRightIcon } from '@/components/common/icons';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

interface ArrowLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly theme?: Theme;
  readonly className?: string;
  readonly external?: boolean;
  /** Rend un `span` : à utiliser lorsque le parent est déjà un lien. */
  readonly asText?: boolean;
}

/**
 * Lien souligné à flèche.
 * « Le lien gagne son soulignement de gauche à droite » : le filet est un
 * pseudo-élément mis à l'échelle, jamais une bordure qui saute.
 */
export function ArrowLink({
  href,
  children,
  theme = 'light',
  className,
  external = false,
  asText = false,
}: ArrowLinkProps) {
  const content = (
    <>
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-2 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-(--duration-state) ease-out',
            'group-hover/arrow:scale-x-0 group-hover/arrow:delay-0',
            theme === 'dark' ? 'bg-[rgb(232_191_163/0.45)]' : 'bg-[rgb(142_92_61/0.4)]',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-(--duration-state) ease-out',
            'group-hover/arrow:scale-x-100 group-hover/arrow:delay-150',
            theme === 'dark' ? 'bg-gold-pale' : 'bg-gold-ink',
          )}
        />
      </span>
      <ArrowRightIcon className="transition-transform duration-(--duration-state) ease-out group-hover/arrow:translate-x-1" />
    </>
  );

  const classes = cn(
    'group/arrow inline-flex items-center gap-3 pb-2 text-label-lg tracking-(--tracking-nav) uppercase',
    theme === 'dark' ? 'text-gold-pale' : 'text-gold-ink',
    className,
  );

  if (asText) {
    return <span className={classes}>{content}</span>;
  }

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
