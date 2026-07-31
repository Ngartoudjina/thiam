'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { TestimonialCard } from '@/features/home/components/testimonial-card';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

/**
 * « Sur mobile : glissement horizontal avec accroche. »
 * Embla assure l'accroche et le geste tactile ; la pagination reste opérable
 * au clavier et annonce la position aux lecteurs d'écran.
 */
export function TestimonialCarousel({
  testimonials,
}: {
  readonly testimonials: readonly Testimonial[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="lg:hidden">
      <div ref={emblaRef} className="-mx-5 overflow-hidden px-5">
        <ul className="flex gap-4">
          {testimonials.map((testimonial) => (
            <li key={testimonial.author} className="w-[85%] shrink-0 sm:w-[70%]">
              <TestimonialCard testimonial={testimonial} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex justify-center gap-2.5" role="tablist" aria-label="Témoignages">
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.author}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={`Témoignage ${index + 1} sur ${testimonials.length}`}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              'h-px w-8 transition-colors duration-(--duration-state) ease-out',
              index === selectedIndex ? 'bg-gold-ink' : 'bg-fog',
            )}
          />
        ))}
      </div>
    </div>
  );
}
