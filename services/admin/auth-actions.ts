'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { SUPABASE } from '@/lib/supabase/env';
import { createServerSupabase } from '@/lib/supabase/server';
import { failure, runAction, success, type ActionResult } from '@/services/admin/action-result';


/**
 * Distingue une panne de service d'un identifiant erroné.
 *
 * Les deux renvoyaient le même message : un projet Supabase en pause ou
 * supprimé se lisait donc « mot de passe incorrect », et l'on cherchait le
 * défaut du mauvais côté. Le message reste générique sur les identifiants —
 * pour ne pas permettre d'énumérer les comptes — mais une indisponibilité du
 * serveur doit se nommer.
 */
function isBackendUnreachable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const { name, message, status } = error as {
    name?: string;
    message?: string;
    status?: number;
  };

  if (name === 'AuthRetryableFetchError' || name === 'TimeoutError' || name === 'AbortError') {
    return true;
  }

  // Une erreur réseau ne porte pas de statut HTTP exploitable.
  if (status === 0 || status === undefined) {
    const text = (message ?? '').toLowerCase();
    return (
      text.includes('fetch failed') ||
      text.includes('failed to fetch') ||
      text.includes('network') ||
      text.includes('enotfound') ||
      text.includes('timeout')
    );
  }

  return false;
}

const credentialsSchema = z.object({
  email: z.email('Cette adresse e-mail ne semble pas valide.'),
  password: z.string().min(8, 'Le mot de passe compte au moins huit caractères.'),
});

/**
 * Connexion par e-mail et mot de passe.
 *
 * Le message d'échec reste volontairement générique : il ne révèle pas si
 * l'adresse existe, ce qui empêche d'énumérer les comptes.
 */
export async function signInAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    if (!SUPABASE.isConfigured) {
      return failure('Supabase n’est pas configuré. Voir le README, § Installation.');
    }

    const parsed = credentialsSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!parsed.success) {
      return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);
    }

    const supabase = await createServerSupabase();
    if (!supabase) return failure('Supabase n’est pas configuré.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error && isBackendUnreachable(error)) {
      return failure(
        'Le service d’authentification est injoignable. Vérifiez que le projet Supabase est actif, puis réessayez.',
      );
    }

    if (error || !data.user) {
      return failure('Adresse e-mail ou mot de passe incorrect.');
    }

    // Le compte doit disposer d'un profil : c'est lui qui confère les droits.
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      return failure('Ce compte n’a pas accès à l’administration.');
    }

    return success('Connexion réussie.');
  });
}

/** Déconnexion : la session est révoquée côté Supabase, pas seulement oubliée. */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase?.auth.signOut();
  redirect(ADMIN_ROUTES.login);
}
