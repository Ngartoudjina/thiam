'use client';

import { m } from 'framer-motion';
import { StarIcon } from '@/components/common/icons';
import { STAGGER, staggerContainer, transitions } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly size?: number;
  readonly className?: string;
  readonly gap?: 'tight' | 'default';
}

const starVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: transitions.state },
};

/** « Les cinq étoiles se posent l'une après l'autre (50 ms). » */
export function StarRating({ rating, size = 15, className, gap = 'default' }: StarRatingProps) {
  return (
    <m.div
      role="img"
      aria-label={`Note : ${rating} sur 5`}
      className={cn('flex', gap === 'tight' ? 'gap-1' : 'gap-[5px]', className)}
      variants={staggerContainer(STAGGER.stars)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
    >
      {Array.from({ length: rating }, (_, index) => (
        <m.span key={index} variants={starVariants} className="inline-flex">
          <StarIcon size={size} className="text-gold" />
        </m.span>
      ))}
    </m.div>
  );
}
