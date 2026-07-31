'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider';
import { ROUTES } from '@/constants/navigation';

/** Hauteur de la barre fixe : 60 px en mobile, 104 px à partir de `lg`. */
const headerOffset = (): number => (window.innerWidth >= 1024 ? 104 : 60);

/**
 * Navigation par ancres.
 *
 * Le défilement inertiel de Lenis pilote la position de la page : le saut natif
 * du navigateur vers `#ancre` est aussitôt écrasé par sa boucle d'animation, et
 * les entrées « Savoir-faire », « Services » et « Histoire » semblaient alors ne
 * mener nulle part. On intercepte donc les liens d'ancrage pour les confier à
 * Lenis, en décalant la cible de la hauteur de la barre fixe.
 */
export function HashScroll() {
  const pathname = usePathname();
  const smoothScroll = useSmoothScroll();

  // Ancre présente à l'arrivée sur la page (lien externe, rechargement).
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const timer = window.setTimeout(() => {
      const target = document.querySelector(hash);
      if (!target) return;

      if (smoothScroll) {
        smoothScroll.scrollTo(hash);
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 260);

    return () => window.clearTimeout(timer);
  }, [pathname, smoothScroll]);

  // Clics sur les liens d'ancrage, y compris ceux écrits « /#section ».
  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      const isBareHash = href.startsWith('#');
      const isHomeHash = href.startsWith(`${ROUTES.home}#`);
      if (!isBareHash && !isHomeHash) return;

      // Une ancre de la page d'accueil depuis une autre page reste une
      // navigation classique : Next change de route, l'effet ci-dessus prend le relais.
      if (isHomeHash && pathname !== ROUTES.home) return;

      const id = href.slice(href.indexOf('#'));
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      window.history.replaceState(null, '', id);

      if (smoothScroll) {
        smoothScroll.scrollTo(id);
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname, smoothScroll]);

  return null;
}
