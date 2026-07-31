'use client';

import { useEffect, useState } from 'react';

interface ScrollState {
  /** Vrai dès que la page a quitté le haut : déclenche le flou de la navbar. */
  readonly isScrolled: boolean;
  /** Vrai au-delà du seuil : fait apparaître la barre d'action mobile. */
  readonly isPastThreshold: boolean;
}

interface UseScrollStateOptions {
  readonly scrolledAfter?: number;
  /** Fraction de la hauteur totale de page (0 → 1). */
  readonly thresholdRatio?: number;
}

/**
 * Observe la position de défilement sans jamais provoquer de reflow :
 * lecture dans un `requestAnimationFrame`, écouteur passif.
 */
export function useScrollState({
  scrolledAfter = 24,
  thresholdRatio = 0.4,
}: UseScrollStateOptions = {}): ScrollState {
  const [state, setState] = useState<ScrollState>({
    isScrolled: false,
    isPastThreshold: false,
  });

  useEffect(() => {
    let frame = 0;

    const read = (): void => {
      const scrollY = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? scrollY / scrollable : 0;

      setState((previous) => {
        const next = {
          isScrolled: scrollY > scrolledAfter,
          isPastThreshold: ratio > thresholdRatio,
        };

        return previous.isScrolled === next.isScrolled &&
          previous.isPastThreshold === next.isPastThreshold
          ? previous
          : next;
      });
    };

    const onScroll = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [scrolledAfter, thresholdRatio]);

  return state;
}
