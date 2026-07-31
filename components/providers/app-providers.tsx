'use client';

import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { HashScroll } from '@/components/providers/hash-scroll';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { EASE_EDITORIAL, DURATION } from '@/lib/motion';

/**
 * Fournisseurs applicatifs.
 *
 * `LazyMotion` en mode `strict` n'embarque que les fonctionnalités réellement
 * utilisées — animations, sorties, survol, focus et détection d'entrée dans le
 * cadre. Le moteur de projection de mise en page, inutile ici, reste hors du
 * bundle ; en contrepartie, seuls les composants `m.*` sont autorisés, ce que
 * le mode strict fait respecter à la compilation.
 *
 * `reducedMotion="user"` applique la règle de la maquette : lorsque le système
 * demande un mouvement réduit, déplacements et zooms sont neutralisés et
 * « tout devient un simple fondu », sans qu'aucun composant n'ait à le gérer.
 */
export function AppProviders({ children }: { readonly children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: DURATION.reveal, ease: EASE_EDITORIAL }}
      >
        <SmoothScrollProvider>
          <HashScroll />
          {children}
        </SmoothScrollProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
