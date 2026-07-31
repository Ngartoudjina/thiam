import { ArrowLink } from '@/components/common/arrow-link';
import { Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { GalleryGrid } from '@/features/home/components/gallery-grid';
import { GALLERY_PHOTO_COUNT } from '@/constants/gallery';
import type { GalleryContent } from '@/services/content';
import { ROUTES, SECTIONS } from '@/constants/navigation';

/** « Entrer, un instant, dans la vitrine » — la mosaïque de la boutique. */
export function GallerySection({ gallery }: { readonly gallery: GalleryContent }) {
  return (
    <Section id={SECTIONS.gallery} theme="light" labelledBy="galerie-titre">
      <SectionHeading
        id="galerie-titre"
        eyebrow="Galerie"
        lines={[
          'Entrer, un instant,',
          <>
            dans la <em className="font-light">vitrine</em>
          </>,
        ]}
        action={
          <ArrowLink href={ROUTES.collections} className="mt-2 lg:mt-0 lg:mb-4">
            {`Voir les ${GALLERY_PHOTO_COUNT} photos`}
          </ArrowLink>
        }
        className="mb-10 lg:mb-17.5"
      />

      <GalleryGrid tiles={gallery.tiles} mobileTiles={gallery.mobileTiles} />
    </Section>
  );
}
