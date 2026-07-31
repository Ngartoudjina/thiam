'use server';

import { requireStaff } from '@/lib/auth';
import { STORAGE_BUCKET } from '@/lib/supabase/env';
import { createServerSupabase } from '@/lib/supabase/server';
import { failure, runAction, success, type ActionResult } from '@/services/admin/action-result';

export type UploadFolder = 'collections' | 'gallery' | 'content';

export interface SignedUpload {
  readonly path: string;
  readonly signedUrl: string;
  readonly token: string;
}

/** Nom de fichier sûr : pas d'espace, pas d'accent, pas de collision. */
function buildPath(folder: UploadFolder, scope: string, extension: string): string {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  const safeScope = scope.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'divers';

  return `${folder}/${safeScope}/${stamp}-${random}.${extension}`;
}

/**
 * Prépare un téléversement direct vers Supabase Storage.
 *
 * Le fichier ne transite jamais par le serveur Next : le navigateur écrit
 * directement dans le compartiment via une URL signée à usage unique. C'est
 * plus rapide, et cela permet une vraie barre de progression.
 */
export async function createUploadUrlAction(
  folder: UploadFolder,
  scope: string,
  extension: string,
): Promise<ActionResult<SignedUpload>> {
  return runAction(async () => {
    await requireStaff();

    const supabase = await createServerSupabase();
    if (!supabase) return failure('Supabase n’est pas configuré.');

    const safeExtension = ['webp', 'jpg', 'jpeg', 'png'].includes(extension) ? extension : 'webp';
    const path = buildPath(folder, scope, safeExtension);

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      return failure('Impossible de préparer l’envoi. Vérifiez le compartiment « media ».');
    }

    return success('Envoi autorisé.', {
      path: data.path,
      signedUrl: data.signedUrl,
      token: data.token,
    });
  });
}
