import { PageHeader } from '@/components/admin/ui/primitives';
import { CatalogTotalForm, PiecesManager } from '@/features/admin/pieces-manager';
import { listCollectionOptions, listPieces } from '@/services/admin/queries';
import { getSiteSettings } from '@/services/content';

export default async function AdminPiecesPage() {
  const [pieces, collections, settings] = await Promise.all([
    listPieces(),
    listCollectionOptions(),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Pièces en vitrine"
        description="La grille de la page Collections : photo, matière, poids réel et univers de chaque pièce. Glissez pour changer l’ordre."
      />
      <CatalogTotalForm totalInStore={settings.catalog.totalInStore} />
      <PiecesManager pieces={pieces} collections={collections} />
    </>
  );
}
