'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '@/lib/supabase/env';
import type { Database } from '@/types/database';

let cached: SupabaseClient<Database> | null = null;

/**
 * Client navigateur, mémorisé pour le temps de vie de l'onglet.
 * Sert à l'authentification et au téléversement direct vers le stockage —
 * ainsi les fichiers ne transitent pas par le serveur Next.
 */
export function getBrowserSupabase(): SupabaseClient<Database> {
  if (!SUPABASE.isConfigured) {
    throw new Error(
      'Supabase n’est pas configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  cached ??= createBrowserClient<Database>(SUPABASE.url, SUPABASE.anonKey);
  return cached;
}
