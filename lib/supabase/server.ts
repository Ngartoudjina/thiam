import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE, getServiceRoleKey } from '@/lib/supabase/env';
import type { Database } from '@/types/database';

/**
 * Les trois fabriques ci-dessous n'annotent pas leur type de retour : le client
 * porte des génériques de schéma que seule l'inférence renseigne correctement.
 * Les écrire à la main (`SupabaseClient<Database>`) laisse les paramètres de
 * schéma à leur valeur par défaut, et toute ligne lue retombe alors sur `never`.
 */

/**
 * Client lié à la session du visiteur, adossé aux cookies.
 * À utiliser dans les composants serveur, les actions et les routes.
 */
export async function createServerSupabase() {
  if (!SUPABASE.isConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE.url, SUPABASE.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un composant serveur : le rafraîchissement de session
          // est alors assuré par le middleware, cette erreur est sans effet.
        }
      },
    },
  });
}

/**
 * Client de lecture publique, sans session.
 *
 * Utilisé par le site vitrine : les pages restent statiques et ne dépendent
 * d'aucun cookie, donc d'aucun rendu dynamique par visiteur.
 */
export function createPublicSupabase() {
  if (!SUPABASE.isConfigured) return null;

  return createSupabaseClient<Database>(SUPABASE.url, SUPABASE.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client à privilèges de service : contourne RLS.
 *
 * Réservé aux opérations que l'utilisateur ne peut pas mener lui-même —
 * suppression d'objets orphelins dans le stockage, amorçage des données.
 * Chaque appel doit être précédé d'un contrôle de permission explicite.
 */
export function createAdminSupabase() {
  if (!SUPABASE.isConfigured) {
    throw new Error('Supabase n’est pas configuré : NEXT_PUBLIC_SUPABASE_URL est absente.');
  }

  return createSupabaseClient<Database>(SUPABASE.url, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type TypedClient = ReturnType<typeof createAdminSupabase>;
export type SessionClient = NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>;
