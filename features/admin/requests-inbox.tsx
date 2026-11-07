'use client';

import { CheckCheck, MessageCircle, Phone, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { AdminButton, EmptyState } from '@/components/admin/ui/primitives';
import { FORM_TOPIC_LABELS } from '@/constants/services';
import { deleteRequestAction, setRequestStatusAction } from '@/services/admin/inbox-actions';
import { cn } from '@/lib/utils';
import type { ActionResult } from '@/services/admin/action-result';
import type { ContactRequestRow } from '@/types/database';

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Porto-Novo',
});

/**
 * Numéro WhatsApp à partir d'une saisie libre : chiffres seuls, indicatif du
 * Bénin ajouté aux numéros nationaux (8 ou 10 chiffres).
 */
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.trim().startsWith('+') || digits.startsWith('00')) return digits.replace(/^00/, '');
  return digits.length === 8 || digits.length === 10 ? `229${digits}` : digits;
}

export function RequestsInbox({ requests }: { readonly requests: readonly ContactRequestRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (id: string, action: Promise<ActionResult>): Promise<void> => {
    setBusyId(id);
    const result = await action;
    setBusyId(null);

    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  if (requests.length === 0) {
    return (
      <EmptyState
        title="Aucune demande ici"
        description="Les messages envoyés depuis le formulaire de contact du site apparaissent dans cette liste, du plus récent au plus ancien."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((request) => {
        const isNew = request.status === 'new';
        const busy = busyId === request.id;

        return (
          <li
            key={request.id}
            className={cn(
              'rounded-xl border bg-panel p-4 sm:p-5 dark:bg-panel-dark-muted',
              isNew
                ? 'border-accent/50 dark:border-accent/40'
                : 'border-panel-border dark:border-panel-dark-border',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-sans text-sm font-semibold text-panel-ink dark:text-panel-dark-ink">
                  {request.full_name}
                  <span className="rounded-full bg-panel-sunken px-2 py-0.5 text-[0.6875rem] font-medium text-panel-soft dark:bg-panel-dark-sunken dark:text-panel-dark-soft">
                    {FORM_TOPIC_LABELS[request.topic] ?? request.topic}
                  </span>
                  {isNew ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.6875rem] font-medium text-accent-strong dark:bg-accent/20 dark:text-accent-soft">
                      Nouvelle
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
                  Reçue le {formatDate.format(request.created_at)}
                  {request.handled_at
                    ? ` · traitée le ${formatDate.format(request.handled_at)}`
                    : ''}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <AdminButton asChild variant="secondary" size="sm">
                  <a href={`tel:${request.phone.replace(/[^\d+]/g, '')}`}>
                    <Phone size={14} strokeWidth={1.7} aria-hidden="true" />
                    {request.phone}
                  </a>
                </AdminButton>
                <AdminButton asChild variant="secondary" size="sm">
                  <a
                    href={`https://wa.me/${whatsappNumber(request.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} strokeWidth={1.7} aria-hidden="true" />
                    WhatsApp
                  </a>
                </AdminButton>
              </div>
            </div>

            {request.message ? (
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-panel-ink dark:text-panel-dark-ink">
                {request.message}
              </p>
            ) : (
              <p className="mt-3 text-[0.8125rem] text-panel-faint italic dark:text-panel-dark-faint">
                Pas de message : rappeler le client au numéro indiqué.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-end gap-1.5 border-t border-panel-border pt-3 dark:border-panel-dark-border">
              {isNew ? (
                <AdminButton
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    void run(request.id, setRequestStatusAction(request.id, 'handled'))
                  }
                >
                  <CheckCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                  Marquer comme traitée
                </AdminButton>
              ) : (
                <AdminButton
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void run(request.id, setRequestStatusAction(request.id, 'new'))}
                >
                  <Undo2 size={14} strokeWidth={1.7} aria-hidden="true" />
                  Remettre en attente
                </AdminButton>
              )}

              <ConfirmDialog
                title="Supprimer cette demande ?"
                description="Le message et les coordonnées du client seront effacés. Cette action est définitive."
                onConfirm={() => run(request.id, deleteRequestAction(request.id))}
                trigger={
                  <AdminButton variant="ghost" size="sm" aria-label="Supprimer la demande">
                    <Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />
                  </AdminButton>
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
