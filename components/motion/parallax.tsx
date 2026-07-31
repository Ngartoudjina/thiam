'use client';

import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Amplitude verticale totale, en pixels. */
  readonly distance?: number;
}

/**
 * Dérive verticale lente pilotée par le défilement.
 *
 * La couche mobile déborde du cadre de la moitié de l'amplitude en haut comme
 * en bas : elle peut donc parcourir toute sa course sans jamais découvrir le
 * fond. Sans cette marge, la photo du hero laisserait un liseré noir en fin de
 * déplacement.
 */
export function Parallax({ children, className, distance = 40 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2]);

  if (prefersReducedMotion) {
    return <div className={cn('relative overflow-hidden', className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <m.div
        style={{ y, top: -distance / 2, bottom: -distance / 2 }}
        className="absolute inset-x-0 will-change-transform"
      >
        {children}
      </m.div>
    </div>
  );
}
