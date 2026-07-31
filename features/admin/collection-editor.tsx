'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ImageUploader, type UploadedImage } from '@/components/admin/image-uploader';
import { SortableList } from '@/components/admin/sortable-list';
import { CollectionImageRow } from '@/features/admin/collection-image-row';
import { AdminButton, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { SelectInput, TextArea, TextInput } from '@/components/admin/ui/form-fields';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import {
  addCollectionImageAction,
  reorderCollectionImagesAction,
  saveCollectionAction,
} from '@/services/admin/collection-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type { CollectionWithImages } from '@/services/admin/queries';

const STATUS = [
  { value: 'visible', label: 'Visible sur le site' },
  { value: 'hidden', label: 'Masquée' },
] as const;

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* -------------------------------------------------------------------------- */
/*  Fiche de la collection                                                     */
/* -------------------------------------------------------------------------- */

export function CollectionForm({
  collection,
}: {
  readonly collection: CollectionWithImages | null;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(collection?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(collection));
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(saveCollectionAction, null);

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      toast.success(state.message);
      if (!collection && state.data?.id) {
        router.replace(`${ADMIN_ROUTES.collections}/${state.data.id}`);
      } else {
        router.refresh();
      }
    } else if (!state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state, collection, router]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Panel>
      <PanelHeader
        title="Fiche de la collection"
        description="Le nom et l’accroche s’affichent sur la carte de l’accueil ; l’identifiant sert au lien de filtre."
      />

      <form action={formAction} className="flex flex-col gap-5 p-5" noValidate>
        {collection ? <input type="hidden" name="id" value={collection.id} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="name"
            name="name"
            label="Nom"
            required
            defaultValue={collection?.name ?? ''}
            onChange={(event) => {
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            error={errors?.name?.[0]}
          />
          <TextInput
            id="slug"
            name="slug"
            label="Identifiant d’URL"
            required
            hint="Minuscules et tirets. Apparaît dans /collections?univers=…"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            error={errors?.slug?.[0]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="tagline"
            name="tagline"
            label="Accroche"
            hint="Par exemple : 42 pièces en vitrine, Gravure offerte."
            defaultValue={collection?.tagline ?? ''}
            error={errors?.tagline?.[0]}
          />
          <TextInput
            id="category"
            name="category"
            label="Catégorie"
            required
            hint="Sert au classement interne : bijoux, montres, mariage…"
            defaultValue={collection?.category ?? 'bijoux'}
            error={errors?.category?.[0]}
          />
        </div>

        <TextArea
          id="description"
          name="description"
          label="Description"
          rows={3}
          hint="Affichée sur les deux grandes cartes de l’accueil uniquement."
          defaultValue={collection?.description ?? ''}
          error={errors?.description?.[0]}
        />

        <SelectInput
          id="status"
          name="status"
          label="Statut"
          options={[...STATUS]}
          defaultValue={collection?.status ?? 'visible'}
          error={errors?.status?.[0]}
          wrapperClassName="sm:max-w-xs"
        />

        <div className="flex justify-end gap-2 border-t border-panel-border pt-4 dark:border-panel-dark-border">
          <AdminButton asChild variant="secondary" disabled={pending}>
            <a href={ADMIN_ROUTES.collections}>Retour</a>
          </AdminButton>
          <AdminButton type="submit" variant="primary" disabled={pending}>
            {pending ? 'Enregistrement…' : collection ? 'Enregistrer' : 'Créer la collection'}
          </AdminButton>
        </div>
      </form>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Photos de la collection                                                    */
/* -------------------------------------------------------------------------- */

export function CollectionImages({ collection }: { readonly collection: CollectionWithImages }) {
  const router = useRouter();
  const [pendingUpload, setPendingUpload] = useState<UploadedImage | null>(null);
  const [alt, setAlt] = useState('');
  const [altError, setAltError] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  /**
   * Le texte alternatif est pré-rempli au dépôt de la photo.
   *
   * Il reste obligatoire — les lecteurs d'écran en dépendent — mais l'exiger
   * avant tout enregistrement bloquait le parcours : on déposait une photo, on
   * cliquait, et seul un message fugace en bas d'écran signalait le refus.
   * Une valeur de départ correcte permet d'enregistrer immédiatement, quitte à
   * l'affiner ensuite.
   */
  const handleUpload = (image: UploadedImage | null): void => {
    setPendingUpload(image);
    setAltError(undefined);
    if (image && alt.trim().length === 0) {
      setAlt(`${collection.name} — Bijouterie THIAM 24 Carats`);
    }
  };

  const attach = async (): Promise<void> => {
    if (!pendingUpload) return;

    if (alt.trim().length < 3) {
      setAltError('Décrivez la photo en quelques mots : ce texte est lu par les lecteurs d’écran.');
      return;
    }

    setAltError(undefined);
    setSaving(true);
    const result = await addCollectionImageAction({
      collectionId: collection.id,
      storagePath: pendingUpload.storagePath,
      alt: alt.trim(),
      width: pendingUpload.width,
      height: pendingUpload.height,
    });
    setSaving(false);

    if (result.ok) {
      toast.success(result.message);
      setPendingUpload(null);
      setAlt('');
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Photos"
        description="La première photo, ou celle marquée d’une étoile, sert d’image principale sur le site."
      />

      <div className="flex flex-col gap-5 p-5">
        <div className="grid gap-4 sm:grid-cols-[16rem_1fr] sm:items-start">
          <ImageUploader
            folder="collections"
            scope={collection.slug}
            value={pendingUpload}
            onChange={handleUpload}
            label="Nouvelle photo"
            aspect="portrait"
          />

          <div className="flex flex-col gap-3">
            <TextInput
              id="new-image-alt"
              label="Texte alternatif"
              required
              hint="Décrivez la pièce : « Bague solitaire en or rose sertie d’un diamant »."
              value={alt}
              error={altError}
              onChange={(event) => {
                setAlt(event.target.value);
                if (altError) setAltError(undefined);
              }}
            />

            {pendingUpload ? (
              <p className="text-xs text-panel-soft dark:text-panel-dark-soft">
                Photo envoyée. Elle ne sera visible sur le site qu’après l’ajout à la collection.
              </p>
            ) : null}

            <AdminButton
              variant="primary"
              onClick={() => void attach()}
              disabled={!pendingUpload || saving}
              className="self-start"
            >
              {saving ? 'Ajout…' : 'Ajouter à la collection'}
            </AdminButton>
          </div>
        </div>

        {collection.images.length > 0 ? (
          <SortableList
            items={collection.images}
            onReorder={reorderCollectionImagesAction}
            renderItem={(image) => (
              <CollectionImageRow
                image={image}
                collectionId={collection.id}
                collectionSlug={collection.slug}
              />
            )}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-panel-border px-4 py-8 text-center text-[0.8125rem] text-panel-soft dark:border-panel-dark-border dark:text-panel-dark-soft">
            Aucune photo pour l’instant. La carte affichera un cadre sobre en attendant.
          </p>
        )}
      </div>
    </Panel>
  );
}
