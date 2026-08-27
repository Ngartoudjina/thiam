import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE, getServiceRoleKey } from '@/lib/supabase/env';
import type { Database } from '@/types/database';

/**
 * Délai d'expiration des appels Supabase.
 *
 * Sans lui, un backend injoignable — projet en pause, DNS qui ne résout plus,
 * coupure réseau — fige chaque rendu jusqu'au délai par défaut du système. Le
 * site est conçu pour retomber sur le contenu de la maquette dans ce cas : il
 * doit le faire vite, pas au bout d'une minute. Constaté en conditions réelles :
 * une génération de pages passée de 8 secondes à quatre minutes et demie.
 */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Coupe-circuit.
 *
 * Quand le backend ne répond pas, inutile que chaque lecture repaie le prix de
 * l'attente : le premier échec réseau suspend les appels pendant une demi-minute
 * et la couche de contenu sert immédiatement les valeurs de repli. Une réponse
 * correcte referme aussitôt le circuit.
 */
const CIRCUIT_OPEN_MS = 30_000;
let unreachableUntil = 0;

const withTimeout: typeof fetch = async (input, init) => {
  if (Date.now() < unreachableUntil) {
    throw new Error('Supabase injoignable — appels suspendus après un échec réseau.');
  }

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
    });

    unreachableUntil = 0;
    return response;
  } catch (error) {
    unreachableUntil = Date.now() + CIRCUIT_OPEN_MS;
    throw error;
  }
};

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
    global: { fetch: withTimeout },
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
    global: { fetch: withTimeout },
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
    global: { fetch: withTimeout },
  });
}

export type TypedClient = ReturnType<typeof createAdminSupabase>;
export type SessionClient = NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>;
