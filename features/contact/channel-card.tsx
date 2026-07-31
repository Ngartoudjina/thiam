import type { ReactNode } from 'react';
import { ArrowRightIcon } from '@/components/common/icons';
import { cn } from '@/lib/utils';

type ChannelTone = 'gold' | 'outlineDark' | 'outlineLight';
type ChannelSize = 'compact' | 'full';

const TONE_CLASSES: Record<ChannelTone, string> = {
  gold: 'bg-gold-gradient hover:bg-gold-gradient-hover text-cacao',
  outlineDark:
    'border border-[rgb(247_244_239/0.22)] text-ivory hover:border-gold-pale hover:text-gold-pale',
  outlineLight:
    'border border-[rgb(22_18_15/0.16)] text-ink hover:border-gold-dim hover:bg-porcelain',
};

const SIZE_CLASSES: Record<ChannelSize, { shell: string; title: string; subtitle: string }> = {
  compact: {
    shell: 'px-6 py-6 lg:px-8 lg:py-6.5',
    title: 'text-caption font-medium tracking-(--tracking-button) uppercase',
    subtitle: 'text-meta font-light',
  },
  full: {
    shell: 'px-6 py-6 lg:px-8.5 lg:py-7.5',
    title: 'font-serif text-[1.375rem] font-normal leading-none lg:text-[1.8125rem]',
    subtitle: 'text-meta-lg font-light',
  },
};

interface ChannelCardProps {
  readonly href: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: ReactNode;
  readonly tone?: ChannelTone;
  readonly size?: ChannelSize;
  readonly external?: boolean;
  readonly className?: string;
}

/**
 * Grand appel à l'action de contact : WhatsApp, appel, itinéraire.
 * Une seule implémentation sert l'accueil (format compact) et la page
 * Contact (format large).
 */
export function ChannelCard({
  href,
  title,
  subtitle,
  icon,
  tone = 'gold',
  size = 'compact',
  external = false,
  className,
}: ChannelCardProps) {
  const sizes = SIZE_CLASSES[size];

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'group flex items-center justify-between gap-5 transition-[background,border-color,color] duration-(--duration-state) ease-out',
        TONE_CLASSES[tone],
        sizes.shell,
        className,
      )}
    >
      <span className="flex items-center gap-3.5 lg:gap-4.5">
        <span className="shrink-0">{icon}</span>
        <span className="flex flex-col gap-1.5">
          <span className={sizes.title}>{title}</span>
          <span className={cn(sizes.subtitle, tone === 'gold' ? 'opacity-72' : 'opacity-70')}>
            {subtitle}
          </span>
        </span>
      </span>

      <ArrowRightIcon
        size={size === 'full' ? 20 : 18}
        className="shrink-0 transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1.5"
      />
    </a>
  );
}
