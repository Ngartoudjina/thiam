'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { maskUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface MaskRevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  /** Déclenche dès le montage plutôt qu'à l'entrée dans le cadre (hero). */
  readonly immediate?: boolean;
}

/** « La photo se révèle par un masque vertical de bas en haut. » */
export function MaskReveal({ children, className, delay = 0, immediate = false }: MaskRevealProps) {
  return (
    <m.div
      className={cn('will-change-[clip-path]', className)}
      variants={maskUp}
      initial="hidden"
      {...(immediate
        ? { animate: 'visible' }
        : { whileInView: 'visible', viewport: { once: true, amount: 0.2 } })}
      transition={{ delay }}
    >
      {children}
    </m.div>
  );
}
