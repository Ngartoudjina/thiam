'use client';

import { useSiteContent } from '@/components/providers/site-content-provider';
import { useShopStatus } from '@/hooks/use-shop-status';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  readonly className?: string;
  readonly variant?: 'glass' | 'plain' | 'panel';
  /** Ajoute l'heure de fermeture au libellé, comme sur la page Contact. */
  readonly withClosingTime?: boolean;
}

const VARIANTS = {
  glass: 'glass-dark border border-[rgb(247_244_239/0.16)] px-5 py-3.5 text-ivory',
  plain: 'text-on-dark-soft',
  panel: 'px-[18px] py-3.5',
} as const;

/** Le panneau prend la teinte de l'état : vert ouvert, or fermé. */
const PANEL_TONE = {
  open: 'border border-[rgb(47_125_79/0.28)] bg-[rgb(47_125_79/0.08)] text-open-soft',
  closed: 'border border-[rgb(169_113_63/0.3)] bg-[rgb(169_113_63/0.08)] text-gold-ink',
} as const;

/**
 * Pastille « Ouvert · 09h — 21h ».
 * L'état est calculé à l'heure de Cotonou, pas à celle du visiteur : un client
 * à Paris voit bien si la boutique est ouverte là-bas.
 */
export function StatusBadge({
  className,
  variant = 'glass',
  withClosingTime = false,
}: StatusBadgeProps) {
  const status = useShopStatus();
  const { hours } = useSiteContent();

  const openLabel = `Ouvert · ${hours.summary.split('· ')[1] ?? '09h — 21h'}`;

  const label = status
    ? status.isOpen
      ? withClosingTime
        ? status.label
        : openLabel
      : status.label
    : openLabel;

  const isClosed = status?.isOpen === false;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        VARIANTS[variant],
        variant === 'panel' && PANEL_TONE[isClosed ? 'closed' : 'open'],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 shrink-0 rounded-full shadow-(--shadow-dot)',
          isClosed ? 'bg-gold-dim text-gold-dim' : 'bg-open text-open',
        )}
      />
      <span className="text-label tracking-(--tracking-label) uppercase">{label}</span>
    </div>
  );
}
