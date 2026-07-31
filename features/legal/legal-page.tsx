import { CompactFooter } from '@/components/layout/compact-footer';
import { Eyebrow } from '@/components/common/eyebrow';
import { TextLines } from '@/components/motion/text-lines';

export interface LegalBlock {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

interface LegalPageProps {
  readonly eyebrow: string;
  readonly titleLines: readonly string[];
  readonly intro: string;
  readonly blocks: readonly LegalBlock[];
  readonly updatedAt: string;
}

/**
 * Gabarit des pages légales : même grille éditoriale que le reste du site,
 * pour que les mentions obligatoires n'aient pas l'air d'une pièce rapportée.
 */
export function LegalPage({ eyebrow, titleLines, intro, blocks, updatedAt }: LegalPageProps) {
  return (
    <>
      <article className="bg-ivory gutter pt-[8.75rem] pb-16 lg:pt-[12.5rem] lg:pb-24">
        <div className="max-w-[48rem]">
          <Eyebrow className="mb-6 lg:mb-7">{eyebrow}</Eyebrow>

          <TextLines
            as="h1"
            lines={[...titleLines]}
            className="mb-6 font-serif text-section leading-[1.02] font-light tracking-(--tracking-display) text-ink lg:mb-8"
          />

          <p className="mb-12 text-body leading-[1.8] font-light text-stone lg:mb-16">{intro}</p>

          <div className="flex flex-col">
            {blocks.map((block) => (
              <section key={block.heading} className="border-t border-rule-light py-8 lg:py-10">
                <h2 className="mb-4 font-serif text-milestone font-normal text-ink">
                  {block.heading}
                </h2>
                {block.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="mb-3 text-body-sm leading-[1.8] font-light text-clay last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <p className="mt-10 border-t border-rule-light pt-8 text-caption-lg font-light text-clay">
            Dernière mise à jour : {updatedAt}
          </p>
        </div>
      </article>

      <CompactFooter variant="copyright" />
    </>
  );
}
