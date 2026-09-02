import { cn } from '@/lib/utils';
import type { Milestone } from '@/types';

/**
 * Chronologie de la maison.
 *
 * « Le filet vertical se remplit à mesure du scroll ; chaque date s'allume à
 * l'or quand son bloc entre dans le cadre. »
 *
 * Composant serveur : le remplissage du filet est une animation liée au
 * défilement décrite en CSS (`animation-timeline: view()`), et l'allumage des
 * dates suit la révélation du jalon. Cette section n'embarque donc plus ni
 * observateur de défilement, ni ressort d'animation en JavaScript.
 */
export function Timeline({ milestones }: { readonly milestones: readonly Milestone[] }) {
  return (
    <ol className="relative" data-reveal-group="">
      <span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 hidden w-px bg-rule-light lg:block"
      />
      <span
        aria-hidden="true"
        className="scroll-progress-line absolute top-0 bottom-0 left-0 hidden w-px bg-gold-dim lg:block"
      />

      {milestones.map((milestone, index) => (
        <li
          key={`${milestone.year}-${index}`}
          data-reveal="up"
          className={cn(
            'group grid gap-2 border-b border-rule-light py-8 lg:grid-cols-[6.5rem_1fr] lg:gap-0 lg:pl-8',
            index === milestones.length - 1 && 'pb-9',
          )}
        >
          {/* La date passe du gris à l'or lorsque son jalon est révélé. */}
          <span className="font-serif text-[1.1875rem] tracking-[0.1em] text-fog transition-colors duration-(--duration-reveal) ease-out group-data-[revealed]:text-gold-ink">
            {milestone.year}
          </span>
          <div>
            <h3 className="mb-3 font-serif text-milestone leading-[1.15] font-normal text-ink">
              {milestone.title}
            </h3>
            <p className="text-body-sm leading-[1.72] font-normal text-clay">
              {milestone.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
