'use client';

import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AdminButton } from '@/components/admin/ui/primitives';
import { refreshSiteAction } from '@/services/admin/seed-actions';

/** Republie toutes les pages — après un import fait hors du tableau de bord. */
export function RefreshSiteButton() {
  const [pending, setPending] = useState(false);

  const refresh = async (): Promise<void> => {
    setPending(true);
    const result = await refreshSiteAction();
    setPending(false);

    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <AdminButton variant="secondary" size="sm" disabled={pending} onClick={() => void refresh()}>
      <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
      {pending ? 'Actualisation…' : 'Actualiser le site'}
    </AdminButton>
  );
}
