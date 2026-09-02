import { Eyebrow } from '@/components/common/eyebrow';
import { MediaFrame } from '@/components/common/media-frame';
import { MEDIA } from '@/constants/media';
import { Section } from '@/components/common/section';
import { StarRating } from '@/components/common/star-rating';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { TestimonialCard } from '@/features/home/components/testimonial-card';
import { TestimonialCarousel } from '@/features/home/components/testimonial-carousel';
import type { Testimonial } from '@/types';
import { SECTIONS } from '@/constants/navigation';
import { resolveVisual } from '@/services/content/media';
import type { VisualsContent } from '@/lib/schemas/content';

/** Décalage vertical des trois cartes — l'arrivée « en éventail ». */
const FAN_OFFSETS = ['lg:mt-0', 'lg:mt-10', 'lg:mt-3.5'] as const;

/** « Ce que l'on dit de nous, en ville ». */
interface TestimonialsSectionProps {
  readonly featured: Testimonial;
  readonly cards: readonly Testimonial[];
  readonly visuals: VisualsContent;
}

export function TestimonialsSection({ featured, cards, visuals }: TestimonialsSectionProps) {
  return (
    <Section id={SECTIONS.testimonials} theme="light" labelledBy="temoignages-titre">
      <Eyebrow className="mb-6 lg:mb-7">Témoignages</Eyebrow>

      <TextLines
        id="temoignages-titre"
        lines={[
          'Ce que l’on dit de nous,',
          <>
            en <em className="font-light">ville</em>
          </>,
        ]}
        className="mb-12 font-serif text-section leading-[1.02] font-light tracking-(--tracking-display) text-ink lg:mb-19"
      />

      <div className="mb-12 grid gap-10 lg:mb-15 lg:grid-cols-[27.5rem_1fr] lg:items-stretch lg:gap-15">
        <Reveal variant="settle">
          <MediaFrame
            asset={resolveVisual(visuals.testimonialPortrait, MEDIA.bouclesFleurPerle)}
            placeholder="Portrait cliente en boutique"
            sizes="(min-width: 1024px) 440px, 100vw"
            className="h-[18rem] w-full lg:h-[32.5rem]"
          />
        </Reveal>

        <Reveal as="figure" variant="up-sm" className="flex flex-col justify-center lg:py-5">
          <StarRating rating={featured.rating} size={17} className="mb-7 lg:mb-8.5" />

          <blockquote className="mb-8 max-w-[47.5rem] font-serif text-quote-lg leading-[1.3] font-light text-ink lg:mb-9">
            « {featured.quote} »
          </blockquote>

          <figcaption className="flex items-center gap-4.5">
            <span aria-hidden="true" className="h-px w-9.5 bg-gold" />
            <span>
              <span className="block text-caption-lg tracking-(--tracking-button) text-ink uppercase">
                {featured.author}
              </span>
              <span className="mt-1.5 block text-meta-lg font-normal text-clay">
                {featured.context}
              </span>
            </span>
          </figcaption>
        </Reveal>
      </div>

      <TestimonialCarousel testimonials={cards} />

      <RevealGroup as="ul" className="hidden lg:grid lg:grid-cols-3 lg:items-start lg:gap-6.5">
        {cards.map((testimonial, index) => (
          <RevealItem as="li" key={testimonial.author} className={FAN_OFFSETS[index] ?? 'lg:mt-0'}>
            <TestimonialCard testimonial={testimonial} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
