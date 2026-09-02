import Link from 'next/link';
import { SectionHeading } from '@/components/common/section-heading';
import { Section } from '@/components/common/section';
import { RevealGroup } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { ArrowLink } from '@/components/common/arrow-link';
import { ArrowRightIcon } from '@/components/common/icons';
import { CollectionCard } from '@/features/home/components/collection-card';
import type { Collection } from '@/types';
import { ROUTES, SECTIONS } from '@/constants/navigation';

/** « Six univers, une même exigence » — mosaïque des collections. */
interface CollectionsSectionProps {
  readonly collections: readonly Collection[];
}

export function CollectionsSection({ collections }: CollectionsSectionProps) {
  // Le premier univers occupe la grande carte, le deuxième la carte haute :
  // changer l'ordre dans le tableau de bord suffit à changer la mise en avant.
  const [feature, second, ...secondary] = collections;
  // Deux univers seulement sont mis en avant sur la version mobile.
  const mobileTiles = collections.filter((collection) =>
    ['or', 'sur-mesure'].includes(collection.slug),
  );

  return (
    <Section id={SECTIONS.collections} theme="light" labelledBy="collections-titre">
      <SectionHeading
        id="collections-titre"
        eyebrow="Nos collections"
        lines={[
          'Six univers,',
          <>
            une même <em className="font-light">exigence</em>
          </>,
        ]}
        description="Chaque pièce est choisie, pesée et contrôlée avant d'entrer en vitrine. Ce que vous voyez est disponible en boutique — ou reproductible sur mesure."
        className="mb-12 lg:mb-19"
        action={
          // Le mariage est le premier motif de visite : il mérite un lien
          // direct depuis l'accueil, pas seulement une carte parmi six.
          <ArrowLink href={ROUTES.wedding}>Alliances &amp; bijoux de mariage</ArrowLink>
        }
      />

      {/* Mobile : deux cartes pleines, puis deux tuiles jumelles. */}
      <RevealGroup className="flex flex-col gap-4 lg:hidden">
        {feature ? <CollectionCard collection={feature} format="mobile" /> : null}
        {second ? <CollectionCard collection={second} format="mobile" /> : null}

        <div className="grid grid-cols-2 gap-4">
          {mobileTiles.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} format="mobileTile" />
          ))}
        </div>

        <Button asChild variant="outlineDark" size="lg" block className="mt-1 min-h-14">
          <Link href={ROUTES.collections}>
            Voir les 6 collections
            <ArrowRightIcon size={16} />
          </Link>
        </Button>
      </RevealGroup>

      {/* Desktop : grille 2fr / 1fr puis rangée de quatre tuiles. */}
      <div className="hidden lg:block">
        <RevealGroup className="mb-6.5 grid grid-cols-[2fr_1fr] gap-6.5">
          {feature ? (
            <CollectionCard
              collection={feature}
              format="feature"
              showDescription
              linkLabel="Découvrir la collection"
            />
          ) : null}
          {second ? (
            <CollectionCard
              collection={second}
              format="card"
              showDescription
              linkLabel="Découvrir"
            />
          ) : null}
        </RevealGroup>

        <RevealGroup className="grid grid-cols-4 gap-6.5">
          {secondary.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} format="tile" />
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
