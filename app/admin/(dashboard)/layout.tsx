import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { getCurrentStaff } from '@/lib/auth';
import { signOutAction } from '@/services/admin/auth-actions';
import { countNewContactRequests } from '@/services/admin/queries';

/**
 * Garde du tableau de bord.
 *
 * Le middleware n'a vérifié que la présence d'un cookie ; ici, le jeton est
 * confronté à la base. Une session inconnue, expirée ou révoquée renvoie vers
 * la connexion.
 */
export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  const staff = await getCurrentStaff();
  if (!staff) redirect(ADMIN_ROUTES.login);

  const pendingRequests = await countNewContactRequests().catch(() => 0);

  return (
    <AdminShell
      staff={{ fullName: staff.fullName, email: staff.email, role: staff.role }}
      signOut={signOutAction}
      pendingRequests={pendingRequests}
    >
      {children}
    </AdminShell>
  );
}
