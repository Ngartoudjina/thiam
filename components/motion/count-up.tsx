'use client';

import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { DURATION, EASE_EDITORIAL } from '@/lib/motion';
import { formatNumber } from '@/lib/format';

interface CountUpProps {
  readonly value: number;
  readonly decimals?: number;
  readonly delay?: number;
  readonly className?: string;
}

/**
 * « Les quatre chiffres comptent de 0 à leur valeur en 900 ms, l'un après
 * l'autre. » Le décompte ne se joue qu'une fois, à l'entrée dans le cadre.
 *
 * La valeur finale est présente dans le DOM dès le rendu serveur, et
 * `onComplete` la rétablit à la fin : si l'animation est interrompue — onglet
 * en arrière-plan, navigateur restrictif — le chiffre juste reste affiché,
 * jamais un zéro figé.
 */
export function CountUp({ value, decimals = 0, delay = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const finalValue = formatNumber(value, decimals);
  const [display, setDisplay] = useState(finalValue);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    setDisplay(formatNumber(0, decimals));

    const controls = animate(0, value, {
      duration: DURATION.counter,
      delay,
      ease: EASE_EDITORIAL,
      onUpdate: (latest) => setDisplay(formatNumber(latest, decimals)),
      onComplete: () => setDisplay(finalValue),
    });

    // Filet de sécurité : quoi qu'il arrive, la valeur juste est rétablie.
    const guard = window.setTimeout(
      () => setDisplay(finalValue),
      (DURATION.counter + delay) * 1000 + 400,
    );

    return () => {
      controls.stop();
      window.clearTimeout(guard);
    };
  }, [isInView, prefersReducedMotion, value, decimals, delay, finalValue]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{finalValue}</span>
    </span>
  );
}
