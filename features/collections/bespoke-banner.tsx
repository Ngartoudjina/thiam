import { Eyebrow } from '@/components/common/eyebrow';
import { WhatsAppIcon } from '@/components/common/icons';
import { Reveal } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { Button } from '@/components/ui/button';
import { CONTACT, WHATSAPP_INTENTS } from '@/constants/site';

/** « Vous ne trouvez pas ? Nous le fabriquons. » */
export function BespokeBanner() {
  return (
    <section
      aria-labelledby="sur-mesure-titre"
      className="mt-14 flex flex-col gap-9 bg-obsidian gutter py-14 lg:mt-27.5 lg:flex-row lg:items-center lg:justify-between lg:gap-17.5 lg:py-24"
    >
      <div>
        <Eyebrow theme="light" className="mb-5 lg:mb-6">
          Sur mesure
        </Eyebrow>

        <TextLines
          id="sur-mesure-titre"
          lines={[
            'Vous ne trouvez pas ?',
            <em key="fab" className="font-light text-gold-light">
              Nous le fabriquons.
            </em>,
          ]}
          className="mb-4 font-serif text-[clamp(2.375rem,1.83rem+2.24vw,3.875rem)] leading-[1.04] font-light text-ink lg:mb-5"
        />

        <Reveal variant="up-sm" as="p">
          <span className="block max-w-[35rem] text-body leading-[1.7] font-normal text-on-dark-faint">
            Envoyez-nous une photo, une idée, ou même un ancien bijou. Vous recevez un dessin sous
            48 heures et un prix ferme avant tout engagement.
          </span>
        </Reveal>
      </div>

      <Reveal variant="up-sm" className="flex shrink-0 flex-col gap-3.5">
        <Button asChild variant="gold" size="xl" block>
          <a
            href={CONTACT.whatsappWithMessage(WHATSAPP_INTENTS.bespoke)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={15} />
            Envoyer une photo sur WhatsApp
          </a>
        </Button>
        <Button asChild variant="outlineLight" size="xl" block>
          <a href={CONTACT.phoneHref}>Appeler l’atelier</a>
        </Button>
      </Reveal>
    </section>
  );
}
