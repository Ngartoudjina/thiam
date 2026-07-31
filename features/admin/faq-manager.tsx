'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { EntityManager } from '@/components/admin/entity-manager';
import { AdminButton } from '@/components/admin/ui/primitives';
import { SelectInput, TextArea, TextInput } from '@/components/admin/ui/form-fields';
import {
  deleteFaqAction,
  reorderFaqAction,
  saveFaqAction,
  toggleStatusAction,
} from '@/services/admin/content-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type { FaqRow } from '@/types/database';

const STATUS = [
  { value: 'visible', label: 'Visible sur le site' },
  { value: 'hidden', label: 'Masquée' },
] as const;

export function FaqManager({ entries }: { readonly entries: readonly FaqRow[] }) {
  return (
    <EntityManager
      items={entries}
      addLabel="Ajouter une question"
      emptyTitle="Aucune question"
      emptyDescription="Les questions alimentent la section « Ce que l’on nous demande souvent » et le balisage FAQ lu par Google."
      deleteTitle="Supprimer cette question ?"
      deleteDescription="Elle disparaîtra immédiatement du site. Cette action est définitive."
      onReorder={reorderFaqAction}
      onDelete={deleteFaqAction}
      onToggleStatus={(id, status) => toggleStatusAction('faq', id, status)}
      renderSummary={(entry) => (
        <>
          <p className="truncate font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
            {entry.question}
          </p>
          <p className="mt-0.5 truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
            {entry.answer}
          </p>
        </>
      )}
      renderForm={(entry, close) => <FaqForm entry={entry} onDone={close} />}
    />
  );
}

function FaqForm({
  entry,
  onDone,
}: {
  readonly entry: FaqRow | null;
  readonly onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveFaqAction,
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
        {entry ? 'Modifier la question' : 'Nouvelle question'}
      </h2>

      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}

      <TextInput
        id="question"
        name="question"
        label="Question"
        required
        defaultValue={entry?.question ?? ''}
        error={errors?.question?.[0]}
      />

      <TextArea
        id="answer"
        name="answer"
        label="Réponse"
        rows={5}
        required
        hint="Répondez comme en boutique : concrètement, sans jargon."
        defaultValue={entry?.answer ?? ''}
        error={errors?.answer?.[0]}
      />

      <SelectInput
        id="status"
        name="status"
        label="Statut"
        options={[...STATUS]}
        defaultValue={entry?.status ?? 'visible'}
        error={errors?.status?.[0]}
        wrapperClassName="sm:max-w-xs"
      />

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
