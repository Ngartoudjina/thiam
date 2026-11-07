import { createHash, randomBytes } from 'node:crypto';
import { and, eq, lt, ne } from 'drizzle-orm';
import { SESSION_TTL_MS } from '@/lib/auth/cookie';
import type { Database } from '@/lib/db/connection';
import { sessions, users } from '@/lib/db/schema';
import type { UserRole } from '@/types/database';

/**
 * Sessions du tableau de bord, adossées à la base.
 *
 * Le navigateur reçoit un jeton aléatoire de 256 bits ; la base n'en garde que
 * l'empreinte SHA-256. Une session se révoque donc vraiment — déconnexion,
 * changement de mot de passe, suppression du compte — ce qu'un jeton signé
 * sans état ne permet pas.
 *
 * Aucune dépendance à Next.js ici : la lecture du cookie vit dans `lib/auth.ts`.
 */

/** Sous quinze jours restants, toute visite la prolonge de trente jours. */
const RENEW_BELOW_MS = 15 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: UserRole;
}

export interface ValidatedSession {
  readonly sessionId: string;
  readonly expiresAt: Date;
  readonly user: SessionUser;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Un jeton de 32 octets en base64url fait exactement 43 caractères. */
const isWellFormed = (token: string): boolean => /^[A-Za-z0-9_-]{43}$/.test(token);

export async function createSession(
  db: Database,
  userId: string,
  userAgent = '',
): Promise<{ readonly token: string; readonly expiresAt: Date }> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    id: hashSessionToken(token),
    user_id: userId,
    expires_at: expiresAt,
    user_agent: userAgent.slice(0, 300),
  });

  return { token, expiresAt };
}

/**
 * Vérifie un jeton et prolonge la session si elle approche de son terme.
 * Renvoie `null` pour tout jeton inconnu, malformé ou expiré.
 */
export async function validateSessionToken(
  db: Database,
  token: string,
): Promise<ValidatedSession | null> {
  if (!isWellFormed(token)) return null;

  const sessionId = hashSessionToken(token);

  const [row] = await db
    .select({
      expiresAt: sessions.expires_at,
      userId: users.id,
      email: users.email,
      fullName: users.full_name,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.user_id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) return null;

  const now = Date.now();

  if (row.expiresAt.getTime() <= now) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  let expiresAt = row.expiresAt;

  if (expiresAt.getTime() - now < RENEW_BELOW_MS) {
    expiresAt = new Date(now + SESSION_TTL_MS);
    await db.update(sessions).set({ expires_at: expiresAt }).where(eq(sessions.id, sessionId));
  }

  return {
    sessionId,
    expiresAt,
    user: {
      id: row.userId,
      email: row.email,
      fullName: row.fullName || row.email.split('@')[0] || 'Administrateur',
      role: row.role,
    },
  };
}

export async function invalidateSession(db: Database, sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/** Ferme toutes les sessions d'un compte, sauf éventuellement la session courante. */
export async function invalidateUserSessions(
  db: Database,
  userId: string,
  keepSessionId?: string,
): Promise<void> {
  await db
    .delete(sessions)
    .where(
      keepSessionId
        ? and(eq(sessions.user_id, userId), ne(sessions.id, keepSessionId))
        : eq(sessions.user_id, userId),
    );
}

/** Ménage des sessions expirées — lancé à chaque connexion, il ne coûte presque rien. */
export async function purgeExpiredSessions(db: Database): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expires_at, new Date()));
}
