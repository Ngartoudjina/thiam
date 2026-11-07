import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/admin/ui/primitives';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { AccountsManager } from '@/features/admin/accounts-manager';
import { getCurrentStaff } from '@/lib/auth';
import { listUsers } from '@/services/admin/queries';

export default async function AdminAccountsPage() {
  const staff = await getCurrentStaff();
  if (staff?.role !== 'admin') redirect(ADMIN_ROUTES.dashboard);

  const users = await listUsers();

  return (
    <>
      <PageHeader
        title="Comptes"
        description="Les personnes autorisées à modifier le site. Un éditeur gère le contenu ; un administrateur gère aussi les comptes."
      />
      <AccountsManager users={users} currentUserId={staff.id} />
    </>
  );
}
