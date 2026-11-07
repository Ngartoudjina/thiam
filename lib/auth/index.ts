import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { SESSION_COOKIE } from '@/lib/auth/cookie';
import { validateSessionToken } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import type { UserRole } from '@/types/database';

export interface StaffMember {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: UserRole;
  /** Session en cours — sert à la conserver quand on ferme les autres. */
  readonly sessionId: string;
}

/**
 * Membre du personnel connecté, ou `null`.
 *
 * C'est le contrôle qui fait foi : le middleware ne vérifie que la présence du
 * cookie, ici le jeton est confronté à la base. Mémorisé par requête, si bien
 * que plusieurs appels dans un même rendu ne coûtent qu'une lecture.
 */
export const getCurrentStaff = cache(async (): Promise<StaffMember | null> => {
  const db = getDb();
  if (!db) return null;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const session = await validateSessionToken(db, token);
    if (!session) return null;

    return { ...session.user, sessionId: session.sessionId };
  } catch (error) {
    console.error('[auth] vérification de session impossible', error);
    return null;
  }
});

export class AuthorizationError extends Error {
  constructor(message = 'Vous n’avez pas les droits nécessaires.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Exige un membre du personnel.
 * À appeler en tête de chaque action serveur et de chaque route protégée : le
 * middleware protège l'accès aux pages, cette fonction protège les écritures.
 */
export async function requireStaff(): Promise<StaffMember> {
  const staff = await getCurrentStaff();
  if (!staff) throw new AuthorizationError('Session expirée. Reconnectez-vous.');
  return staff;
}

/** Exige le rôle administrateur — gestion des comptes, import du contenu. */
export async function requireAdmin(): Promise<StaffMember> {
  const staff = await requireStaff();

  if (staff.role !== 'admin') {
    throw new AuthorizationError('Cette action est réservée aux administrateurs.');
  }

  return staff;
}
