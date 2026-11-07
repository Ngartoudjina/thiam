'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { contactRequests, newsletterSubscribers } from '@/lib/db/schema';
import { failure, runAction, success, type ActionResult } from '@/services/admin/action-result';
import { staffDb } from '@/services/admin/repository';
import { revalidatePath } from 'next/cache';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';

const requestStatus = z.enum(['new', 'handled']);
const uuid = z.uuid();

/** Marque une demande comme traitée, ou la remet parmi les nouvelles. */
export async function setRequestStatusAction(
  id: string,
  status: 'new' | 'handled',
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = z.object({ id: uuid, status: requestStatus }).safeParse({ id, status });
    if (!parsed.success) return failure('Demande introuvable.');

    const db = await staffDb();
    await db
      .update(contactRequests)
      .set({
        status: parsed.data.status,
        handled_at: parsed.data.status === 'handled' ? new Date() : null,
      })
      .where(eq(contactRequests.id, parsed.data.id));

    revalidatePath(ADMIN_ROUTES.requests);
    return success(
      parsed.data.status === 'handled'
        ? 'Demande marquée comme traitée.'
        : 'Demande remise en attente.',
    );
  });
}

export async function deleteRequestAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    if (!uuid.safeParse(id).success) return failure('Demande introuvable.');

    const db = await staffDb();
    await db.delete(contactRequests).where(eq(contactRequests.id, id));

    revalidatePath(ADMIN_ROUTES.requests);
    return success('Demande supprimée.');
  });
}

/** Désinscription à la demande d'un abonné. */
export async function deleteSubscriberAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    if (!uuid.safeParse(id).success) return failure('Abonné introuvable.');

    const db = await staffDb();
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));

    revalidatePath(ADMIN_ROUTES.subscribers);
    return success('Abonné retiré de la liste.');
  });
}
