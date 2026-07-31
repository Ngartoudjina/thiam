'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { MediaFrame } from '@/components/common/media-frame';
import { DURATION, EASE_EDITORIAL, STAGGER, maskUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { GalleryTile, MediaAsset } from '@/types';

const COL_SPAN: Record<1 | 2, string> = { 1: 'col-span-1', 2: 'col-span-2' };
const ROW_SPAN: Record<2 | 3, string> = { 2: 'row-span-2', 3: 'row-span-3' };

/** Transformation d'ouverture : delta de position et rapport d'échelle. */
interface FlipOrigin {
  readonly x: number;
  readonly y: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

const VIEWER_MAX_WIDTH = 896;
const VIEWER_HEIGHT_RATIO = 0.8;

/**
 * Calcule le cadre final de la visionneuse, puis le décalage à appliquer pour
 * partir exactement de la tuile cliquée.
 *
 * Le calcul est analytique : pas de mesure après montage, donc pas de double
 * rendu ni de saut d'une image. On anime `transform` uniquement, ce qui reste
 * sur le compositeur.
 */
function computeFlipOrigin(tileRect: DOMRect, asset: MediaAsset): FlipOrigin {
  const padding = window.innerWidth >= 1024 ? 64 : 24;
  const availableWidth = Math.min(window.innerWidth - padding * 2, VIEWER_MAX_WIDTH);
  const availableHeight = window.innerHeight * VIEWER_HEIGHT_RATIO;
  const aspectRatio = asset.width / asset.height;

  const finalWidth = Math.min(availableWidth, availableHeight * aspectRatio);
  const finalHeight = finalWidth / aspectRatio;
  const finalLeft = (window.innerWidth - finalWidth) / 2;
  const finalTop = (window.innerHeight - finalHeight) / 2;

  return {
    x: tileRect.left - finalLeft,
    y: tileRect.top - finalTop,
    scaleX: tileRect.width / finalWidth,
    scaleY: tileRect.height / finalHeight,
  };
}

interface GalleryGridProps {
  readonly tiles: readonly GalleryTile[];
  readonly mobileTiles: readonly GalleryTile[];
}

/**
 * Mosaïque de la vitrine.
 *
 * À l'arrivée : les tuiles se dévoilent en diagonale depuis le haut-gauche.
 * Au survol : zoom 1,05 et légende en verre dépoli qui monte de 10 px.
 * Au clic : ouverture plein écran depuis la position exacte de la tuile.
 */
export function GalleryGrid({ tiles, mobileTiles }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [flipOrigin, setFlipOrigin] = useState<FlipOrigin | null>(null);

  const openable = tiles.filter((tile) => tile.image !== null);

  const open = useCallback((index: number, element: HTMLElement, asset: MediaAsset) => {
    setFlipOrigin(computeFlipOrigin(element.getBoundingClientRect(), asset));
    setActiveIndex(index);
  }, []);

  const showNext = useCallback(
    (direction: 1 | -1) => {
      // Les photos suivantes arrivent en fondu : le FLIP ne vaut que pour
      // l'ouverture, depuis la tuile réellement cliquée.
      setFlipOrigin(null);
      setActiveIndex((current) =>
        current === null ? current : (current + direction + openable.length) % openable.length,
      );
    },
    [openable.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowRight') showNext(1);
      if (event.key === 'ArrowLeft') showNext(-1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, showNext]);

  const activeTile = activeIndex === null ? null : openable[activeIndex];
  const activeAsset = activeTile?.image ?? null;

  return (
    <>
      {/* Mobile : rail horizontal à accroche, comme sur l'écran mobile. */}
      <ul className="-mx-5 flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-5 lg:hidden">
        {mobileTiles.map((tile, index) => (
          <li key={`mobile-${index}`} className="h-[18.125rem] w-[14.375rem] shrink-0 snap-start">
            <MediaFrame
              asset={tile.image}
              placeholder={tile.placeholder}
              sizes="230px"
              objectPosition={tile.objectPosition}
              className="h-full w-full"
            />
          </li>
        ))}
      </ul>

      {/* Desktop : grille bento 4 colonnes, lignes de 176 px, flux dense. */}
      <m.ul
        variants={staggerContainer(STAGGER.tight)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="hidden lg:grid lg:grid-flow-dense lg:auto-rows-[11rem] lg:grid-cols-4 lg:gap-5"
      >
        {tiles.map((tile, index) => {
          const openIndex = tile.image ? openable.findIndex((item) => item === tile) : -1;
          const asset = tile.image;

          return (
            <m.li
              key={`tile-${index}`}
              variants={maskUp}
              className={cn(COL_SPAN[tile.span.cols], ROW_SPAN[tile.span.rows])}
            >
              {asset ? (
                <button
                  type="button"
                  onClick={(event) => open(openIndex, event.currentTarget, asset)}
                  aria-label={`Agrandir : ${asset.alt}`}
                  aria-haspopup="dialog"
                  className="group tile-drift relative block h-full w-full cursor-zoom-in overflow-hidden bg-ink-soft"
                >
                  <MediaFrame
                    asset={asset}
                    sizes="(min-width: 1440px) 700px, 50vw"
                    objectPosition={tile.objectPosition}
                    hoverZoom="firm"
                    className="absolute inset-0 h-full w-full"
                  />

                  {tile.caption ? (
                    <span className="pointer-events-none absolute bottom-6 left-6.5 translate-y-2.5 bg-[rgb(11_11_12/0.42)] px-3.5 py-2.5 opacity-0 backdrop-blur-[8px] transition-[opacity,transform] duration-(--duration-state) ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <span className="text-micro tracking-(--tracking-nav) text-ivory uppercase">
                        {tile.caption}
                      </span>
                    </span>
                  ) : null}
                </button>
              ) : (
                <MediaFrame
                  asset={null}
                  placeholder={tile.placeholder}
                  sizes="(min-width: 1440px) 700px, 50vw"
                  className="h-full w-full"
                />
              )}
            </m.li>
          );
        })}
      </m.ul>

      <Dialog.Root
        open={activeIndex !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setActiveIndex(null);
            setFlipOrigin(null);
          }
        }}
      >
        <AnimatePresence>
          {activeIndex !== null && activeAsset ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.page, ease: EASE_EDITORIAL }}
                  className="fixed inset-0 z-90 bg-obsidian/94 backdrop-blur-lg"
                />
              </Dialog.Overlay>

              <Dialog.Content
                aria-describedby={undefined}
                className="fixed inset-0 z-100 flex items-center justify-center p-6 lg:p-16"
              >
                <Dialog.Title className="sr-only">{activeAsset.alt}</Dialog.Title>

                <m.div
                  key={activeAsset.src}
                  initial={
                    flipOrigin
                      ? { ...flipOrigin, opacity: 0.85 }
                      : { opacity: 0, scaleX: 0.97, scaleY: 0.97 }
                  }
                  animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }}
                  exit={{ opacity: 0, scaleX: 0.98, scaleY: 0.98 }}
                  transition={{ duration: DURATION.page, ease: EASE_EDITORIAL }}
                  className="relative w-full max-w-4xl origin-top-left will-change-transform"
                >
                  <Image
                    src={activeAsset.src}
                    alt={activeAsset.alt}
                    width={activeAsset.width}
                    height={activeAsset.height}
                    sizes="(min-width: 1024px) 896px, 90vw"
                    className="max-h-[80vh] w-full object-contain"
                    priority
                  />
                </m.div>

                <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => showNext(-1)}
                    aria-label="Photo précédente"
                    className="flex size-11 items-center justify-center border border-[rgb(247_244_239/0.28)] text-ivory transition-colors duration-(--duration-state) ease-out hover:border-gold hover:text-gold-light"
                  >
                    <ChevronLeft size={18} strokeWidth={1.2} aria-hidden="true" />
                  </button>

                  <p className="text-caption tracking-(--tracking-label) text-on-dark-faint uppercase">
                    <span aria-live="polite">
                      {activeIndex + 1} / {openable.length}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={() => showNext(1)}
                    aria-label="Photo suivante"
                    className="flex size-11 items-center justify-center border border-[rgb(247_244_239/0.28)] text-ivory transition-colors duration-(--duration-state) ease-out hover:border-gold hover:text-gold-light"
                  >
                    <ChevronRight size={18} strokeWidth={1.2} aria-hidden="true" />
                  </button>
                </div>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Fermer la visionneuse"
                    className="absolute top-6 right-6 flex size-11 items-center justify-center border border-[rgb(247_244_239/0.28)] text-ivory transition-colors duration-(--duration-state) ease-out hover:border-gold hover:text-gold-light lg:top-10 lg:right-10"
                  >
                    <X size={18} strokeWidth={1.2} aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
