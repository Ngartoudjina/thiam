import { PageHeader } from '@/components/admin/ui/primitives';
import { ContactForm, HoursForm } from '@/features/admin/settings-forms';
import { getSiteSettings } from '@/services/content';

export default async function AdminContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="Coordonnées"
        description="Téléphone, WhatsApp, adresse, réseaux et horaires. Ces valeurs sont reprises partout sur le site."
      />
      <div className="flex flex-col gap-5">
        <ContactForm contact={settings.contact} />
        <HoursForm hours={settings.hours} />
      </div>
    </>
  );
}
