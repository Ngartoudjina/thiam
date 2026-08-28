import { ArrowRightIcon, ServicePictogram, WhatsAppIcon } from '@/components/common/icons';
import { Eyebrow } from '@/components/common/eyebrow';
import { MediaFrame } from '@/components/common/media-frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { Button } from '@/components/ui/button';
import { BUYBACK } from '@/constants/craft';
import { MEDIA } from '@/constants/media';
import { SECTIONS } from '@/constants/navigation';
import { WHATSAPP_INTENTS } from '@/constants/site';
import type { ContactSettings } from '@/lib/schemas/content';
import { contactLinks } from '@/services/content';

/**
 * Rachat d'or.
 *
 * Activité centrale de la maison, traitée comme telle : un bloc pleine
 * largeur, une photo, et le protocole en trois gestes. La question « Comment
 * faire ? » est posée telle que la boutique la formule au comptoir.
 */
export function BuybackSection({ contact }: { readonly contact: ContactSettings }) {
  const links = contactLinks(contact);

  return (
    <section
      id={SECTIONS.buyback}
      aria-labelledby="rachat-titre"
      className="bg-ivory gutter section-y"
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
        <Reveal variant="settle" className="order-2 lg:order-1">
          <MediaFrame
            asset={MEDIA.parureOr}
            placeholder="Photo de rachat d’or : pesée au comptoir, balance certifiée"
            alt="Pesée de bijoux en or sur balance certifiée"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="h-[18rem] w-full lg:h-[32rem]"
          />
        </Reveal>

        <div className="order-1 lg:order-2">
          <Eyebrow className="mb-6 lg:mb-7">{BUYBACK.eyebrow}</Eyebrow>

          <TextLines
            id="rachat-titre"
            lines={[
              BUYBACK.titleLine1,
              <em key="or" className="font-light">
                {BUYBACK.titleLine2}
              </em>,
            ]}
            className="mb-6 font-serif text-section leading-[1.02] font-light tracking-(--tracking-display) text-ink lg:mb-7"
          />

          <Reveal variant="up-sm" as="p" className="mb-10">
            <span className="block max-w-[34rem] text-body leading-[1.8] font-light text-stone">
              {BUYBACK.description}
            </span>
          </Reveal>

          <p className="mb-6 font-serif text-milestone font-normal text-ink">{BUYBACK.question}</p>

          <RevealGroup as="ol" className="mb-10 border-t border-rule-light">
            {BUYBACK.steps.map((step) => (
              <RevealItem
                as="li"
                key={step.index}
                variant="left"
                className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-b border-rule-light py-5 lg:grid-cols-[3.5rem_1fr]"
              >
                <span className="pt-1 font-serif text-[0.9375rem] tracking-[0.24em] text-gold-ink">
                  {step.index}
                </span>
                <div>
                  <h3 className="mb-2 font-serif text-[1.375rem] leading-[1.2] font-normal text-ink lg:text-[1.5rem]">
                    {step.title}
                  </h3>
                  <p className="text-body-sm leading-[1.7] font-light text-clay">
                    {step.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal variant="up-sm" className="flex flex-wrap items-center gap-4">
            <Button asChild variant="gold" size="lg">
              <a
                href={links.whatsappWithMessage(WHATSAPP_INTENTS.buyback)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={15} />
                {BUYBACK.cta}
              </a>
            </Button>
            <span className="inline-flex items-center gap-2.5 text-label-lg tracking-(--tracking-label) text-gold-ink uppercase">
              <ServicePictogram name="buyback" size={18} />
              Paiement immédiat
              <ArrowRightIcon size={16} />
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
