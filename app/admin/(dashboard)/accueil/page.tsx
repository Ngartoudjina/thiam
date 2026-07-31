import { PageHeader } from '@/components/admin/ui/primitives';
import { HeroForm, StatsForm } from '@/features/admin/settings-forms';
import { getSiteSettings } from '@/services/content';

export default async function AdminHomeContentPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="Page d’accueil"
        description="Le bandeau principal et les chiffres clés, les deux premiers écrans que voit un visiteur."
      />
      <div className="flex flex-col gap-5">
        <HeroForm hero={settings.hero} />
        <StatsForm stats={settings.stats} />
      </div>
    </>
  );
}
