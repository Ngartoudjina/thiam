import 'server-only';

import { cache } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import type { UserRole, UserRow } from '@/types/database';

export interface StaffMember {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: UserRole;
}

/**
 * Utilisateur courant, s'il possède un profil dans `public.users`.
 *
 * Un compte d'authentification sans profil n'a aucun droit : c'est la ligne de
 * profil qui fait l'administrateur, jamais la seule existence du compte.
 *
 * Mémorisé par requête : plusieurs appels dans un même rendu ne déclenchent
 * qu'un seul aller-retour.
 */
export const getCurrentStaff = cache(async (): Promise<StaffMember | null> => {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const profile = data as Pick<UserRow, 'id' | 'email' | 'full_name' | 'role'>;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name ?? profile.email.split('@')[0] ?? 'Administrateur',
    role: profile.role,
  };
});

export class AuthorizationError extends Error {
  constructor(message = 'Vous n’avez pas les droits nécessaires.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Exige un membre du personnel.
 * À appeler en tête de chaque action serveur : le middleware protège l'accès
 * aux pages, celle-ci protège les écritures.
 */
export async function requireStaff(): Promise<StaffMember> {
  const staff = await getCurrentStaff();
  if (!staff) throw new AuthorizationError('Session expirée. Reconnectez-vous.');
  return staff;
}

/** Exige le rôle administrateur — gestion des comptes, suppressions massives. */
export async function requireAdmin(): Promise<StaffMember> {
  const staff = await requireStaff();

  if (staff.role !== 'admin') {
    throw new AuthorizationError('Cette action est réservée aux administrateurs.');
  }

  return staff;
}
