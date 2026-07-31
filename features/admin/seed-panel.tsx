'use client';

import { Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AdminButton, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { seedContentAction } from '@/services/admin/seed-actions';

/**
 * Import du contenu de démarrage.
 *
 * Affiché tant que la base est vide : le propriétaire retrouve d'un clic tous
 * les textes de la maquette, puis les modifie au lieu de tout ressaisir.
 */
export function SeedPanel() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const seed = async (): Promise<void> => {
    setPending(true);
    const result = await seedContentAction();
    setPending(false);

    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Panel className="mb-6 border-accent/40">
      <PanelHeader
        title="Votre base est vide"
        description="Importez le contenu livré avec la maquette — collections, services, témoignages, questions et textes — puis modifiez-le à votre rythme."
        action={
          <AdminButton variant="primary" onClick={() => void seed()} disabled={pending}>
            <Download size={15} strokeWidth={1.8} aria-hidden="true" />
            {pending ? 'Import en cours…' : 'Importer le contenu'}
          </AdminButton>
        }
      />
      <p className="px-5 py-4 text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
        Les photographies de la maquette sont reprises telles quelles : la vitrine reste identique
        après l’import. Déposez les vôtres quand vous voulez, elles prendront leur place.
      </p>
    </Panel>
  );
}
