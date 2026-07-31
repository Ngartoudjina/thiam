import 'server-only';

import { STORAGE_BUCKET } from '@/lib/supabase/env';
import { createAdminSupabase } from '@/lib/supabase/server';

/**
 * Supprime des objets du compartiment `media`.
 *
 * Appelée après le remplacement ou la suppression d'une image : sans cela, le
 * stockage accumulerait des fichiers que plus aucune ligne ne référence.
 *
 * L'échec est journalisé mais n'interrompt jamais l'action métier — mieux vaut
 * un fichier orphelin qu'une modification de contenu perdue.
 */
export async function removeStorageObjects(paths: readonly string[]): Promise<void> {
  // Les chemins absolus désignent les fichiers livrés avec le site (public/) :
  // ils ne sont pas dans le compartiment et ne doivent jamais être supprimés.
  const targets = paths.filter((path) => path.length > 0 && !path.startsWith('/'));
  if (targets.length === 0) return;

  try {
    const supabase = createAdminSupabase();
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([...targets]);

    if (error) {
      console.warn('[admin] objets non supprimés du stockage', error.message, targets);
    }
  } catch (error) {
    console.warn('[admin] stockage injoignable', error);
  }
}
