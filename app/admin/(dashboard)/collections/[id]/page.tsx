import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/ui/primitives';
import { CollectionForm, CollectionImages } from '@/features/admin/collection-editor';
import { getCollection } from '@/services/admin/queries';

export default async function EditCollectionPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection) notFound();

  return (
    <>
      <PageHeader
        title={collection.name}
        description="Fiche et photos de l’univers, tels qu’ils apparaissent sur le site."
      />
      <div className="flex flex-col gap-5">
        <CollectionForm collection={collection} />
        <CollectionImages collection={collection} />
      </div>
    </>
  );
}
