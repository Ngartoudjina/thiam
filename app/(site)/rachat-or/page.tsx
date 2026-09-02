import { JsonLd } from '@/components/common/json-ld';
import { CompactFooter } from '@/components/layout/compact-footer';
import { BUYBACK_PAGE } from '@/constants/landing';
import { ROUTES } from '@/constants/navigation';
import { WHATSAPP_INTENTS } from '@/constants/site';
import {
  LandingCards,
  LandingFaq,
  LandingHero,
  LandingNote,
  LandingSteps,
} from '@/features/landing/landing-sections';
import { OG_CARDS } from '@/lib/og-card';
import { createMetadata, PAGE_KEYWORDS } from '@/lib/seo';
import {
  buildBuybackServiceSchema,
  buildFaqSchema,
  buildWebPageSchema,
} from '@/lib/structured-data';
import { getSiteSettings } from '@/services/content';

const TRAIL = [
  { name: 'Accueil', path: ROUTES.home },
  { name: 'Rachat d’or', path: ROUTES.buyback },
];

export const metadata = createMetadata({
  title: 'Rachat d’or à Cotonou — pesé devant vous',
  description:
    'Nous rachetons votre or à Cotonou au cours du jour : bijoux cassés, pièces héritées, or dentaire, 14 à 24 carats. Estimation gratuite, paiement immédiat.',
  path: ROUTES.buyback,
  keywords: PAGE_KEYWORDS.buyback,
  image: { src: '/og/rachat-or', alt: OG_CARDS['rachat-or'].alt },
});

/**
 * Rachat d'or — page dédiée.
 *
 * L'accueil annonce l'activité ; cette page répond aux questions que se pose
 * quelqu'un qui cherche « rachat d'or Cotonou » et hésite à se déplacer : ce
 * que la maison reprend, comment le prix se forme, ce qu'il faut apporter.
 */
export default async function BuybackPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd
        id="schema-page-rachat"
        data={buildWebPageSchema({
          name: BUYBACK_PAGE.title,
          description: BUYBACK_PAGE.lead,
          path: ROUTES.buyback,
          image: BUYBACK_PAGE.hero.src,
          trail: TRAIL,
        })}
      />
      <JsonLd id="schema-service-rachat" data={buildBuybackServiceSchema()} />
      <JsonLd id="schema-faq-rachat" data={buildFaqSchema(BUYBACK_PAGE.faq)} />

      <LandingHero
        trail={TRAIL}
        eyebrow={BUYBACK_PAGE.eyebrow}
        titleId="rachat-titre"
        lines={[...BUYBACK_PAGE.titleLines]}
        lead={BUYBACK_PAGE.lead}
        image={BUYBACK_PAGE.hero}
        whatsappIntent={WHATSAPP_INTENTS.buyback}
        ctaLabel="Estimer mon or sur WhatsApp"
      />

      <LandingCards
        titleId="rachat-repris"
        title={BUYBACK_PAGE.accepted.title}
        items={BUYBACK_PAGE.accepted.items}
      />

      <LandingSteps
        titleId="rachat-prix"
        title={BUYBACK_PAGE.pricing.title}
        blocks={BUYBACK_PAGE.pricing.blocks}
      />

      <LandingNote
        titleId="rachat-papiers"
        title={BUYBACK_PAGE.papers.title}
        body={BUYBACK_PAGE.papers.body}
      />

      <LandingFaq titleId="rachat-questions" entries={BUYBACK_PAGE.faq} />

      <CompactFooter variant="hours" contact={settings.contact} hours={settings.hours} />
    </>
  );
}
