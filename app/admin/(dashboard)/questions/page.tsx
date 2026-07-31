import { PageHeader } from '@/components/admin/ui/primitives';
import { FaqManager } from '@/features/admin/faq-manager';
import { listFaq } from '@/services/admin/queries';

export default async function AdminFaqPage() {
  const entries = await listFaq();

  return (
    <>
      <PageHeader
        title="Questions fréquentes"
        description="Elles alimentent la section « Ce que l’on nous demande souvent » et le balisage lu par Google."
      />
      <FaqManager entries={entries} />
    </>
  );
}
