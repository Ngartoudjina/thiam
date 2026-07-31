import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { getCurrentStaff } from '@/lib/auth';
import { signOutAction } from '@/services/admin/auth-actions';

/**
 * Garde du tableau de bord.
 *
 * Le middleware refuse déjà l'accès sans session ; ce second contrôle vérifie
 * en plus l'existence d'un profil dans `public.users`. Un compte authentifié
 * mais non habilité est renvoyé vers la connexion.
 */
export default async function DashboardLayout({ children }: { readonly children: ReactNode }) {
  const staff = await getCurrentStaff();
  if (!staff) redirect(ADMIN_ROUTES.login);

  return (
    <AdminShell staff={staff} signOut={signOutAction}>
      {children}
    </AdminShell>
  );
}
