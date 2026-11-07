import 'server-only';

import { getDb, type Database } from '@/lib/db';

/**
 * Lecture publique tolérante aux pannes.
 *
 * - Base non configurée : la valeur de repli, sans bruit.
 * - Requête en échec : l'erreur est journalisée, la valeur de repli est servie
 *   — et rien n'est mis en cache, si bien que la lecture suivante réessaie.
 *
 * Le second point compte : une réponse de repli mise en cache pour une
 * journée masquerait le vrai contenu bien après le retour de la base.
 */
export async function readOrFallback<T>(
  label: string,
  cached: () => Promise<T | null>,
  fallback: T,
): Promise<T> {
  try {
    return (await cached()) ?? fallback;
  } catch (error) {
    console.error(`[contenu] lecture « ${label} » en échec, contenu de repli servi`, error);
    return fallback;
  }
}

/** Client de la base, ou `null` : la fonction mise en cache renvoie alors `null`. */
export function publicDb(): Database | null {
  return getDb();
}
