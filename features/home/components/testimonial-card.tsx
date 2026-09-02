import { StarRating } from '@/components/common/star-rating';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

interface TestimonialCardProps {
  readonly testimonial: Testimonial;
  readonly className?: string;
}

/** « La carte survolée se soulève de 6 px, son ombre s'étend. » */
export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        'flex h-full flex-col border border-rule-light-soft bg-porcelain px-8 pt-9 pb-8 shadow-(--shadow-card)',
        'transition-[transform,box-shadow] duration-(--duration-state) ease-out',
        'hover:-translate-y-1.5 hover:shadow-(--shadow-card-hover)',
        'lg:px-10 lg:pt-11 lg:pb-10',
        className,
      )}
    >
      <StarRating rating={testimonial.rating} size={14} gap="tight" className="mb-6" />

      <blockquote className="mb-7 flex-1 font-serif text-[1.375rem] leading-[1.5] font-light text-graphite">
        « {testimonial.quote} »
      </blockquote>

      <figcaption className="flex items-center gap-3.5 border-t border-[rgb(22_18_15/0.1)] pt-6">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand font-serif text-[0.9375rem] text-gold-ink"
        >
          {testimonial.author.charAt(0)}
        </span>
        <span>
          <span className="block text-label-lg tracking-(--tracking-label) text-ink uppercase">
            {testimonial.author}
          </span>
          <span className="mt-1 block text-caption-lg font-normal text-clay">
            {testimonial.context}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
