import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';
import { AuthorizationError } from '@/lib/auth';
import { ROUTES } from '@/constants/navigation';
import type { CacheTag } from '@/lib/cache';

export interface ActionSuccess<T> {
  readonly ok: true;
  readonly message: string;
  readonly data?: T;
}

export interface ActionFailure {
  readonly ok: false;
  readonly message: string;
  /** Erreurs par champ, telles que produites par Zod. */
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
}

/**
 * Le paramètre par défaut est `unknown` et non `undefined` : une action qui
 * renvoie une donnée reste ainsi assignable à `ActionResult` tout court.
 */
export type ActionResult<T = unknown> = ActionSuccess<T> | ActionFailure;

export const success = <T>(message: string, data?: T): ActionSuccess<T> =>
  data === undefined ? { ok: true, message } : { ok: true, message, data };

export const failure = (
  message: string,
  fieldErrors?: Readonly<Record<string, readonly string[]>>,
): ActionFailure => (fieldErrors ? { ok: false, message, fieldErrors } : { ok: false, message });

/**
 * Enveloppe commune des actions serveur.
 *
 * Elle traduit les erreurs en résultat typé plutôt qu'en exception : le
 * formulaire affiche un message utile, et aucune trace technique ne fuit vers
 * le navigateur.
 */
export async function runAction<T>(
  handler: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return failure(error.message);
    }

    console.error('[admin] action en échec', error);
    return failure('Une erreur est survenue. Réessayez dans un instant.');
  }
}

/**
 * Invalide le cache de contenu puis les pages qui l'affichent.
 * C'est ce qui rend une modification visible sur le site sans redéploiement.
 */
export function publishChanges(...tags: readonly CacheTag[]): void {
  for (const tag of tags) revalidateTag(tag);

  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.collections);
  revalidatePath(ROUTES.contact);
}
