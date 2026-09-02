import type { ReactNode } from 'react';
import { Breadcrumb, type Crumb } from '@/components/common/breadcrumb';
import { Eyebrow } from '@/components/common/eyebrow';
import { WhatsAppIcon } from '@/components/common/icons';
import { MediaFrame } from '@/components/common/media-frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/constants/site';
import type { MediaAsset } from '@/types';
import type { FaqEntry } from '@/types';

/**
 * Briques communes aux pages de destination.
 *
 * Elles reprennent le vocabulaire graphique de l'accueil — sur-titre, titre
 * serif en lignes, révélation au défilement — sans en reprendre le contenu.
 */

interface LandingHeroProps {
  readonly trail: readonly Crumb[];
  readonly eyebrow: string;
  readonly titleId: string;
  readonly lines: readonly ReactNode[];
  readonly lead: string;
  readonly image: MediaAsset;
  readonly whatsappIntent: string;
  readonly ctaLabel: string;
}

export function LandingHero({
  trail,
  eyebrow,
  titleId,
  lines,
  lead,
  image,
  whatsappIntent,
  ctaLabel,
}: LandingHeroProps) {
  return (
    // Compense la hauteur de la barre fixe, comme les autres pages intérieures.
    <section
      aria-labelledby={titleId}
      className="bg-ivory gutter pt-[8.75rem] pb-14 lg:pt-[12.5rem] lg:pb-20"
    >
      <Breadcrumb trail={trail} className="mb-5 lg:mb-6.5" />

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-20">
        <div>
          <Eyebrow className="mb-6 lg:mb-7">{eyebrow}</Eyebrow>

          <TextLines
            as="h1"
            id={titleId}
            lines={lines}
            className="mb-7 font-serif text-page leading-[0.98] font-light tracking-(--tracking-display-tight) text-ink"
          />

          <Reveal variant="up-sm" as="p" className="mb-9">
            <span className="block max-w-[34rem] text-lead leading-[1.75] font-normal text-stone">
              {lead}
            </span>
          </Reveal>

          <Reveal variant="up-sm" className="flex flex-wrap items-center gap-4">
            <Button asChild variant="gold" size="lg">
              <a
                href={CONTACT.whatsappWithMessage(whatsappIntent)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={15} />
                {ctaLabel}
              </a>
            </Button>
            <Button asChild variant="outlineDark" size="lg">
              <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
            </Button>
          </Reveal>
        </div>

        <Reveal variant="settle">
          <MediaFrame
            asset={image}
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            className="h-[20rem] w-full lg:h-[34rem]"
          />
        </Reveal>
      </div>
    </section>
  );
}

interface LandingCardsProps {
  readonly title: string;
  readonly titleId: string;
  readonly items: ReadonlyArray<{ readonly title: string; readonly body: string }>;
}

/** Grille de quatre cartes — « ce que nous reprenons », « ce que nous façonnons ». */
export function LandingCards({ title, titleId, items }: LandingCardsProps) {
  return (
    <section aria-labelledby={titleId} className="bg-obsidian gutter section-y">
      <TextLines
        as="h2"
        id={titleId}
        lines={[title]}
        className="mb-10 font-serif text-section leading-[1.04] font-light tracking-(--tracking-display) text-on-dark lg:mb-14"
      />

      <RevealGroup as="ul" className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {items.map((item) => (
          <RevealItem
            as="li"
            key={item.title}
            variant="up-sm"
            className="border-t border-rule-dark pt-6"
          >
            <h3 className="mb-3 font-serif text-[1.375rem] leading-[1.25] font-normal text-on-dark lg:text-[1.5rem]">
              {item.title}
            </h3>
            <p className="text-body-sm leading-[1.7] font-normal text-on-dark-soft">{item.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

interface LandingStepsProps {
  readonly title: string;
  readonly titleId: string;
  readonly blocks: ReadonlyArray<{ readonly title: string; readonly body: string }>;
}

/** Suite numérotée — la formation du prix, le déroulé d'une commande. */
export function LandingSteps({ title, titleId, blocks }: LandingStepsProps) {
  return (
    <section aria-labelledby={titleId} className="bg-ivory gutter section-y">
      <div className="grid gap-10 lg:grid-cols-[25rem_1fr] lg:items-start lg:gap-25">
        <TextLines
          as="h2"
          id={titleId}
          lines={[title]}
          className="font-serif text-section leading-[1.04] font-light tracking-(--tracking-display) text-ink"
        />

        <RevealGroup as="ol" className="border-t border-rule-light">
          {blocks.map((block, index) => (
            <RevealItem
              as="li"
              key={block.title}
              variant="left"
              className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-b border-rule-light py-6 lg:grid-cols-[3.5rem_1fr]"
            >
              <span className="pt-1 font-serif text-[0.9375rem] tracking-[0.24em] text-gold-ink">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="mb-2 font-serif text-[1.375rem] leading-[1.2] font-normal text-ink lg:text-[1.5rem]">
                  {block.title}
                </h3>
                <p className="text-body-sm leading-[1.7] font-normal text-clay">{block.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

interface LandingNoteProps {
  readonly title: string;
  readonly titleId: string;
  readonly body: string;
  readonly children?: ReactNode;
}

/** Encart appuyé — les papiers à prévoir, une condition à ne pas manquer. */
export function LandingNote({ title, titleId, body, children }: LandingNoteProps) {
  return (
    <section aria-labelledby={titleId} className="bg-ivory gutter pb-14 lg:pb-20">
      <Reveal variant="up-sm">
        <div className="border-l-2 border-gold-dim bg-sand/45 px-6 py-8 lg:px-11 lg:py-11">
          <h2
            id={titleId}
            className="mb-4 font-serif text-milestone leading-[1.2] font-normal text-ink"
          >
            {title}
          </h2>
          <p className="max-w-[46rem] text-body leading-[1.8] font-normal text-stone">{body}</p>
          {children}
        </div>
      </Reveal>
    </section>
  );
}

interface LandingFaqProps {
  readonly titleId: string;
  readonly entries: readonly FaqEntry[];
}

/** Questions propres à la page — jamais celles de l'accueil. */
export function LandingFaq({ titleId, entries }: LandingFaqProps) {
  return (
    <section aria-labelledby={titleId} className="bg-ivory gutter pb-16 lg:pb-24">
      <div className="grid gap-10 border-t border-rule-light pt-14 lg:grid-cols-[25rem_1fr] lg:items-start lg:gap-25 lg:pt-20">
        <TextLines
          as="h2"
          id={titleId}
          lines={['Questions', 'fréquentes']}
          className="font-serif text-section leading-[1.04] font-light tracking-(--tracking-display) text-ink"
        />

        <RevealGroup stagger={0.06}>
          <Accordion type="single" collapsible defaultValue={`${titleId}-0`}>
            {entries.map((entry, index) => (
              <RevealItem key={entry.question} variant="up-sm">
                <AccordionItem value={`${titleId}-${index}`}>
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
