import { PageHeader } from '@/components/admin/ui/primitives';
import { SubscribersList } from '@/features/admin/subscribers-list';
import { listSubscribers } from '@/services/admin/queries';

export default async function AdminSubscribersPage() {
  const subscribers = await listSubscribers();

  return (
    <>
      <PageHeader
        title="Abonnés"
        description="Les personnes inscrites à la lettre de la maison depuis le site."
      />
      <SubscribersList subscribers={subscribers} />
    </>
  );
}
