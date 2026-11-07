import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createSession,
  hashSessionToken,
  invalidateSession,
  invalidateUserSessions,
  purgeExpiredSessions,
  validateSessionToken,
} from '@/lib/auth/session';
import type { Database } from '@/lib/db/connection';
import { sessions, users } from '@/lib/db/schema';
import { createTestDatabase } from './helpers/db';

let db: Database;
let close: () => Promise<void>;
let userId: string;

beforeAll(async () => {
  ({ db, close } = await createTestDatabase());

  const [user] = await db
    .insert(users)
    .values({ email: 'gerant@thiam.test', full_name: 'Gérant', role: 'admin', password_hash: 'x' })
    .returning({ id: users.id });

  userId = user!.id;
});

afterAll(() => close());

describe('sessions', () => {
  it('ne stocke que l’empreinte du jeton', async () => {
    const { token } = await createSession(db, userId, 'Navigateur de test');
    const rows = await db.select().from(sessions).where(eq(sessions.user_id, userId));

    expect(token).toHaveLength(43);
    expect(rows.some((row) => row.id === token)).toBe(false);
    expect(rows.some((row) => row.id === hashSessionToken(token))).toBe(true);
  });

  it('valide un jeton et renvoie le profil sans l’empreinte du mot de passe', async () => {
    const { token } = await createSession(db, userId);
    const session = await validateSessionToken(db, token);

    expect(session?.user).toEqual({
      id: userId,
      email: 'gerant@thiam.test',
      fullName: 'Gérant',
      role: 'admin',
    });
    expect(JSON.stringify(session)).not.toContain('password');
  });

  it('refuse les jetons inconnus ou malformés', async () => {
    await expect(validateSessionToken(db, 'a'.repeat(43))).resolves.toBeNull();
    await expect(validateSessionToken(db, 'trop-court')).resolves.toBeNull();
    await expect(validateSessionToken(db, "' or 1=1 --")).resolves.toBeNull();
  });

  it('supprime une session expirée au lieu de l’accepter', async () => {
    const { token } = await createSession(db, userId);
    const id = hashSessionToken(token);
    await db
      .update(sessions)
      .set({ expires_at: new Date(Date.now() - 1000) })
      .where(eq(sessions.id, id));

    await expect(validateSessionToken(db, token)).resolves.toBeNull();
    expect(await db.select().from(sessions).where(eq(sessions.id, id))).toHaveLength(0);
  });

  it('prolonge une session qui approche de son terme', async () => {
    const { token } = await createSession(db, userId);
    const id = hashSessionToken(token);
    const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    await db.update(sessions).set({ expires_at: soon }).where(eq(sessions.id, id));

    const session = await validateSessionToken(db, token);

    expect(session!.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000);
  });

  it('révoque une session, puis toutes les autres d’un compte', async () => {
    const kept = await createSession(db, userId);
    const other = await createSession(db, userId);

    await invalidateSession(db, hashSessionToken(other.token));
    await expect(validateSessionToken(db, other.token)).resolves.toBeNull();

    const third = await createSession(db, userId);
    await invalidateUserSessions(db, userId, hashSessionToken(kept.token));

    await expect(validateSessionToken(db, third.token)).resolves.toBeNull();
    await expect(validateSessionToken(db, kept.token)).resolves.not.toBeNull();
  });

  it('les sessions disparaissent avec le compte', async () => {
    const [user] = await db
      .insert(users)
      .values({ email: 'passager@thiam.test', password_hash: 'x' })
      .returning({ id: users.id });
    const { token } = await createSession(db, user!.id);

    await db.delete(users).where(eq(users.id, user!.id));
    await expect(validateSessionToken(db, token)).resolves.toBeNull();
  });

  it('purge les sessions expirées', async () => {
    const { token } = await createSession(db, userId);
    await db
      .update(sessions)
      .set({ expires_at: new Date(Date.now() - 1000) })
      .where(eq(sessions.id, hashSessionToken(token)));

    await purgeExpiredSessions(db);
    const remaining = await db.select().from(sessions);
    expect(remaining.every((row) => row.expires_at.getTime() > Date.now())).toBe(true);
  });

  it('refuse deux comptes pour la même adresse, et les majuscules', async () => {
    await expect(
      db.insert(users).values({ email: 'gerant@thiam.test', password_hash: 'x' }),
    ).rejects.toThrow();
    await expect(
      db.insert(users).values({ email: 'Gerant@Thiam.test', password_hash: 'x' }),
    ).rejects.toThrow();
  });
});
