'use client';

import { Star } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EntityManager } from '@/components/admin/entity-manager';
import { AdminButton } from '@/components/admin/ui/primitives';
import { SelectInput, SwitchField, TextArea, TextInput } from '@/components/admin/ui/form-fields';
import {
  deleteTestimonialAction,
  reorderTestimonialsAction,
  saveTestimonialAction,
  toggleStatusAction,
} from '@/services/admin/content-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type { TestimonialRow } from '@/types/database';

const STATUS = [
  { value: 'visible', label: 'Visible sur le site' },
  { value: 'hidden', label: 'Masqué' },
] as const;

const RATINGS = [5, 4, 3, 2, 1].map((value) => ({
  value: String(value),
  label: `${value} étoile${value > 1 ? 's' : ''}`,
}));

export function TestimonialsManager({
  testimonials,
}: {
  readonly testimonials: readonly TestimonialRow[];
}) {
  return (
    <EntityManager
      items={testimonials}
      addLabel="Ajouter un avis"
      emptyTitle="Aucun témoignage"
      emptyDescription="Les avis alimentent le bandeau sous le hero et la section « Ce que l’on dit de nous, en ville »."
      deleteTitle="Supprimer ce témoignage ?"
      deleteDescription="Il disparaîtra immédiatement du site. Cette action est définitive."
      onReorder={reorderTestimonialsAction}
      onDelete={deleteTestimonialAction}
      onToggleStatus={(id, status) => toggleStatusAction('testimonials', id, status)}
      renderSummary={(testimonial) => (
        <>
          <p className="flex items-center gap-2 font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
            {testimonial.author}
            <span className="inline-flex items-center gap-0.5 text-accent" aria-hidden="true">
              {Array.from({ length: testimonial.rating }, (_, index) => (
                <Star key={index} size={11} fill="currentColor" strokeWidth={0} />
              ))}
            </span>
            {testimonial.is_featured ? (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.625rem] font-medium text-accent-strong dark:bg-accent/20 dark:text-accent-soft">
                Mis en avant
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
            « {testimonial.quote} »
          </p>
        </>
      )}
      renderForm={(testimonial, close) => (
        <TestimonialForm testimonial={testimonial} onDone={close} />
      )}
    />
  );
}

function TestimonialForm({
  testimonial,
  onDone,
}: {
  readonly testimonial: TestimonialRow | null;
  readonly onDone: () => void;
}) {
  const [featured, setFeatured] = useState(testimonial?.is_featured ?? false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveTestimonialAction,
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
        {testimonial ? 'Modifier le témoignage' : 'Nouveau témoignage'}
      </h2>

      {testimonial ? <input type="hidden" name="id" value={testimonial.id} /> : null}
      {featured ? <input type="hidden" name="isFeatured" value="on" /> : null}

      <TextArea
        id="quote"
        name="quote"
        label="Témoignage"
        rows={4}
        required
        hint="Sans les guillemets : ils sont ajoutés automatiquement à l’affichage."
        defaultValue={testimonial?.quote ?? ''}
        error={errors?.quote?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="author"
          name="author"
          label="Nom du client"
          required
          defaultValue={testimonial?.author ?? ''}
          error={errors?.author?.[0]}
        />
        <TextInput
          id="context"
          name="context"
          label="Contexte"
          hint="Par exemple : Mariée en 2025 · Cotonou."
          defaultValue={testimonial?.context ?? ''}
          error={errors?.context?.[0]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          id="rating"
          name="rating"
          label="Note"
          options={RATINGS}
          defaultValue={String(testimonial?.rating ?? 5)}
          error={errors?.rating?.[0]}
        />
        <SelectInput
          id="status"
          name="status"
          label="Statut"
          options={[...STATUS]}
          defaultValue={testimonial?.status ?? 'visible'}
          error={errors?.status?.[0]}
        />
      </div>

      <SwitchField
        id="featured"
        label="Mettre en avant"
        hint="Le témoignage mis en avant occupe le grand encart de la section. Un seul à la fois."
        checked={featured}
        onCheckedChange={setFeatured}
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
