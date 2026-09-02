'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { ArrowLink } from '@/components/common/arrow-link';
import { MediaFrame } from '@/components/common/media-frame';
import { maskUp, settleZoom } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/navigation';
import type { Collection } from '@/types';

type CardFormat = 'feature' | 'card' | 'tile' | 'mobile' | 'mobileTile';

const FORMAT = {
  feature: {
    frame: 'h-[39.375rem]',
    inset: 'left-[2.875rem] right-[2.875rem] bottom-11',
    title: 'text-feature',
    zoom: 'soft',
    sizes: '(min-width: 1024px) 60vw, 100vw',
  },
  card: {
    frame: 'h-[39.375rem]',
    inset: 'left-8.5 right-8.5 bottom-11',
    title: 'text-card',
    zoom: 'soft',
    sizes: '(min-width: 1024px) 30vw, 100vw',
  },
  tile: {
    frame: 'h-[25rem]',
    inset: 'left-7 right-7 bottom-7.5',
    title: 'text-tile',
    zoom: 'firm',
    sizes: '(min-width: 1024px) 23vw, 50vw',
  },
  mobile: {
    frame: 'h-[21.25rem]',
    inset: 'left-5.5 right-5.5 bottom-5.5',
    title: 'text-[2.25rem]',
    zoom: 'firm',
    sizes: '100vw',
  },
  mobileTile: {
    frame: 'h-[12.5rem]',
    inset: 'left-4 right-4 bottom-4',
    title: 'text-[1.625rem]',
    zoom: 'firm',
    sizes: '50vw',
  },
} as const satisfies Record<CardFormat, Record<string, string>>;

interface CollectionCardProps {
  readonly collection: Collection;
  readonly format: CardFormat;
  readonly showDescription?: boolean;
  readonly linkLabel?: string;
  readonly className?: string;
}

/**
 * Carte d'univers.
 *
 * « Chaque carte se dévoile par un masque montant. Les images arrivent à 1,06
 * et reviennent à 1,00 — l'effet d'un objectif qui se stabilise. »
 * Le zoom de survol vit sur l'image, la stabilisation sur son conteneur : les
 * deux transformations ne se marchent jamais dessus.
 */
export function CollectionCard({
  collection,
  format,
  showDescription = false,
  linkLabel,
  className,
}: CollectionCardProps) {
  const config = FORMAT[format];
  const isCompact = format === 'tile' || format === 'mobileTile';

  return (
    <m.div variants={maskUp} className={cn('relative', className)}>
      <Link
        href={`${ROUTES.collections}?univers=${collection.slug}`}
        className={cn(
          'group relative block overflow-hidden bg-ink-soft',
          config.frame,
          className?.includes('h-full') && 'h-full',
        )}
      >
        <m.div variants={settleZoom} className="absolute inset-0">
          <MediaFrame
            asset={collection.image}
            placeholder={collection.placeholder}
            sizes={config.sizes}
            objectPosition={collection.objectPosition}
            hoverZoom={config.zoom === 'soft' ? 'soft' : 'firm'}
            className="h-full w-full"
          />
        </m.div>

        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-(--duration-state) ease-out',
            isCompact
              ? 'bg-[linear-gradient(0deg,rgba(11,11,12,0.8),rgba(11,11,12,0)_62%)]'
              : 'bg-[linear-gradient(0deg,rgba(11,11,12,0.83)_0%,rgba(11,11,12,0.19)_43%,rgba(11,11,12,0)_71%)]',
            'group-hover:opacity-[1.12]',
          )}
        />

        <div className={cn('pointer-events-none absolute', config.inset)}>
          {isCompact ? (
            <>
              <span className="font-serif text-meta tracking-(--tracking-wordmark) text-gold">
                {collection.index}
              </span>
              <h3
                className={cn(
                  'mt-2 mb-2 font-serif leading-none font-light text-ivory',
                  config.title,
                )}
              >
                {collection.name}
              </h3>
              <span className="text-micro tracking-(--tracking-badge) text-on-dark-faint uppercase">
                {collection.tagline}
              </span>
            </>
          ) : (
            <>
              <div className="mb-3.5 flex items-baseline gap-4">
                <span className="font-serif text-[0.875rem] tracking-(--tracking-wordmark) text-gold">
                  {collection.index}
                </span>
                <span className="text-micro tracking-(--tracking-badge) text-on-dark-soft uppercase">
                  {collection.tagline}
                </span>
              </div>

              <h3
                className={cn('mb-3.5 font-serif leading-none font-light text-ivory', config.title)}
              >
                {collection.name}
              </h3>

              {showDescription && collection.description ? (
                <p className="mb-6 max-w-[26.25rem] text-body-sm leading-[1.65] font-normal text-on-dark-muted">
                  {collection.description}
                </p>
              ) : null}

              {linkLabel ? (
                <ArrowLink href="#" theme="dark" asText>
                  {linkLabel}
                </ArrowLink>
              ) : null}
            </>
          )}
        </div>
      </Link>
    </m.div>
  );
}
