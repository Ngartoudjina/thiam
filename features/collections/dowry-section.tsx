import { ArrowRightIcon, CheckIcon } from '@/components/common/icons';
import { Eyebrow } from '@/components/common/eyebrow';
import { MediaFrame } from '@/components/common/media-frame';
import { Reveal } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { Button } from '@/components/ui/button';
import { MEDIA } from '@/constants/media';
import { DOWRY_BENEFITS } from '@/constants/collections';
import { CONTACT, WHATSAPP_INTENTS } from '@/constants/site';

/** « Le coffret de dot » — la pièce maîtresse de la collection mariage. */
export function DowrySection() {
  return (
    <section aria-labelledby="dot-titre" className="bg-ivory gutter py-14 lg:py-27.5">
      <div className="grid items-stretch lg:grid-cols-2">
        <Reveal variant="settle" className="h-[16rem] lg:h-[35rem]">
          <MediaFrame
            asset={MEDIA.presentationParures}
            alt="Coffret de mariage : parure complète présentée dans son écrin"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-full w-full"
          />
        </Reveal>

        <div className="flex flex-col justify-center border border-rule-light-soft bg-porcelain px-7 py-12 lg:border-l-0 lg:px-17.5 lg:py-19">
          <Eyebrow className="mb-5 lg:mb-6.5">Collection mariage</Eyebrow>

          <TextLines
            id="dot-titre"
            lines={[
              'Le coffret',
              <>
                de <em className="font-light">dot</em>
              </>,
            ]}
            className="mb-5 font-serif text-[clamp(2.25rem,1.78rem+1.9vw,3.5rem)] leading-[1.04] font-light text-ink lg:mb-6"
          />

          <Reveal variant="up-sm" as="p" className="mb-8 lg:mb-8.5">
            <span className="block text-body leading-[1.8] font-light text-stone">
              Parure complète, écrin, gravure des prénoms et certificat pour chaque pièce. Nous
              réservons le salon privé une heure pour l’essayage — thé compris.
            </span>
          </Reveal>

          <ul className="mb-10 flex flex-col gap-4">
            {DOWRY_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3.5 border-b border-[rgb(22_18_15/0.1)] pb-3.5"
              >
                <CheckIcon size={16} className="text-gold-dim" />
                <span className="text-body-sm font-light text-umber">{benefit}</span>
              </li>
            ))}
          </ul>

          <Reveal variant="up-sm" className="self-start">
            <Button asChild variant="ink" size="lg">
              <a
                href={CONTACT.whatsappWithMessage(WHATSAPP_INTENTS.fitting)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Réserver un essayage
                <ArrowRightIcon size={16} />
              </a>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
