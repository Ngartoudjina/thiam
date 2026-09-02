import { Suspense } from 'react';
import Link from 'next/link';
import { JsonLd } from '@/components/common/json-ld';
import { CompactFooter } from '@/components/layout/compact-footer';
import { Reveal } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { BespokeBanner } from '@/features/collections/bespoke-banner';
import { CollectionsCatalog } from '@/features/collections/collections-catalog';
import { DowrySection } from '@/features/collections/dowry-section';
import { ROUTES } from '@/constants/navigation';
import { TOTAL_PIECES } from '@/constants/collections';
import { getCollections, getSiteSettings } from '@/services/content';
import type { CollectionFilter } from '@/types';
import { createMetadata } from '@/lib/seo';
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '@/lib/structured-data';

export const metadata = createMetadata({
  title: 'Collections — ce qui est en vitrine',
  description:
    'Solitaires, alliances, parures en or 18, 21 et 24 carats, argent, montres et créations sur mesure. Poids réels vérifiés à la balance certifiée, prix au cours du jour.',
  path: ROUTES.collections,
  keywords: ['parure or Cotonou', 'solitaire diamant Bénin', 'coffret de dot', 'alliances or 18K'],
});

/** Écran 1e de la maquette — le catalogue de la vitrine. */
export default async function CollectionsPage() {
  const [collections, settings] = await Promise.all([getCollections(), getSiteSettings()]);

  // Les filtres suivent les univers publiés depuis le tableau de bord.
  const filters: readonly CollectionFilter[] = [
    { slug: 'tout', label: 'Tout', count: TOTAL_PIECES },
    ...collections.map((collection) => ({ slug: collection.slug, label: collection.name })),
  ];

  return (
    <>
      <JsonLd id="schema-collections" data={buildCollectionPageSchema()} />
      <JsonLd
        id="schema-fil-ariane"
        data={buildBreadcrumbSchema([
          { name: 'Accueil', path: ROUTES.home },
          { name: 'Collections', path: ROUTES.collections },
        ])}
      />

      {/* Compense la hauteur de la barre fixe (60 px en mobile, 104 en desktop). */}
      <section
        aria-labelledby="collections-titre"
        className="bg-ivory gutter pt-[8.75rem] lg:pt-[12.5rem]"
      >
        <div className="mb-10 flex flex-col gap-6 lg:mb-14.5 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          <div>
            <nav aria-label="Fil d’Ariane" className="mb-5 flex items-center gap-3 lg:mb-6.5">
              <Link
                href={ROUTES.home}
                className="text-label-lg tracking-(--tracking-nav) text-clay uppercase transition-colors duration-(--duration-state) ease-out hover:text-gold-ink"
              >
                Accueil
              </Link>
              <span aria-hidden="true" className="text-fog">
                /
              </span>
              <span
                aria-current="page"
                className="text-label-lg tracking-(--tracking-nav) text-gold-ink uppercase"
              >
                Collections
              </span>
            </nav>

            <TextLines
              as="h1"
              id="collections-titre"
              lines={[
                'Ce qui est',
                <>
                  en <em className="font-light">vitrine</em>
                </>,
              ]}
              className="font-serif text-page leading-[0.96] font-light tracking-(--tracking-display-tight) text-ink"
            />
          </div>

          <Reveal variant="up-sm" as="p" className="lg:mb-4 lg:max-w-[22.5rem]">
            <span className="block text-body leading-[1.75] font-normal text-clay">
              Les {TOTAL_PIECES} pièces disponibles aujourd’hui en boutique. Les poids sont réels et
              vérifiés à la balance certifiée ; le prix suit le cours du jour de l’or.
            </span>
          </Reveal>
        </div>

        <Suspense fallback={<CatalogFallback />}>
          <CollectionsCatalog filters={filters} />
        </Suspense>
      </section>

      <BespokeBanner />
      <DowrySection visuals={settings.visuals} />
      <CompactFooter variant="hours" contact={settings.contact} hours={settings.hours} />
    </>
  );
}

/** Squelette affiché le temps que les paramètres d'URL soient lus. */
function CatalogFallback() {
  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-6.5 lg:grid-cols-3 lg:gap-x-7.5 lg:gap-y-8">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="mb-3.5 h-[13.5rem] bg-sand sm:h-[18rem] lg:mb-5.5 lg:h-[28.75rem]" />
          <div className="h-4 w-2/3 bg-sand" />
        </div>
      ))}
    </div>
  );
}
