import { JsonLd } from '@/components/common/json-ld';
import { SiteFooter } from '@/components/layout/site-footer';
import { CollectionsSection } from '@/features/home/collections-section';
import { BuybackSection } from '@/features/home/buyback-section';
import { CraftSection } from '@/features/home/craft-section';
import { FaqSection } from '@/features/home/faq-section';
import { GallerySection } from '@/features/home/gallery-section';
import { HeroSection } from '@/features/home/hero-section';
import { ProofSection } from '@/features/home/proof-section';
import { QuoteBandSection } from '@/features/home/quote-band-section';
import { ServicesSection } from '@/features/home/services-section';
import { StorySection } from '@/features/home/story-section';
import { TestimonialsSection } from '@/features/home/testimonials-section';
import { VisitSection } from '@/features/home/visit-section';
import { getHomeContent } from '@/services/content';
import { createMetadata, PAGE_KEYWORDS } from '@/lib/seo';
import { ROUTES } from '@/constants/navigation';
import { buildFaqSchema } from '@/lib/structured-data';

/**
 * L'accueil déclare sa propre canonique et son propre titre plutôt que
 * d'hériter de ceux de la mise en page : c'est la page la plus exposée aux
 * variantes d'URL (`?utm_source=`, `?fbclid=`, partages WhatsApp), et sans
 * canonique explicite chacune deviendrait une page distincte pour Google.
 */
export const metadata = createMetadata({
  title: 'Bijouterie à Cotonou — or, diamant, alliances',
  description:
    'Bijoutier joaillier à Cotonou : or 14 à 24 carats, diamants, alliances gravées à la main, sur mesure. Rachat d’or au cours du jour, pesée devant vous.',
  path: ROUTES.home,
  keywords: PAGE_KEYWORDS.home,
});

/**
 * Accueil — écran 1a de la direction artistique, dans l'ordre exact de la
 * planche : hero, preuve sociale, collections, savoir-faire, respiration,
 * galerie, histoire, services, témoignages, questions, visite.
 *
 * Le contenu vient de Supabase ; à défaut, des valeurs de la maquette.
 */
export default async function HomePage() {
  const { settings, collections, services, testimonials, faq, gallery } = await getHomeContent();

  return (
    <>
      <JsonLd id="schema-faq" data={buildFaqSchema(faq)} />

      <HeroSection hero={settings.hero} visuals={settings.visuals} />
      <ProofSection stats={settings.stats.items} testimonial={testimonials.hero} />
      <CollectionsSection collections={collections} />
      <BuybackSection contact={settings.contact} visuals={settings.visuals} />
      <CraftSection />
      <QuoteBandSection visuals={settings.visuals} />
      <GallerySection gallery={gallery} />
      <StorySection about={settings.about} />
      <ServicesSection services={services} />
      <TestimonialsSection featured={testimonials.featured} cards={testimonials.cards} visuals={settings.visuals} />
      <FaqSection entries={faq} />
      <VisitSection contact={settings.contact} hours={settings.hours} visuals={settings.visuals} />
      <SiteFooter contact={settings.contact} collections={collections} />
    </>
  );
}
