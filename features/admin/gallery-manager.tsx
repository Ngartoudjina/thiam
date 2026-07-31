'use client';

import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EntityManager } from '@/components/admin/entity-manager';
import { ImageUploader, type UploadedImage } from '@/components/admin/image-uploader';
import { AdminButton } from '@/components/admin/ui/primitives';
import { SelectInput, TextInput } from '@/components/admin/ui/form-fields';
import {
  deleteGalleryImageAction,
  reorderGalleryAction,
  saveGalleryImageAction,
  toggleStatusAction,
} from '@/services/admin/content-actions';
import { publicStorageUrl } from '@/lib/supabase/env';
import type { ActionResult } from '@/services/admin/action-result';
import type { GalleryImageRow } from '@/types/database';

const STATUS = [
  { value: 'visible', label: 'Visible sur le site' },
  { value: 'hidden', label: 'Masquée' },
] as const;

const COL_SPANS = [
  { value: '1', label: 'Une colonne' },
  { value: '2', label: 'Deux colonnes (large)' },
] as const;

const ROW_SPANS = [
  { value: '2', label: 'Deux lignes (standard)' },
  { value: '3', label: 'Trois lignes (haute)' },
] as const;

export function GalleryManager({ images }: { readonly images: readonly GalleryImageRow[] }) {
  return (
    <EntityManager
      items={images}
      addLabel="Ajouter une photo"
      emptyTitle="Aucune photo"
      emptyDescription="La mosaïque « Entrer, un instant, dans la vitrine » se compose des photos ajoutées ici."
      deleteTitle="Supprimer cette photo ?"
      deleteDescription="Le fichier sera aussi retiré du stockage. Cette action est définitive."
      onReorder={reorderGalleryAction}
      onDelete={deleteGalleryImageAction}
      onToggleStatus={(id, status) => toggleStatusAction('gallery_images', id, status)}
      renderSummary={(image) => (
        <div className="flex items-center gap-3">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-panel-sunken dark:bg-panel-dark-sunken">
            <Image
              src={publicStorageUrl(image.storage_path)}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
              {image.caption || image.alt}
            </span>
            <span className="mt-0.5 block truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
              {image.col_span} × {image.row_span} · {image.width} × {image.height} px
            </span>
          </span>
        </div>
      )}
      renderForm={(image, close) => <GalleryForm image={image} onDone={close} />}
    />
  );
}

function GalleryForm({
  image,
  onDone,
}: {
  readonly image: GalleryImageRow | null;
  readonly onDone: () => void;
}) {
  const [upload, setUpload] = useState<UploadedImage | null>(
    image ? { storagePath: image.storage_path, width: image.width, height: image.height } : null,
  );
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveGalleryImageAction,
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
        {image ? 'Modifier la photo' : 'Nouvelle photo'}
      </h2>

      {image ? <input type="hidden" name="id" value={image.id} /> : null}
      {image ? <input type="hidden" name="previousStoragePath" value={image.storage_path} /> : null}
      <input type="hidden" name="storagePath" value={upload?.storagePath ?? ''} />
      <input type="hidden" name="width" value={upload?.width ?? 0} />
      <input type="hidden" name="height" value={upload?.height ?? 0} />

      <ImageUploader
        folder="gallery"
        scope="vitrine"
        value={upload}
        onChange={setUpload}
        label="Photo"
        aspect="landscape"
        className="sm:max-w-md"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="alt"
          name="alt"
          label="Texte alternatif"
          required
          hint="Décrit la photo pour les lecteurs d’écran et les moteurs."
          defaultValue={image?.alt ?? ''}
          error={errors?.alt?.[0]}
        />
        <TextInput
          id="caption"
          name="caption"
          label="Légende au survol"
          hint="Facultative. Apparaît en verre dépoli au survol de la tuile."
          defaultValue={image?.caption ?? ''}
          error={errors?.caption?.[0]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectInput
          id="colSpan"
          name="colSpan"
          label="Largeur dans la mosaïque"
          options={[...COL_SPANS]}
          defaultValue={String(image?.col_span ?? 1)}
          error={errors?.colSpan?.[0]}
        />
        <SelectInput
          id="rowSpan"
          name="rowSpan"
          label="Hauteur dans la mosaïque"
          options={[...ROW_SPANS]}
          defaultValue={String(image?.row_span ?? 2)}
          error={errors?.rowSpan?.[0]}
        />
        <SelectInput
          id="status"
          name="status"
          label="Statut"
          options={[...STATUS]}
          defaultValue={image?.status ?? 'visible'}
          error={errors?.status?.[0]}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-panel-border pt-4 dark:border-panel-dark-border">
        <AdminButton variant="secondary" onClick={onDone} disabled={pending}>
          Annuler
        </AdminButton>
        <AdminButton type="submit" variant="primary" disabled={pending || !upload}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}
