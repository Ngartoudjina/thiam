import { PageHeader } from '@/components/admin/ui/primitives';
import { CollectionForm } from '@/features/admin/collection-editor';

export default function NewCollectionPage() {
  return (
    <>
      <PageHeader
        title="Nouvelle collection"
        description="Créez d’abord la fiche : les photos s’ajoutent ensuite, sur la page d’édition."
      />
      <CollectionForm collection={null} />
    </>
  );
}
