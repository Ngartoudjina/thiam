'use client';

import Lenis from 'lenis';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface SmoothScrollApi {
  /** Suspend le défilement — utilisé à l'ouverture du menu plein écran. */
  readonly stop: () => void;
  readonly start: () => void;
  readonly scrollTo: (target: string | number) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

/**
 * Défilement inertiel Lenis.
 *
 * Désactivé lorsque le visiteur a demandé un mouvement réduit : la page
 * retrouve alors le défilement natif, sans aucune interception.
 */
export function SmoothScrollProvider({ children }: { readonly children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [, setReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      // Même courbe que les entrées de bloc : départ franc, arrivée qui s'éteint.
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;
    setReady(true);

    let frame = 0;
    const raf = (time: number): void => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  const api = useMemo<SmoothScrollApi>(
    () => ({
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
      scrollTo: (target) => {
        // Décalage de la hauteur de la barre fixe, pour que le titre de section
        // se pose sous la navigation et non derrière elle.
        const offset = -(window.innerWidth >= 1024 ? 104 : 60) - 24;
        const lenis = lenisRef.current;

        if (lenis) {
          lenis.scrollTo(target, { offset, duration: 1.1 });
          return;
        }

        if (typeof target === 'string') {
          const element = document.querySelector(target);
          if (!element) return;
          const top = element.getBoundingClientRect().top + window.scrollY + offset;
          window.scrollTo({ top, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      },
    }),
    [],
  );

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll(): SmoothScrollApi | null {
  return useContext(SmoothScrollContext);
}
