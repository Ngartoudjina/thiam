'use client';

import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminButton, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { TextInput } from '@/components/admin/ui/form-fields';
import { ImageUploader, type UploadedImage } from '@/components/admin/image-uploader';
import { publicStorageUrl } from '@/lib/supabase/env';
import { VISUAL_SLOTS, type VisualsContent, type VisualSlotId } from '@/lib/schemas/content';
import { saveVisualsAction } from '@/services/admin/settings-actions';

const ASPECT: Record<string, 'portrait' | 'landscape' | 'square'> = {
  portrait: 'portrait',
  paysage: 'landscape',
  carre: 'square',
};

/**
 * Visuels de composition.
 *
 * Les grandes photographies qui ne relèvent ni d'une collection ni de la
 * galerie. Tant qu'un emplacement reste vide, la photographie livrée avec la
 * maquette tient la place : le site n'est jamais troué.
 */
export function VisualsManager({ visuals }: { readonly visuals: VisualsContent }) {
  const [state, action, pending] = useActionState(saveVisualsAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
  const [draft, setDraft] = useState<VisualsContent>(visuals);

  const update = (id: VisualSlotId, patch: Partial<VisualsContent[VisualSlotId]>): void =>
    setDraft((current) => ({ ...current, [id]: { ...current[id], ...patch } }));

  const onUpload = (id: VisualSlotId, image: UploadedImage | null): void => {
    if (!image) return;
    update(id, {
      path: image.storagePath,
      // Un texte alternatif de départ, que l'on peut affiner ensuite.
      alt: draft[id].alt || VISUAL_SLOTS.find((slot) => slot.id === id)?.label || '',
    });
  };

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="visuals" value={JSON.stringify(draft)} />
      <input
        type="hidden"
        name="previousPaths"
        value={JSON.stringify(
          Object.fromEntries(Object.entries(visuals).map(([id, v]) => [id, v.path])),
        )}
      />

      {VISUAL_SLOTS.map((slot) => {
        const current = draft[slot.id];
        const preview = current.path ? publicStorageUrl(current.path) : null;

        return (
          <Panel key={slot.id}>
            <PanelHeader title={`${slot.page} — ${slot.label}`} description={slot.hint} />

            <div className="grid gap-5 p-5 sm:grid-cols-[14rem_1fr] sm:items-start">
              <div>
                {preview ? (
                  <div className="mb-3 overflow-hidden rounded-md border border-panel-border dark:border-panel-dark-border">
                    <Image
                      src={preview}
                      alt=""
                      width={480}
                      height={600}
                      sizes="224px"
                      className="block h-auto w-full object-cover"
                    />
                  </div>
                ) : null}

                <ImageUploader
                  folder="content"
                  scope={slot.id}
                  value={null}
                  onChange={(image) => onUpload(slot.id, image)}
                  label={preview ? 'Remplacer' : 'Téléverser'}
                  aspect={ASPECT[slot.aspect] ?? 'landscape'}
                />
              </div>

              <div className="flex flex-col gap-3">
                <TextInput
                  id={`alt-${slot.id}`}
                  label="Texte alternatif"
                  hint="Décrit la photo pour les lecteurs d’écran et les moteurs de recherche."
                  value={current.alt}
                  onChange={(event) => update(slot.id, { alt: event.target.value })}
                />

                <p className="text-xs text-panel-faint dark:text-panel-dark-faint">
                  {current.path
                    ? 'Photographie de la maison.'
                    : 'Aucune photo fournie : la maquette tient la place.'}
                </p>

                {current.path ? (
                  <AdminButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() => update(slot.id, { path: '' })}
                  >
                    Revenir au visuel d’origine
                  </AdminButton>
                ) : null}
              </div>
            </div>
          </Panel>
        );
      })}

      <div className="flex justify-end border-t border-panel-border pt-4 dark:border-panel-dark-border">
        <AdminButton type="submit" variant="primary" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer les visuels'}
        </AdminButton>
      </div>
    </form>
  );
}
