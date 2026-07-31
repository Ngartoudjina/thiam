'use client';

import { useEffect } from 'react';

/**
 * Observateur unique des révélations.
 *
 * Une seule frontière client pour tout le site : il repère les blocs à révéler,
 * leur pose `data-revealed` au premier passage dans le cadre, puis cesse de les
 * observer. Conforme à la règle de la maquette — le mouvement ne se joue
 * qu'une fois, rien ne rejoue au retour.
 *
 * Deux précautions, apprises à l'usage :
 *
 * 1. On observe le *conteneur*, jamais l'élément animé. Une ligne de titre est
 *    translatée hors de son parent `overflow:hidden` : son rectangle visible
 *    est nul, et un observateur pointé sur elle ne se déclencherait jamais.
 *    Le conteneur révélé transmet l'état à toute sa descendance.
 *
 * 2. Un bloc en `display:none` — la variante mobile sur grand écran, et
 *    inversement — n'intersecte rien. On réexamine donc le document à chaque
 *    changement de largeur, sans quoi ce bloc resterait invisible s'il venait
 *    à s'afficher.
 */
export function RevealObserver() {
  useEffect(() => {
    const reveal = (element: Element): void => {
      element.setAttribute('data-revealed', '');
      element.querySelectorAll('[data-reveal]').forEach((child) => {
        child.setAttribute('data-revealed', '');
      });
    };

    const revealAllNow = (): void =>
      document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(reveal);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealAllNow();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );

    /**
     * Cibles : les groupes, et les éléments isolés qui n'appartiennent à aucun
     * groupe. Un élément déjà dans le cadre au chargement est révélé sans
     * attendre le moindre défilement.
     */
    const collect = (): Element[] => {
      const groups = [...document.querySelectorAll('[data-reveal-group]:not([data-revealed])')];
      const loose = [...document.querySelectorAll('[data-reveal]:not([data-revealed])')].filter(
        (element) => !element.closest('[data-reveal-group]'),
      );
      return [...groups, ...loose];
    };

    const scan = (): void => {
      for (const target of collect()) {
        const rect = target.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          // Masqué par la mise en page : on l'observe, il se révélera s'il paraît.
          observer.observe(target);
          continue;
        }

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          reveal(target);
          continue;
        }

        observer.observe(target);
      }
    };

    scan();

    let resizeFrame = 0;
    const onResize = (): void => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(scan);
    };

    // Contenu ajouté après coup : filtrage du catalogue, listes réordonnées.
    const mutations = new MutationObserver(() => scan());
    mutations.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
