import Image from 'next/image';
import Link from 'next/link';
import { BRAND_LOGO } from '@/constants/media';
import { ROUTES } from '@/constants/navigation';
import { SITE } from '@/constants/site';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

type LockupSize = 'sm' | 'md';

/**
 * Le fichier fourni par la maison est un bloc carré « symbole + nom ».
 * La maquette n'affiche que le symbole : on le fenêtre exactement aux mêmes
 * cotes (34 × 42 en desktop, 26 × 32 en mobile) plutôt que de recadrer le
 * fichier source, ce qui garde un seul asset à maintenir.
 */
const MARK_SIZES = {
  sm: { frame: 'h-8 w-[26px]', image: 'h-22 w-22 -translate-x-[31px] -translate-y-[18px]' },
  md: { frame: 'h-[42px] w-[34px]', image: 'h-[114px] w-[114px] -translate-x-10 -translate-y-6' },
} as const satisfies Record<LockupSize, { frame: string; image: string }>;

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
    <span
      className={cn('relative block shrink-0 overflow-hidden', MARK_SIZES[size].frame, className)}
    >
      {/*
        `sizes` est indispensable ici : le fichier source fait 500 px de côté,
        mais le symbole n'est affiché qu'à 114 px (88 px en mobile). Sans cette
        indication, `next/image` servait la variante 640 px — 57 ko pour un
        logotype de la taille d'un ongle, la ressource la plus lourde de la page.
      */}
      <Image
        src={BRAND_LOGO.src}
        alt=""
        width={BRAND_LOGO.width}
        height={BRAND_LOGO.height}
        sizes="114px"
        priority={priority}
        aria-hidden="true"
        className={cn('max-w-none object-contain', MARK_SIZES[size].image)}
      />
    </span>
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
            'leading-none tracking-(--tracking-wordmark-sub)',
            WORDMARK_SIZES[size].suffix,
            theme === 'dark' ? 'text-gold' : 'text-gold-dim',
          )}
        >
          {SITE.wordmarkSuffix}
        </span>
      </span>
    </>
  );

  const classes = cn('flex items-center gap-[13px]', className);

  if (!asLink) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link href={ROUTES.home} className={classes} aria-label={`${SITE.name} — retour à l'accueil`}>
      {content}
    </Link>
  );
}
