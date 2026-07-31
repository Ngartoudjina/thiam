import { PageHeader } from '@/components/admin/ui/primitives';
import { AboutForm } from '@/features/admin/settings-forms';
import { getSiteSettings } from '@/services/content';

export default async function AdminAboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="Histoire"
        description="Le récit de la maison, sa chronologie et la citation du fondateur."
      />
      <AboutForm about={settings.about} />
    </>
  );
}
