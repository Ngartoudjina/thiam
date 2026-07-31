import { PageHeader } from '@/components/admin/ui/primitives';
import { ServicesManager } from '@/features/admin/services-manager';
import { listServices } from '@/services/admin/queries';

export default async function AdminServicesPage() {
  const services = await listServices();

  return (
    <>
      <PageHeader
        title="Services"
        description="Les prestations après-vente affichées sur l’accueil, avec leur tarif indicatif."
      />
      <ServicesManager services={services} />
    </>
  );
}
