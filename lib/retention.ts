import { lt, sql } from 'drizzle-orm';
import type { Database } from '@/lib/db/connection';
import { contactRequests } from '@/lib/db/schema';

/**
 * Durée de conservation des demandes, telle qu'annoncée sur la page
 * Confidentialité : douze mois, puis effacement automatique.
 */
export const CONTACT_REQUEST_RETENTION_MONTHS = 12;

/**
 * Efface les demandes plus anciennes que la durée annoncée.
 *
 * Lancée à chaque nouvelle demande et à chaque ouverture de la boîte de
 * réception : la règle s'applique sans tâche planifiée à entretenir.
 */
export async function purgeExpiredContactRequests(db: Database): Promise<void> {
  await db
    .delete(contactRequests)
    .where(
      lt(
        contactRequests.created_at,
        sql`now() - make_interval(months => ${CONTACT_REQUEST_RETENTION_MONTHS})`,
      ),
    );
}
