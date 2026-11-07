'use client';

import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EntityManager } from '@/components/admin/entity-manager';
import { ImageUploader, type UploadedImage } from '@/components/admin/image-uploader';
import { AdminButton, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { SelectInput, TextInput } from '@/components/admin/ui/form-fields';
import { formatWeight } from '@/lib/format';
import { saveCatalogAction } from '@/services/admin/settings-actions';
import {
  deletePieceAction,
  reorderPiecesAction,
  savePieceAction,
} from '@/services/admin/piece-actions';
import { toggleStatusAction } from '@/services/admin/content-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type { PieceRow } from '@/types/database';

const STATUS = [
  { value: 'visible', label: 'En vitrine' },
  { value: 'hidden', label: 'Masquée' },
] as const;

const BADGE_TONES = [
  { value: 'gold', label: 'Or (clair)' },
  { value: 'dark', label: 'Sombre' },
] as const;

interface CollectionOption {
  readonly id: string;
  readonly name: string;
}

/** « 3.2 » → « 3,2 » : la saisie reprend la virgule française. */
const weightInput = (grams: number | null): string =>
  grams === null ? '' : String(grams).replace('.', ',');

export function PiecesManager({
  pieces,
  collections,
}: {
  readonly pieces: readonly PieceRow[];
  readonly collections: readonly CollectionOption[];
}) {
  const nameById = new Map(collections.map((collection) => [collection.id, collection.name]));

  return (
    <EntityManager
      items={pieces}
      addLabel="Ajouter une pièce"
      emptyTitle="Aucune pièce en vitrine"
      emptyDescription="Les pièces ajoutées ici composent la grille de la page Collections. Tant qu’il n’y en a aucune, la sélection de la maquette reste affichée."
      deleteTitle="Retirer cette pièce ?"
      deleteDescription="Elle disparaîtra de la vitrine et sa photo sera supprimée du stockage. Cette action est définitive."
      onReorder={reorderPiecesAction}
      onDelete={deletePieceAction}
      onToggleStatus={(id, status) => toggleStatusAction('pieces', id, status)}
      renderSummary={(piece) => (
        <div className="flex items-center gap-3">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-panel-sunken dark:bg-panel-dark-sunken">
            {piece.storage_path ? (
              <Image src={piece.storage_path} alt="" fill sizes="44px" className="object-cover" />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
              {piece.name}
            </span>
            <span className="mt-0.5 block truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
              {[
                piece.collection_id ? nameById.get(piece.collection_id) : 'Sans univers',
                formatWeight(piece.weight_grams),
                piece.detail,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
        </div>
      )}
      renderForm={(piece, close) => (
        <PieceForm piece={piece} collections={collections} onDone={close} />
      )}
    />
  );
}

function PieceForm({
  piece,
  collections,
  onDone,
}: {
  readonly piece: PieceRow | null;
  readonly collections: readonly CollectionOption[];
  readonly onDone: () => void;
}) {
  const [image, setImage] = useState<UploadedImage | null>(
    piece?.storage_path
      ? { storagePath: piece.storage_path, width: piece.image_width, height: piece.image_height }
      : null,
  );
  const [alt, setAlt] = useState(piece?.image_alt ?? '');
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    savePieceAction,
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

  const handleImage = (next: UploadedImage | null, name: string): void => {
    setImage(next);
    if (next && alt.trim().length === 0) setAlt(`${name || 'Pièce'} — Bijouterie THIAM 24 Carats`);
  };

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <h2 className="font-sans text-base font-semibold text-panel-ink dark:text-panel-dark-ink">
        {piece ? 'Modifier la pièce' : 'Nouvelle pièce'}
      </h2>

      {piece ? <input type="hidden" name="id" value={piece.id} /> : null}
      <input type="hidden" name="storagePath" value={image?.storagePath ?? ''} />
      <input type="hidden" name="width" value={image?.width ?? 0} />
      <input type="hidden" name="height" value={image?.height ?? 0} />

      <div className="grid gap-5 sm:grid-cols-[14rem_1fr] sm:items-start">
        <ImageUploader
          folder="pieces"
          scope={piece?.name ?? 'vitrine'}
          value={image}
          onChange={(next) => handleImage(next, piece?.name ?? '')}
          label="Photo"
          aspect="portrait"
          hint="Format vertical. Sans photo, la carte affiche un cadre sobre."
        />

        <div className="flex flex-col gap-4">
          <TextInput
            id="piece-name"
            name="name"
            label="Nom de la pièce"
            required
            hint="Par exemple : Solitaire Aube."
            defaultValue={piece?.name ?? ''}
            error={errors?.name?.[0]}
          />

          <TextInput
            id="piece-alt"
            name="imageAlt"
            label="Texte alternatif de la photo"
            required={Boolean(image)}
            hint="Décrit la photo pour les lecteurs d’écran."
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            error={errors?.imageAlt?.[0]}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="piece-detail"
          name="detail"
          label="Matière et pierres"
          hint="Grand écran. Par exemple : Or rose 18K · diamant 0,32 ct."
          defaultValue={piece?.detail ?? ''}
          error={errors?.detail?.[0]}
        />
        <TextInput
          id="piece-detail-short"
          name="detailShort"
          label="Version courte (mobile)"
          hint="Facultative. Par exemple : Or rose 18K · 0,32 ct."
          defaultValue={piece?.detail_short ?? ''}
          error={errors?.detailShort?.[0]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput
          id="piece-weight"
          name="weight"
          label="Poids (grammes)"
          inputMode="decimal"
          hint="Poids réel, pesé en boutique. Vide pour ne pas l’afficher."
          defaultValue={weightInput(piece?.weight_grams ?? null)}
          error={errors?.weight?.[0]}
        />
        <SelectInput
          id="piece-collection"
          name="collectionId"
          label="Univers"
          options={[
            { value: '', label: 'Aucun' },
            ...collections.map((collection) => ({ value: collection.id, label: collection.name })),
          ]}
          defaultValue={piece?.collection_id ?? ''}
          error={errors?.collectionId?.[0]}
        />
        <SelectInput
          id="piece-status"
          name="status"
          label="Statut"
          options={[...STATUS]}
          defaultValue={piece?.status ?? 'visible'}
          error={errors?.status?.[0]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="piece-badge"
          name="badgeLabel"
          label="Pastille"
          hint="Facultative. Par exemple : Nouveau, Dernière pièce, Gravure offerte."
          defaultValue={piece?.badge_label ?? ''}
          error={errors?.badgeLabel?.[0]}
        />
        <SelectInput
          id="piece-badge-tone"
          name="badgeTone"
          label="Couleur de la pastille"
          options={[...BADGE_TONES]}
          defaultValue={piece?.badge_tone ?? 'gold'}
          error={errors?.badgeTone?.[0]}
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

/** Nombre de pièces annoncé en tête du catalogue public. */
export function CatalogTotalForm({ totalInStore }: { readonly totalInStore: number }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveCatalogAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else if (!state.fieldErrors) toast.error(state.message);
  }, [state]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Panel className="mb-5">
      <PanelHeader
        title="Pièces en boutique"
        description="Le nombre annoncé sur la page Collections : « Les 297 pièces disponibles aujourd’hui en boutique »."
      />
      <form action={formAction} className="flex flex-wrap items-end gap-3 p-5" noValidate>
        <TextInput
          id="catalog-total"
          name="totalInStore"
          label="Nombre de pièces"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={totalInStore}
          error={errors?.totalInStore?.[0]}
          wrapperClassName="w-44"
        />
        <AdminButton type="submit" variant="secondary" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Mettre à jour'}
        </AdminButton>
      </form>
    </Panel>
  );
}
