'use client';

import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { SortableList } from '@/components/admin/sortable-list';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { AdminButton, EmptyState, Panel, StatusPill } from '@/components/admin/ui/primitives';
import type { ActionResult } from '@/services/admin/action-result';
import type { ContentStatus } from '@/types/database';

export interface ManagedEntity {
  readonly id: string;
  readonly status: ContentStatus;
}

interface EntityManagerProps<T extends ManagedEntity> {
  readonly items: readonly T[];
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly addLabel: string;
  readonly deleteTitle: string;
  readonly deleteDescription: string;
  /** Résumé affiché dans la liste. */
  readonly renderSummary: (item: T) => ReactNode;
  /** Formulaire d'édition ; `item` vaut `null` pour une création. */
  readonly renderForm: (item: T | null, close: () => void) => ReactNode;
  readonly onReorder: (ids: readonly string[]) => Promise<ActionResult>;
  readonly onDelete: (id: string) => Promise<ActionResult>;
  readonly onToggleStatus: (id: string, status: ContentStatus) => Promise<ActionResult>;
}

type Editing<T> = { readonly mode: 'create' } | { readonly mode: 'edit'; readonly item: T } | null;

/**
 * Gestion d'une rubrique : liste réordonnable, création, édition, bascule de
 * visibilité et suppression confirmée.
 *
 * Mutualisé entre Services, Témoignages, Questions et Galerie — seul le
 * formulaire change d'une rubrique à l'autre.
 */
export function EntityManager<T extends ManagedEntity>({
  items,
  emptyTitle,
  emptyDescription,
  addLabel,
  deleteTitle,
  deleteDescription,
  renderSummary,
  renderForm,
  onReorder,
  onDelete,
  onToggleStatus,
}: EntityManagerProps<T>) {
  const [editing, setEditing] = useState<Editing<T>>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const close = (): void => setEditing(null);

  const runToggle = async (item: T): Promise<void> => {
    const next: ContentStatus = item.status === 'visible' ? 'hidden' : 'visible';
    setBusyId(item.id);

    const result = await onToggleStatus(item.id, next);
    setBusyId(null);

    if (result.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const runDelete = async (item: T): Promise<void> => {
    const result = await onDelete(item.id);
    if (result.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (editing) {
    return (
      <Panel className="p-5 sm:p-6">
        {renderForm(editing.mode === 'edit' ? editing.item : null, close)}
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AdminButton variant="primary" onClick={() => setEditing({ mode: 'create' })}>
          <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
          {addLabel}
        </AdminButton>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <AdminButton variant="secondary" onClick={() => setEditing({ mode: 'create' })}>
              <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
              {addLabel}
            </AdminButton>
          }
        />
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          renderItem={(item) => (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">{renderSummary(item)}</div>

              <div className="flex shrink-0 items-center gap-1.5">
                <StatusPill status={item.status} />

                <AdminButton
                  variant="ghost"
                  size="icon"
                  aria-label={item.status === 'visible' ? 'Masquer' : 'Publier'}
                  disabled={busyId === item.id}
                  onClick={() => void runToggle(item)}
                >
                  {item.status === 'visible' ? (
                    <EyeOff size={15} strokeWidth={1.7} aria-hidden="true" />
                  ) : (
                    <Eye size={15} strokeWidth={1.7} aria-hidden="true" />
                  )}
                </AdminButton>

                <AdminButton
                  variant="ghost"
                  size="icon"
                  aria-label="Modifier"
                  onClick={() => setEditing({ mode: 'edit', item })}
                >
                  <Pencil size={15} strokeWidth={1.7} aria-hidden="true" />
                </AdminButton>

                <ConfirmDialog
                  title={deleteTitle}
                  description={deleteDescription}
                  onConfirm={() => runDelete(item)}
                  trigger={
                    <AdminButton variant="ghost" size="icon" aria-label="Supprimer">
                      <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                    </AdminButton>
                  }
                />
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
