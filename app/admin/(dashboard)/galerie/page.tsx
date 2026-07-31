import { PageHeader } from '@/components/admin/ui/primitives';
import { GalleryManager } from '@/features/admin/gallery-manager';
import { listGalleryImages } from '@/services/admin/queries';

export default async function AdminGalleryPage() {
  const images = await listGalleryImages();

  return (
    <>
      <PageHeader
        title="Galerie"
        description="La mosaïque de la vitrine. L’ordre et l’empreinte de chaque tuile déterminent la composition."
      />
      <GalleryManager images={images} />
    </>
  );
}
