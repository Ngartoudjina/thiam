import Image from 'next/image';
import Link from 'next/link';
import { BRAND_MARK } from '@/constants/media';
import { ROUTES } from '@/constants/navigation';
import { SITE } from '@/constants/site';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

type LockupSize = 'sm' | 'md';

/**
 * Le symbole de la maison est désormais fourni seul, détouré : il s'affiche
 * tel quel. La version précédente fenêtrait un logotype complet à coups de
 * marges négatives, faute d'avoir le signe isolé — ce bricolage n'a plus lieu
 * d'être.
 */
const MARK_SIZES = {
  sm: 'size-9',
  md: 'size-12',
} as const satisfies Record<LockupSize, string>;

const WORDMARK_SIZES = {
  sm: { name: 'text-base tracking-[0.28em]', suffix: 'text-[0.40625rem]' },
  md: { name: 'text-[1.3125rem] tracking-(--tracking-wordmark)', suffix: 'text-[0.5rem]' },
} as const satisfies Record<LockupSize, { name: string; suffix: string }>;

interface LogoMarkProps {
  readonly size?: LockupSize;
  readonly priority?: boolean;
  readonly className?: string;
}

export function LogoMark({ size = 'md', priority = false, className }: LogoMarkProps) {
  return (
    <Image
      src={BRAND_MARK.src}
      alt=""
      width={BRAND_MARK.width}
      height={BRAND_MARK.height}
      /* Le fichier source fait 1770 px de côté pour un affichage de 48 px :
         sans `sizes`, le navigateur téléchargerait une variante démesurée. */
      sizes="48px"
      priority={priority}
      aria-hidden="true"
      className={cn('shrink-0 object-contain', MARK_SIZES[size], className)}
    />
  );
}

interface BrandLockupProps {
  readonly theme?: Theme;
  readonly size?: LockupSize;
  readonly priority?: boolean;
  readonly asLink?: boolean;
  readonly className?: string;
}

/** Symbole + nom + mention « 24 CARATS ». Unique point de vérité du logotype. */
export function BrandLockup({
  theme = 'dark',
  size = 'md',
  priority = false,
  asLink = true,
  className,
}: BrandLockupProps) {
  const content = (
    <>
      <LogoMark size={size} priority={priority} />
      <span className="flex flex-col gap-1">
        <span
          className={cn(
            'font-serif leading-none',
            WORDMARK_SIZES[size].name,
            theme === 'dark' ? 'text-ivory' : 'text-ink',
          )}
        >
          {SITE.wordmark}
        </span>
        <span
          className={cn(
            'tracking-(--tracking-wordmark-sub) leading-none',
            WORDMARK_SIZES[size].suffix,
            theme === 'dark' ? 'text-gold' : 'text-gold-ink',
          )}
        >
          {SITE.wordmarkSuffix}
        </span>
      </span>
    </>
  );

  const classes = cn('flex items-center gap-3', className);

  if (!asLink) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link href={ROUTES.home} className={classes} aria-label={`${SITE.name} — retour à l'accueil`}>
      {content}
    </Link>
  );
}
