'use client';

import { Check, Pencil, Star, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ImageUploader, type UploadedImage } from '@/components/admin/image-uploader';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { AdminButton } from '@/components/admin/ui/primitives';
import { TextInput } from '@/components/admin/ui/form-fields';
import { publicStorageUrl } from '@/lib/supabase/env';
import {
  deleteCollectionImageAction,
  replaceCollectionImageAction,
  setPrimaryImageAction,
  updateCollectionImageAltAction,
} from '@/services/admin/collection-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type { CollectionImageRow as ImageRow } from '@/types/database';

/**
 * Ligne d'une photo de collection.
 *
 * Trois gestes possibles sans quitter la liste : remplacer le fichier, corriger
 * le texte alternatif, désigner l'image principale. Le remplacement manquait :
 * il fallait supprimer puis rajouter, ce qui faisait perdre la place dans
 * l'ordre et le statut d'image principale.
 */
export function CollectionImageRow({
  image,
  collectionId,
  collectionSlug,
}: {
  readonly image: ImageRow;
  readonly collectionId: string;
  readonly collectionSlug: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'replace' | 'alt'>('idle');
  const [alt, setAlt] = useState(image.alt);
  const [busy, setBusy] = useState(false);

  const run = async (action: Promise<ActionResult>): Promise<boolean> => {
    setBusy(true);
    const result = await action;
    setBusy(false);

    if (result.ok) {
      toast.success(result.message);
      setMode('idle');
      router.refresh();
      return true;
    }

    toast.error(result.message);
    return false;
  };

  const replace = async (upload: UploadedImage | null): Promise<void> => {
    if (!upload) return;
    await run(
      replaceCollectionImageAction({
        imageId: image.id,
        storagePath: upload.storagePath,
        width: upload.width,
        height: upload.height,
      }),
    );
  };

  if (mode === 'replace') {
    return (
      <div className="flex flex-col gap-3">
        <ImageUploader
          folder="collections"
          scope={collectionSlug}
          value={null}
          onChange={(upload) => void replace(upload)}
          label="Nouvelle version de la photo"
          aspect="portrait"
          className="max-w-64"
          hint="Dès l’envoi terminé, elle remplace l’actuelle en gardant sa place et son rang."
        />
        <AdminButton variant="secondary" size="sm" className="self-start" onClick={() => setMode('idle')}>
          Annuler
        </AdminButton>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-panel-sunken dark:bg-panel-dark-sunken">
          <Image
            src={publicStorageUrl(image.storage_path)}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        </span>

        {mode === 'alt' ? (
          <span className="flex min-w-0 flex-1 items-end gap-2">
            <TextInput
              id={`alt-${image.id}`}
              label="Texte alternatif"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              wrapperClassName="min-w-0 flex-1"
            />
            <AdminButton
              variant="primary"
              size="icon"
              aria-label="Enregistrer le texte alternatif"
              disabled={busy}
              onClick={() => void run(updateCollectionImageAltAction(image.id, alt))}
            >
              <Check size={15} strokeWidth={1.8} aria-hidden="true" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="icon"
              aria-label="Annuler"
              onClick={() => {
                setAlt(image.alt);
                setMode('idle');
              }}
            >
              <X size={15} strokeWidth={1.8} aria-hidden="true" />
            </AdminButton>
          </span>
        ) : (
          <span className="min-w-0">
            <span className="block truncate text-sm text-panel-ink dark:text-panel-dark-ink">
              {image.alt}
            </span>
            <span className="mt-0.5 block text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
              {image.width} × {image.height} px{image.is_primary ? ' · image principale' : ''}
            </span>
          </span>
        )}
      </div>

      {mode === 'idle' ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label="Définir comme image principale"
            disabled={image.is_primary || busy}
            onClick={() => void run(setPrimaryImageAction(collectionId, image.id))}
          >
            <Star
              size={15}
              strokeWidth={1.7}
              aria-hidden="true"
              {...(image.is_primary ? { fill: 'currentColor' } : {})}
              className={image.is_primary ? 'text-accent' : ''}
            />
          </AdminButton>

          <AdminButton
            variant="ghost"
            size="icon"
            aria-label="Remplacer la photo"
            onClick={() => setMode('replace')}
          >
            <Pencil size={15} strokeWidth={1.7} aria-hidden="true" />
          </AdminButton>

          <AdminButton
            variant="ghost"
            size="icon"
            aria-label="Modifier le texte alternatif"
            onClick={() => setMode('alt')}
          >
            <span aria-hidden="true" className="text-[0.6875rem] font-semibold">
              ALT
            </span>
          </AdminButton>

          <ConfirmDialog
            title="Supprimer cette photo ?"
            description="Le fichier sera aussi retiré du stockage. Cette action est définitive."
            onConfirm={() => run(deleteCollectionImageAction(image.id)).then(() => undefined)}
            trigger={
              <AdminButton variant="ghost" size="icon" aria-label="Supprimer la photo">
                <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
              </AdminButton>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
