import { PageHeader } from '@/components/admin/ui/primitives';
import { VisualsManager } from '@/features/admin/visuals-manager';
import { getSiteSettings } from '@/services/content';

export default async function AdminVisualsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="Visuels"
        description="Les grandes photographies du site : hero, rachat d’or, bandeaux, portraits. Celles des collections et de la galerie se gèrent dans leurs rubriques."
      />
      <VisualsManager visuals={settings.visuals} />
    </>
  );
}
