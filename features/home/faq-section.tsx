import { Eyebrow } from '@/components/common/eyebrow';
import { WhatsAppIcon } from '@/components/common/icons';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { CONTACT, WHATSAPP_INTENTS } from '@/constants/site';
import { SECTIONS } from '@/constants/navigation';
import type { FaqEntry } from '@/types';

/**
 * « Ce que l'on nous demande souvent ».
 * La première question est ouverte par défaut, les autres se révèlent en
 * cascade. Le contenu alimente aussi le balisage `FAQPage`.
 */
export function FaqSection({ entries }: { readonly entries: readonly FaqEntry[] }) {
  return (
    <section
      id={SECTIONS.faq}
      aria-labelledby="faq-titre"
      className="bg-ivory gutter pt-5 section-pb"
    >
      <div className="grid gap-10 border-t border-rule-light pt-14 lg:grid-cols-[25rem_1fr] lg:items-start lg:gap-25 lg:pt-25">
        <div>
          <Eyebrow className="mb-6 lg:mb-7">Questions</Eyebrow>

          <TextLines
            id="faq-titre"
            lines={[
              'Ce que l’on nous',
              <>
                demande <em className="font-light">souvent</em>
              </>,
            ]}
            className="mb-6 font-serif text-[clamp(2.375rem,1.85rem+2.16vw,3.75rem)] leading-[1.04] font-light tracking-(--tracking-display) text-ink lg:mb-7"
          />

          <Reveal variant="up-sm" as="p" className="mb-7 lg:mb-8">
            <span className="block max-w-[22rem] text-body-sm leading-[1.75] font-normal text-clay">
              Une question qui n’est pas là ? Écrivez-nous, nous répondons en général dans l’heure.
            </span>
          </Reveal>

          <Reveal variant="up-sm">
            <Button asChild variant="outlineGold" size="md">
              <a
                href={CONTACT.whatsappWithMessage(WHATSAPP_INTENTS.question)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={14} />
                Poser une question
              </a>
            </Button>
          </Reveal>
        </div>

        <RevealGroup stagger={0.06}>
          <Accordion type="single" collapsible defaultValue="faq-0">
            {entries.map((entry, index) => (
              <RevealItem key={entry.question} variant="up-sm">
                <AccordionItem value={`faq-${index}`}>
                  <AccordionTrigger>{entry.question}</AccordionTrigger>
                  <AccordionContent>{entry.answer}</AccordionContent>
                </AccordionItem>
              </RevealItem>
            ))}
          </Accordion>
        </RevealGroup>
      </div>
    </section>
  );
}
