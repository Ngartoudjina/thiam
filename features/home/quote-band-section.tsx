import { MediaFrame } from '@/components/common/media-frame';
import { Reveal } from '@/components/motion/reveal';
import { MEDIA } from '@/constants/media';
import { HOUSE_QUOTE } from '@/constants/craft';

/**
 * Bande de respiration entre le savoir-faire et la galerie : une photo large
 * assombrie, et la phrase de la maison posée dessus en verre dépoli.
 */
export function QuoteBandSection() {
  return (
    <section aria-label="La promesse de la maison" className="bg-obsidian pt-14 lg:pt-27">
      <div className="relative h-[22rem] overflow-hidden lg:h-[32.5rem]">
        <MediaFrame
          asset={MEDIA.presentationParures}
          sizes="100vw"
          objectPosition="object-[50%_40%]"
          className="absolute inset-0 h-full w-full"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(11,11,12,0.92)_0%,rgba(11,11,12,0.5)_60%,rgba(11,11,12,0.35)_100%)] lg:bg-[linear-gradient(90deg,rgba(11,11,12,0.9)_0%,rgba(11,11,12,0.35)_46%,rgba(11,11,12,0.1)_100%)]"
        />

        <div className="absolute inset-0 flex flex-col justify-center gutter">
          <Reveal
            as="figure"
            variant="up-sm"
            className="w-full border border-[rgb(247_244_239/0.13)] glass-dark p-7 lg:w-[32.5rem] lg:px-10.5 lg:py-10"
          >
            <blockquote className="mb-5.5 font-serif text-quote leading-[1.42] font-light text-ivory italic">
              « {HOUSE_QUOTE.quote} »
            </blockquote>
            <figcaption className="flex items-center gap-3.5">
              <span aria-hidden="true" className="h-px w-7.5 bg-gold" />
              <span className="text-label tracking-(--tracking-badge) text-gold-warm uppercase">
                {HOUSE_QUOTE.author}
              </span>
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
