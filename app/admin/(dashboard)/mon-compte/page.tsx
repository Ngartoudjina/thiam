import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/admin/ui/primitives';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { PasswordForm, ProfileForm, SessionsPanel } from '@/features/admin/my-account-forms';
import { getCurrentStaff } from '@/lib/auth';

export default async function MyAccountPage() {
  const staff = await getCurrentStaff();
  if (!staff) redirect(ADMIN_ROUTES.login);

  return (
    <>
      <PageHeader title="Mon compte" description="Votre nom, votre mot de passe et vos sessions." />
      <div className="flex flex-col gap-5">
        <ProfileForm fullName={staff.fullName} email={staff.email} />
        <PasswordForm />
        <SessionsPanel />
      </div>
    </>
  );
}
