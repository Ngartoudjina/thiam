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
import { buildFaqSchema } from '@/lib/structured-data';

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

      <HeroSection hero={settings.hero} />
      <ProofSection stats={settings.stats.items} testimonial={testimonials.hero} />
      <CollectionsSection collections={collections} />
      <BuybackSection contact={settings.contact} />
      <CraftSection />
      <QuoteBandSection />
      <GallerySection gallery={gallery} />
      <StorySection about={settings.about} />
      <ServicesSection services={services} />
      <TestimonialsSection featured={testimonials.featured} cards={testimonials.cards} />
      <FaqSection entries={faq} />
      <VisitSection contact={settings.contact} hours={settings.hours} />
      <SiteFooter contact={settings.contact} collections={collections} />
    </>
  );
}
