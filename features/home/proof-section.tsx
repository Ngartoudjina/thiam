import { StarRating } from '@/components/common/star-rating';
import { CountUp } from '@/components/motion/count-up';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import type { StatsContent } from '@/lib/schemas/content';
import type { Testimonial } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Bande de preuve sociale.
 *
 * « Les quatre chiffres comptent de 0 à leur valeur en 900 ms, l'un après
 * l'autre. Les traits verticaux se tirent du haut vers le bas. Rien au survol :
 * cette bande est une respiration, elle reste immobile. »
 */
interface ProofSectionProps {
  readonly stats: StatsContent['items'];
  readonly testimonial: Testimonial;
}

export function ProofSection({ stats, testimonial }: ProofSectionProps) {
  return (
    <section aria-label="La maison en chiffres" className="bg-obsidian gutter pb-12 lg:pb-19">
      <RevealGroup
        as="ul"
        stagger={0.12}
        className="grid grid-cols-2 gap-px border-t border-rule-dark bg-[rgb(22_18_15/0.08)] lg:grid-cols-4 lg:gap-0 lg:bg-transparent"
      >
        {stats.map((stat, index) => (
          <RevealItem
            as="li"
            key={stat.mobileLabel}
            className={cn(
              'bg-obsidian px-5 py-6.5 lg:relative lg:px-10 lg:pt-14 lg:pb-0',
              index === 0 && 'lg:pr-10 lg:pl-0',
              index === stats.length - 1 && 'lg:pr-0 lg:pl-10',
              index < stats.length - 1 && 'lg:border-r lg:border-[rgb(22_18_15/0.08)]',
            )}
          >
            <p className="text-gold-gradient font-serif text-stat leading-none font-light">
              <span className="lg:hidden">
                {stat.mobileDisplay ?? (
                  <>
                    <CountUp
                      value={stat.value}
                      decimals={stat.decimals ?? 0}
                      delay={index * 0.12}
                    />
                    {stat.suffix ? <span className="text-[0.5em]">{stat.suffix}</span> : null}
                  </>
                )}
              </span>
              <span className="hidden lg:inline">
                <CountUp value={stat.value} decimals={stat.decimals ?? 0} delay={index * 0.12} />
                {stat.suffix ? <span className="text-[0.4545em]">{stat.suffix}</span> : null}
              </span>
            </p>

            <p className="mt-2.5 text-label tracking-[0.12em] text-on-dark-faint uppercase lg:mt-4 lg:text-caption-lg lg:leading-[1.6]">
              <span className="lg:hidden">{stat.mobileLabel}</span>
              <span className="hidden lg:inline">
                {stat.label.split('\n').map((line, lineIndex) => (
                  <span key={lineIndex} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </p>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal
        as="figure"
        variant="up-sm"
        className="mt-12 flex flex-col gap-6 border border-[rgb(22_18_15/0.09)] bg-[linear-gradient(100deg,rgba(22,18,15,0.055),rgba(22,18,15,0.015))] p-7 lg:mt-16 lg:flex-row lg:items-center lg:gap-11 lg:px-11 lg:py-8.5"
      >
        <StarRating rating={testimonial.rating} className="shrink-0" />

        <blockquote className="flex-1 font-serif text-quote leading-[1.45] font-light text-ink italic">
          « {testimonial.quote} »
        </blockquote>

        <figcaption className="shrink-0 lg:text-right">
          <span className="block text-caption tracking-(--tracking-label) text-gold-light uppercase">
            {testimonial.author}
          </span>
          <span className="mt-1.5 block text-label-lg font-light text-on-dark-faint">
            {testimonial.context}
          </span>
        </figcaption>
      </Reveal>
    </section>
  );
}
