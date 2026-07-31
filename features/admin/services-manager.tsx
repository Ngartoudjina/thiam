'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { EntityManager } from '@/components/admin/entity-manager';
import { AdminButton } from '@/components/admin/ui/primitives';
import { SelectInput, TextArea, TextInput } from '@/components/admin/ui/form-fields';
import {
  deleteServiceAction,
  reorderServicesAction,
  saveServiceAction,
  toggleStatusAction,
} from '@/services/admin/content-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type { ServiceRow } from '@/types/database';

const ICONS = [
  { value: 'repair', label: 'Réparation (outil)' },
  { value: 'polish', label: 'Polissage (éclat)' },
  { value: 'engrave', label: 'Gravure (burin)' },
  { value: 'bespoke', label: 'Sur mesure (gemme)' },
  { value: 'appraise', label: 'Expertise (loupe)' },
  { value: 'buyback', label: 'Rachat (monnaie)' },
  { value: 'advice', label: 'Conseil (message)' },
] as const;

const STATUS = [
  { value: 'visible', label: 'Visible sur le site' },
  { value: 'hidden', label: 'Masqué' },
] as const;

export function ServicesManager({ services }: { readonly services: readonly ServiceRow[] }) {
  return (
    <EntityManager
      items={services}
      addLabel="Ajouter un service"
      emptyTitle="Aucun service"
      emptyDescription="Les prestations après-vente apparaissent sur l’accueil, sous « Tout ce que l’on fait après la vente »."
      deleteTitle="Supprimer ce service ?"
      deleteDescription="Il disparaîtra immédiatement du site. Cette action est définitive."
      onReorder={reorderServicesAction}
      onDelete={deleteServiceAction}
      onToggleStatus={(id, status) => toggleStatusAction('services', id, status)}
      renderSummary={(service) => (
        <>
          <p className="truncate font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
            {service.title}
          </p>
          <p className="mt-0.5 truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
            {service.price || 'Tarif non précisé'} · {service.description || 'Sans description'}
          </p>
        </>
      )}
      renderForm={(service, close) => <ServiceForm service={service} onDone={close} />}
    />
  );
}

function ServiceForm({
  service,
  onDone,
}: {
  readonly service: ServiceRow | null;
  readonly onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveServiceAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onDone();
    } else if (!state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state, onDone]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <h2 className="font-sans text-base font-semibold text-panel-ink dark:text-panel-dark-ink">
        {service ? 'Modifier le service' : 'Nouveau service'}
      </h2>

      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="title"
          name="title"
          label="Intitulé"
          required
          defaultValue={service?.title ?? ''}
          error={errors?.title?.[0]}
        />
        <TextInput
          id="price"
          name="price"
          label="Tarif affiché"
          hint="Par exemple : Dès 5 000 F, Gratuit, Sur devis."
          defaultValue={service?.price ?? ''}
          error={errors?.price?.[0]}
        />
      </div>

      <TextArea
        id="description"
        name="description"
        label="Description"
        rows={3}
        defaultValue={service?.description ?? ''}
        error={errors?.description?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          id="icon"
          name="icon"
          label="Pictogramme"
          options={[...ICONS]}
          defaultValue={service?.icon ?? 'repair'}
          error={errors?.icon?.[0]}
        />
        <SelectInput
          id="status"
          name="status"
          label="Statut"
          options={[...STATUS]}
          defaultValue={service?.status ?? 'visible'}
          error={errors?.status?.[0]}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-panel-border pt-4 dark:border-panel-dark-border">
        <AdminButton variant="secondary" onClick={onDone} disabled={pending}>
          Annuler
        </AdminButton>
        <AdminButton type="submit" variant="primary" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}
