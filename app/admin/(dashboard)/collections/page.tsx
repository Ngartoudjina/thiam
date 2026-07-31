import { Plus } from 'lucide-react';
import Link from 'next/link';
import { AdminButton, PageHeader } from '@/components/admin/ui/primitives';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { CollectionsList } from '@/features/admin/collections-list';
import { listCollections } from '@/services/admin/queries';

export default async function AdminCollectionsPage() {
  const collections = await listCollections();

  return (
    <>
      <PageHeader
        title="Collections"
        description="Les univers de la vitrine. Faites glisser une ligne pour changer l’ordre d’affichage sur le site."
        action={
          <AdminButton asChild variant="primary">
            <Link href={`${ADMIN_ROUTES.collections}/nouvelle`}>
              <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
              Nouvelle collection
            </Link>
          </AdminButton>
        }
      />
      <CollectionsList collections={collections} />
    </>
  );
}
