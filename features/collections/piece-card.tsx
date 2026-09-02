'use client';

import { m } from 'framer-motion';
import { MediaFrame } from '@/components/common/media-frame';
import { CONTACT, WHATSAPP_INTENTS } from '@/constants/site';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Piece } from '@/types';

const BADGE_TONE = {
  gold: 'bg-gold-light text-cacao',
  dark: 'bg-[rgb(11_11_12/0.6)] text-ivory backdrop-blur-[6px]',
} as const;

/**
 * Pièce en vitrine.
 *
 * Aucun prix n'est affiché : le modèle de la maison est « poids réel × cours
 * du jour ». La carte mène donc à une conversation WhatsApp pré-remplie au nom
 * de la pièce, ce qui est exactement le parcours voulu par la maquette.
 */
export function PieceCard({ piece }: { readonly piece: Piece }) {
  return (
    <m.li variants={fadeUp}>
      <a
        href={CONTACT.whatsappWithMessage(WHATSAPP_INTENTS.piece(piece.name))}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative mb-3.5 h-[13.5rem] overflow-hidden bg-ink-soft sm:h-[18rem] lg:mb-5.5 lg:h-[28.75rem]">
          <MediaFrame
            asset={piece.image}
            sizes="(min-width: 1024px) 30vw, 50vw"
            hoverZoom="firm"
            className="h-full w-full"
          />

          {piece.badge ? (
            <span
              className={cn(
                'absolute top-3 left-3 px-3 py-1.5 text-[0.5625rem] tracking-(--tracking-badge) uppercase lg:top-4.5 lg:left-4.5 lg:px-3.5 lg:py-2 lg:text-[0.625rem]',
                BADGE_TONE[piece.badge.tone],
              )}
            >
              {piece.badge.label}
            </span>
          ) : null}
        </div>

        {/* Mobile : nom, matière et poids empilés. */}
        <div className="lg:hidden">
          <h3 className="mb-1.5 font-serif text-[1.3125rem] font-normal text-ink">{piece.name}</h3>
          <p className="mb-2 text-caption font-normal text-clay">{piece.detailShort}</p>
          <p className="text-label tracking-[0.1em] text-gold-ink uppercase">
            {piece.weight} · cours du jour
          </p>
        </div>

        {/* Desktop : nom à gauche, poids et mention du cours à droite. */}
        <div className="hidden items-start justify-between gap-5 lg:flex">
          <div>
            <h3 className="mb-1.5 font-serif text-product font-normal text-ink transition-colors duration-(--duration-state) ease-out group-hover:text-gold-ink">
              {piece.name}
            </h3>
            <p className="text-meta-lg font-normal text-clay">{piece.detail}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-meta tracking-[0.06em] text-ink">{piece.weight}</p>
            <p className="mt-1.5 text-label-lg tracking-[0.12em] text-gold-ink uppercase">
              Cours du jour
            </p>
          </div>
        </div>
      </a>
    </m.li>
  );
}
