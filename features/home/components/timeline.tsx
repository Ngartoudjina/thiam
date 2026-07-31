'use client';

import { m, useInView, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, STAGGER } from '@/lib/motion';
import type { Milestone } from '@/types';

/**
 * Chronologie de la maison.
 *
 * « Le filet vertical se remplit à mesure du scroll ; chaque date s'allume à
 * l'or quand son bloc entre dans le cadre. »
 */
export function Timeline({ milestones }: { readonly milestones: readonly Milestone[] }) {
  const ref = useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 78%', 'end 60%'],
  });

  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  return (
    <m.ol
      ref={ref}
      variants={staggerContainer(STAGGER.default)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="relative"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 hidden w-px bg-rule-light lg:block"
      />
      <m.span
        aria-hidden="true"
        style={{ scaleY }}
        className="absolute top-0 bottom-0 left-0 hidden w-px origin-top bg-gold-dim lg:block"
      />

      {milestones.map((milestone, index) => (
        <MilestoneRow
          key={milestone.year}
          milestone={milestone}
          isLast={index === milestones.length - 1}
        />
      ))}
    </m.ol>
  );
}

function MilestoneRow({
  milestone,
  isLast,
}: {
  readonly milestone: Milestone;
  readonly isLast: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <m.li
      ref={ref}
      variants={fadeUp}
      className={cn(
        'grid gap-2 border-b border-rule-light py-8 lg:grid-cols-[6.5rem_1fr] lg:gap-0 lg:pl-8',
        isLast && 'pb-9',
      )}
    >
      <span
        className={cn(
          'font-serif text-[1.1875rem] tracking-[0.1em] transition-colors duration-(--duration-reveal) ease-out',
          isInView ? 'text-gold-ink' : 'text-fog',
        )}
      >
        {milestone.year}
      </span>
      <div>
        <h3 className="mb-3 font-serif text-milestone leading-[1.15] font-normal text-ink">
          {milestone.title}
        </h3>
        <p className="text-body-sm leading-[1.72] font-light text-clay">{milestone.description}</p>
      </div>
    </m.li>
  );
}
