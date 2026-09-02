import { Eyebrow } from '@/components/common/eyebrow';
import { MediaFrame } from '@/components/common/media-frame';
import { MEDIA } from '@/constants/media';
import { pathToMediaAsset } from '@/services/content/media';
import { Reveal } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { WordReveal } from '@/components/motion/word-reveal';
import { Timeline } from '@/features/home/components/timeline';
import type { AboutContent } from '@/lib/schemas/content';

import { SECTIONS } from '@/constants/navigation';

/**
 * « D'un comptoir à une maison ».
 *
 * « La colonne de gauche reste fixe pendant que la chronologie défile
 * (sticky), jusqu'au dernier jalon. »
 */
export function StorySection({ about }: { readonly about: AboutContent }) {
  return (
    <section
      id={SECTIONS.story}
      aria-labelledby="histoire-titre"
      className="bg-ivory gutter pt-5 section-pb"
    >
      <div className="grid border-t border-rule-light lg:grid-cols-2">
        <div className="border-rule-light pt-14 pb-10 lg:border-r lg:py-25 lg:pr-20">
          <div className="lg:sticky lg:top-32">
            <Eyebrow className="mb-6 lg:mb-7">{about.eyebrow}</Eyebrow>

            <TextLines
              id="histoire-titre"
              lines={[
                about.titleLine1,
                <>
                  <em className="font-light">{about.titleLine2}</em>
                </>,
              ]}
              className="mb-7 font-serif text-section leading-[1.02] font-light tracking-(--tracking-display) text-ink lg:mb-8.5"
            />

            <Reveal variant="up-sm" as="p" className="mb-8 max-w-[26.875rem] lg:mb-10">
              <span className="block text-body leading-[1.8] font-normal text-stone">
                {about.description}
              </span>
            </Reveal>

            <Reveal variant="settle" className="max-w-[28.75rem]">
              <MediaFrame
                asset={pathToMediaAsset(
                  about.portraitPath,
                  about.portraitAlt,
                  MEDIA.bagueOrRosePerle,
                )}
                placeholder="Portrait du fondateur / de l’équipe"
                sizes="(min-width: 1024px) 460px, 100vw"
                className="h-[16rem] w-full lg:h-[26.875rem]"
              />
            </Reveal>
          </div>
        </div>

        <div className="pt-10 pb-14 lg:py-25 lg:pl-20">
          <Timeline milestones={about.milestones} />

          <Reveal as="figure" variant="up-sm" className="mt-10 lg:mt-13">
            <blockquote className="mb-6 font-serif text-quote-lg leading-[1.28] font-light text-ink italic">
              <WordReveal text={`« ${about.quote} »`} />
            </blockquote>
            <figcaption className="text-label tracking-(--tracking-badge) text-gold-ink uppercase">
              {about.quoteAuthor}
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
