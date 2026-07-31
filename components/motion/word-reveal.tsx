'use client';

import { m } from 'framer-motion';
import { DURATION, EASE_EDITORIAL } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface WordRevealProps {
  readonly text: string;
  readonly className?: string;
  readonly delay?: number;
}

const wordVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE_EDITORIAL } },
};

/**
 * « La citation finale apparaît mot par mot. »
 * Le texte complet reste lisible par les technologies d'assistance : chaque
 * mot est un `span` inline, l'ordre de lecture n'est jamais altéré.
 */
export function WordReveal({ text, className, delay = 0 }: WordRevealProps) {
  const words = text.split(' ');

  return (
    <m.span
      className={cn('inline', className)}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.035, delayChildren: delay } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {words.map((word, index) => (
        <m.span key={`${word}-${index}`} variants={wordVariants} className="inline-block">
          {word}
          {index < words.length - 1 ? ' ' : null}
        </m.span>
      ))}
    </m.span>
  );
}
