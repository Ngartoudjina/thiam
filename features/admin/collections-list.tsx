'use client';

import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { SortableList } from '@/components/admin/sortable-list';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { AdminButton, EmptyState, StatusPill } from '@/components/admin/ui/primitives';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { publicStorageUrl } from '@/lib/supabase/env';
import {
  deleteCollectionAction,
  reorderCollectionsAction,
} from '@/services/admin/collection-actions';
import { toggleStatusAction } from '@/services/admin/content-actions';
import type { CollectionWithImages } from '@/services/admin/queries';
import type { ContentStatus } from '@/types/database';

/**
 * Liste des univers.
 *
 * L'ordre défini ici est celui de la section « Six univers » de l'accueil, des
 * filtres de la page Collections et du pied de page.
 */
export function CollectionsList({
  collections,
}: {
  readonly collections: readonly CollectionWithImages[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (id: string, current: ContentStatus): Promise<void> => {
    const next: ContentStatus = current === 'visible' ? 'hidden' : 'visible';
    setBusyId(id);
    const result = await toggleStatusAction('collections', id, next);
    setBusyId(null);
    if (result.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const remove = async (id: string): Promise<void> => {
    const result = await deleteCollectionAction(id);
    if (result.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (collections.length === 0) {
    return (
      <EmptyState
        title="Aucune collection"
        description="Créez vos univers — Diamant, Mariage, Or… — puis ajoutez leurs photos."
        action={
          <AdminButton asChild variant="primary">
            <Link href={`${ADMIN_ROUTES.collections}/nouvelle`}>
              <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
              Créer une collection
            </Link>
          </AdminButton>
        }
      />
    );
  }

  return (
    <SortableList
      items={collections}
      onReorder={reorderCollectionsAction}
      renderItem={(collection) => {
        const primary =
          collection.images.find((image) => image.is_primary) ?? collection.images[0] ?? null;

        return (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-panel-sunken dark:bg-panel-dark-sunken">
                {primary ? (
                  <Image
                    src={publicStorageUrl(primary.storage_path)}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 m-auto size-4 rotate-45 border border-accent/40"
                  />
                )}
              </span>

              <span className="min-w-0">
                <span className="block truncate font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
                  {collection.name}
                </span>
                <span className="mt-0.5 block truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
                  {collection.tagline || collection.category} · {collection.images.length} photo
                  {collection.images.length > 1 ? 's' : ''}
                </span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <StatusPill status={collection.status} />

              <AdminButton
                variant="ghost"
                size="icon"
                aria-label={collection.status === 'visible' ? 'Masquer' : 'Publier'}
                disabled={busyId === collection.id}
                onClick={() => void toggle(collection.id, collection.status)}
              >
                {collection.status === 'visible' ? (
                  <EyeOff size={15} strokeWidth={1.7} aria-hidden="true" />
                ) : (
                  <Eye size={15} strokeWidth={1.7} aria-hidden="true" />
                )}
              </AdminButton>

              <AdminButton asChild variant="ghost" size="icon" aria-label="Modifier">
                <Link href={`${ADMIN_ROUTES.collections}/${collection.id}`}>
                  <Pencil size={15} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              </AdminButton>

              <ConfirmDialog
                title={`Supprimer « ${collection.name} » ?`}
                description="La collection et toutes ses photos seront supprimées, y compris les fichiers stockés. Cette action est définitive."
                onConfirm={() => remove(collection.id)}
                trigger={
                  <AdminButton variant="ghost" size="icon" aria-label="Supprimer">
                    <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                  </AdminButton>
                }
              />
            </div>
          </div>
        );
      }}
    />
  );
}
