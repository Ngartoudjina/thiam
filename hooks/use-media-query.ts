'use client';

import { useEffect, useState } from 'react';

/**
 * Écoute un media query côté client.
 * Renvoie `false` au premier rendu serveur : aucun décalage d'hydratation,
 * la valeur réelle arrive au premier effet.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent): void => setMatches(event.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Aligné sur les points de rupture déclarés dans `styles/globals.css`. */
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 64rem)');
export const useIsTablet = (): boolean => useMediaQuery('(min-width: 48rem)');
export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');
