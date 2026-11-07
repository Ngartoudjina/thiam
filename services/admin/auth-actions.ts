'use server';

import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { getCurrentStaff } from '@/lib/auth';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/cookie';
import { hashPassword, needsRehash, verifyAgainstDecoy, verifyPassword } from '@/lib/auth/password';
import { createSession, invalidateSession, purgeExpiredSessions } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import {
  RATE_LIMITS,
  clientAddress,
  consumeRateLimit,
  fingerprint,
  formatRetryDelay,
  purgeRateLimits,
  resetRateLimit,
} from '@/lib/rate-limit';
import { failure, runAction, success, type ActionResult } from '@/services/admin/action-result';

const credentialsSchema = z.object({
  email: z.email('Cette adresse e-mail ne semble pas valide.').max(200),
  // Aucune règle de longueur minimale ici : elle s'applique à la création du
  // mot de passe, pas à sa saisie. Le plafond évite de hacher un roman.
  password: z.string().min(1, 'Saisissez votre mot de passe.').max(200),
});

/**
 * Connexion par e-mail et mot de passe.
 *
 * Le message d'échec reste volontairement générique, et une adresse inconnue
 * coûte autant de calcul qu'une adresse existante : rien ne permet d'énumérer
 * les comptes. Les essais sont limités par compte et par adresse IP.
 */
export async function signInAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const db = getDb();
    if (!db) return failure('La base de données n’est pas configurée. Voir le README.');

    const parsed = credentialsSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!parsed.success) {
      return failure('Vérifiez les champs.', z.flattenError(parsed.error).fieldErrors);
    }

    const email = parsed.data.email.trim().toLowerCase();
    const requestHeaders = await headers();
    const ip = fingerprint(clientAddress(requestHeaders));

    const [byIp, byAccount] = await Promise.all([
      consumeRateLimit(db, `connexion:ip:${ip}`, RATE_LIMITS.loginIp),
      consumeRateLimit(db, `connexion:compte:${fingerprint(email)}`, RATE_LIMITS.loginAccount),
    ]);

    if (!byIp.allowed || !byAccount.allowed) {
      const wait = Math.max(byIp.retryAfterMs, byAccount.retryAfterMs);
      return failure(`Trop de tentatives. Réessayez dans ${formatRetryDelay(wait)}.`);
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    const valid = user
      ? await verifyPassword(parsed.data.password, user.password_hash)
      : await verifyAgainstDecoy(parsed.data.password);

    if (!user || !valid) return failure('Adresse e-mail ou mot de passe incorrect.');

    const session = await createSession(db, user.id, requestHeaders.get('user-agent') ?? '');
    (await cookies()).set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));

    // Après coup, et sans bloquer la connexion : horodatage, empreinte
    // renforcée si les paramètres ont évolué, ménage des données échues.
    await Promise.allSettled([
      resetRateLimit(db, `connexion:compte:${fingerprint(email)}`),
      db
        .update(users)
        .set({
          last_login_at: new Date(),
          ...(needsRehash(user.password_hash)
            ? { password_hash: await hashPassword(parsed.data.password) }
            : {}),
        })
        .where(eq(users.id, user.id)),
      purgeExpiredSessions(db),
      purgeRateLimits(db),
    ]);

    return success('Connexion réussie.');
  });
}

/** Déconnexion : la session est supprimée en base, pas seulement oubliée. */
export async function signOutAction(): Promise<void> {
  const staff = await getCurrentStaff();
  const db = getDb();

  if (staff && db) {
    await invalidateSession(db, staff.sessionId).catch((error: unknown) => {
      console.error('[auth] session non supprimée', error);
    });
  }

  // Effacement avec les mêmes attributs que la pose : un cookie `__Host-`
  // effacé sans `Secure` ni `Path=/` serait ignoré par le navigateur.
  (await cookies()).set(SESSION_COOKIE, '', sessionCookieOptions(new Date(0)));
  redirect(ADMIN_ROUTES.login);
}
