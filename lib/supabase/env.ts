/**
 * Accès à la configuration Supabase.
 *
 * Le site public doit rester consultable même sans Supabase : tant que les
 * variables ne sont pas renseignées, la couche de contenu sert les valeurs de
 * `constants/` et le tableau de bord affiche une page d'installation. Aucune
 * exception n'est donc levée au chargement du module.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const SUPABASE = {
  url,
  anonKey,
  /** Vrai lorsque le couple URL + clé publique est exploitable. */
  isConfigured: url.length > 0 && anonKey.length > 0,
} as const;

/** Clé de service : serveur uniquement, jamais exposée au navigateur. */
export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY est absente. Elle est requise pour les opérations administrateur (seed, suppression de fichiers).',
    );
  }

  return key;
}

export const STORAGE_BUCKET = 'media';

/** URL publique d'un objet du compartiment `media`. */
export function publicStorageUrl(storagePath: string): string {
  if (!SUPABASE.isConfigured) return storagePath;
  if (storagePath.startsWith('http') || storagePath.startsWith('/')) return storagePath;

  return `${SUPABASE.url}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}
