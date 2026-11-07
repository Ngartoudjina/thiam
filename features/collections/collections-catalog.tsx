'use client';

import { m } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { PieceCard } from '@/features/collections/piece-card';
import { parseWeight } from '@/lib/format';
import type { CollectionFilter, Piece } from '@/types';
import { STAGGER, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';

type SortKey = 'nouveautes' | 'poids-croissant' | 'poids-decroissant';

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: 'nouveautes', label: 'Nouveautés' },
  { value: 'poids-croissant', label: 'Poids croissant' },
  { value: 'poids-decroissant', label: 'Poids décroissant' },
];

/** Les pièces sans poids se rangent en fin de liste, quel que soit le sens du tri. */
const weightOf = (piece: Piece): number | null => piece.weightGrams ?? parseWeight(piece.weight);

const byWeight =
  (direction: 1 | -1) =>
  (a: Piece, b: Piece): number => {
    const left = weightOf(a);
    const right = weightOf(b);
    if (left === null) return right === null ? 0 : 1;
    if (right === null) return -1;
    return (left - right) * direction;
  };

const isKnownFilter = (
  value: string | null,
  filters: readonly CollectionFilter[],
): value is CollectionFilter['slug'] => filters.some((filter) => filter.slug === value);

/**
 * Catalogue filtrable.
 *
 * L'univers actif vit dans l'URL (`?univers=`) : un lien de la page d'accueil
 * ou du pied de page ouvre directement la bonne sélection, et le filtre reste
 * partageable et indexable.
 */
export function CollectionsCatalog({
  filters,
  pieces: allPieces,
  totalInStore,
}: {
  readonly filters: readonly CollectionFilter[];
  readonly pieces: readonly Piece[];
  readonly totalInStore: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<SortKey>('nouveautes');

  const rawFilter = searchParams.get('univers');
  const activeFilter: CollectionFilter['slug'] = isKnownFilter(rawFilter, filters)
    ? rawFilter
    : 'tout';

  const selectFilter = useCallback(
    (slug: CollectionFilter['slug']) => {
      const params = new URLSearchParams(searchParams.toString());

      if (slug === 'tout') {
        params.delete('univers');
      } else {
        params.set('univers', slug);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const pieces = useMemo(() => {
    const filtered =
      activeFilter === 'tout'
        ? [...allPieces]
        : allPieces.filter((piece) => piece.collection === activeFilter);

    switch (sort) {
      case 'poids-croissant':
        return filtered.sort(byWeight(1));
      case 'poids-decroissant':
        return filtered.sort(byWeight(-1));
      default:
        return filtered;
    }
  }, [activeFilter, allPieces, sort]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 border-b border-[rgb(22_18_15/0.14)] pb-6.5 lg:mb-11 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div
          role="group"
          aria-label="Filtrer par univers"
          className="-mx-5 flex scrollbar-none gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0"
        >
          {filters.map((filter) => {
            const isActive = filter.slug === activeFilter;

            return (
              <button
                key={filter.slug}
                type="button"
                onClick={() => selectFilter(filter.slug)}
                aria-pressed={isActive}
                className={cn(
                  'shrink-0 px-4.5 py-3.5 text-label-lg tracking-[0.14em] whitespace-nowrap uppercase lg:px-5.5',
                  'transition-[background,border-color,color] duration-(--duration-state) ease-out',
                  isActive
                    ? 'bg-ink text-ivory'
                    : 'border border-rule-light-strong text-stone hover:border-gold-dim hover:text-gold-ink',
                )}
              >
                {filter.label}
                {filter.count ? ` · ${filter.count}` : ''}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <label
            htmlFor="tri-pieces"
            className="text-label-lg tracking-[0.14em] text-clay uppercase"
          >
            Trier
          </label>
          <select
            id="tri-pieces"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="cursor-pointer border-b border-[rgb(22_18_15/0.25)] bg-transparent pb-1 text-meta font-normal text-ink focus:outline-none focus-visible:border-gold-dim"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pieces.length > 0 ? (
        <m.ul
          key={`${activeFilter}-${sort}`}
          variants={staggerContainer(STAGGER.default)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-x-3.5 gap-y-6.5 lg:grid-cols-3 lg:gap-x-7.5 lg:gap-y-8"
        >
          {pieces.map((piece) => (
            <PieceCard key={piece.id} piece={piece} />
          ))}
        </m.ul>
      ) : (
        <p className="py-16 text-center text-body font-normal text-clay">
          Aucune pièce de cet univers n’est en vitrine en ce moment. Écrivez-nous : nous en recevons
          chaque semaine, et nous fabriquons sur mesure.
        </p>
      )}

      <p className="mt-10 text-center text-caption-lg font-normal text-clay lg:text-left">
        {pieces.length} pièce{pieces.length > 1 ? 's' : ''} affichée
        {pieces.length > 1 ? 's' : ''}
        {totalInStore > 0 ? ` sur ${totalInStore} disponibles en boutique.` : '.'}
      </p>
    </>
  );
}
