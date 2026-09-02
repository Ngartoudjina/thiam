import Link from 'next/link';
import { JsonLd } from '@/components/common/json-ld';
import { CompactFooter } from '@/components/layout/compact-footer';
import { WEDDING_PAGE } from '@/constants/landing';
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
  buildFaqSchema,
  buildWebPageSchema,
  buildWeddingServiceSchema,
} from '@/lib/structured-data';
import { getSiteSettings } from '@/services/content';

const TRAIL = [
  { name: 'Accueil', path: ROUTES.home },
  { name: 'Alliances & mariage', path: ROUTES.wedding },
];

export const metadata = createMetadata({
  title: 'Alliances et bijoux de mariage à Cotonou',
  description:
    'Alliances en or 14 à 24 carats gravées à la main, bagues de fiançailles et parures de dot, façonnées dans notre atelier de Cotonou. Gravure offerte.',
  path: ROUTES.wedding,
  keywords: PAGE_KEYWORDS.wedding,
  image: { src: '/og/alliances-mariage', alt: OG_CARDS['alliances-mariage'].alt },
});

/**
 * Alliances et mariage — page dédiée.
 *
 * Le mariage est le premier motif de visite de la maison. Cette page traite ce
 * que l'accueil ne fait qu'annoncer : les titres d'or et leur usage, le
 * déroulé d'une commande, les délais avant la cérémonie.
 */
export default async function WeddingPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd
        id="schema-page-mariage"
        data={buildWebPageSchema({
          name: WEDDING_PAGE.title,
          description: WEDDING_PAGE.lead,
          path: ROUTES.wedding,
          image: WEDDING_PAGE.hero.src,
          trail: TRAIL,
        })}
      />
      <JsonLd id="schema-service-mariage" data={buildWeddingServiceSchema()} />
      <JsonLd id="schema-faq-mariage" data={buildFaqSchema(WEDDING_PAGE.faq)} />

      <LandingHero
        trail={TRAIL}
        eyebrow={WEDDING_PAGE.eyebrow}
        titleId="mariage-titre"
        lines={[...WEDDING_PAGE.titleLines]}
        lead={WEDDING_PAGE.lead}
        image={WEDDING_PAGE.hero}
        whatsappIntent={WHATSAPP_INTENTS.fitting}
        ctaLabel="Réserver un essayage"
      />

      <LandingCards
        titleId="mariage-offre"
        title={WEDDING_PAGE.offer.title}
        items={WEDDING_PAGE.offer.items}
      />

      <LandingSteps
        titleId="mariage-deroule"
        title={WEDDING_PAGE.steps.title}
        blocks={WEDDING_PAGE.steps.blocks}
      />

      <LandingNote
        titleId="mariage-reprise"
        title="Un ancien bijou en échange"
        body="L’or que vous apportez est pesé et testé devant vous, puis déduit du prix des alliances. Le protocole est celui du rachat, pièce d’identité comprise."
      >
        <Link
          href={ROUTES.buyback}
          className="mt-5 inline-flex text-label-lg tracking-(--tracking-label) text-gold-ink uppercase underline-offset-4 transition-colors duration-(--duration-state) ease-out hover:text-ink hover:underline"
        >
          Voir le détail du rachat d’or
        </Link>
      </LandingNote>

      <LandingFaq titleId="mariage-questions" entries={WEDDING_PAGE.faq} />

      <CompactFooter variant="hours" contact={settings.contact} hours={settings.hours} />
    </>
  );
}
