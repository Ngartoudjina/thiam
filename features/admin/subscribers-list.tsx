'use client';

import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { AdminButton, EmptyState, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { deleteSubscriberAction } from '@/services/admin/inbox-actions';
import type { NewsletterSubscriberRow } from '@/types/database';

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeZone: 'Africa/Porto-Novo',
});

export function SubscribersList({
  subscribers,
}: {
  readonly subscribers: readonly NewsletterSubscriberRow[];
}) {
  const remove = async (id: string): Promise<void> => {
    const result = await deleteSubscriberAction(id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  if (subscribers.length === 0) {
    return (
      <EmptyState
        title="Aucun abonné pour l’instant"
        description="Les adresses saisies dans le pied de page du site (« La lettre de la maison ») apparaîtront ici."
      />
    );
  }

  return (
    <Panel>
      <PanelHeader
        title={`${subscribers.length} abonné${subscribers.length > 1 ? 's' : ''}`}
        description="Exportez la liste pour l’importer dans votre outil d’envoi (Brevo, Mailchimp…)."
        action={
          <AdminButton asChild variant="secondary" size="sm">
            <a href="/api/admin/subscribers" download>
              <Download size={14} strokeWidth={1.7} aria-hidden="true" />
              Exporter (CSV)
            </a>
          </AdminButton>
        }
      />
      <ul className="divide-y divide-panel-border dark:divide-panel-dark-border">
        {subscribers.map((subscriber) => (
          <li key={subscriber.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <span className="min-w-0">
              <span className="block truncate text-sm text-panel-ink dark:text-panel-dark-ink">
                {subscriber.email}
              </span>
              <span className="block text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
                Inscrit le {formatDate.format(subscriber.created_at)}
              </span>
            </span>

            <ConfirmDialog
              title="Retirer cet abonné ?"
              description="À faire quand la personne demande à ne plus recevoir la lettre. Cette action est définitive."
              confirmLabel="Retirer"
              onConfirm={() => remove(subscriber.id)}
              trigger={
                <AdminButton variant="ghost" size="icon" aria-label={`Retirer ${subscriber.email}`}>
                  <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                </AdminButton>
              }
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
