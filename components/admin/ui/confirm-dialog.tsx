'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useState, type ReactNode } from 'react';
import { AdminButton } from '@/components/admin/ui/primitives';

interface ConfirmDialogProps {
  readonly trigger: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly onConfirm: () => Promise<void> | void;
}

/**
 * Confirmation avant une action destructive.
 * Radix pose le rôle `alertdialog`, piège le focus et met le bouton
 * d'annulation en cible par défaut — on ne supprime pas par inadvertance.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Supprimer',
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-90 bg-panel-ink/40 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-100 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-panel-border bg-panel p-6 shadow-(--shadow-panel-lg) dark:border-panel-dark-border dark:bg-panel-dark-muted">
          <AlertDialog.Title className="font-sans text-base font-semibold text-panel-ink dark:text-panel-dark-ink">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-panel-soft dark:text-panel-dark-soft">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <AdminButton variant="secondary" disabled={pending}>
                Annuler
              </AdminButton>
            </AlertDialog.Cancel>
            <AdminButton variant="danger" onClick={handleConfirm} disabled={pending}>
              {pending ? 'Suppression…' : confirmLabel}
            </AdminButton>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
