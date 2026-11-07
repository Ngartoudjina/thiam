import { NextResponse } from 'next/server';
import { getCurrentStaff } from '@/lib/auth';
import {
  IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  buildObjectPath,
  isUploadFolder,
  sniffImage,
} from '@/lib/storage/image';
import { StorageNotConfiguredError, saveImage } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * Réception d'une image du tableau de bord.
 *
 * Le navigateur a déjà redimensionné et compressé la photo ; la route vérifie
 * la session, l'origine de la requête, la taille, puis la nature réelle du
 * fichier (signature binaire) avant de le confier au stockage.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // Défense en profondeur : le cookie `SameSite=Lax` n'accompagne déjà aucun
  // envoi venu d'un autre site.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) {
    return json({ error: 'Origine refusée.' }, 403);
  }

  const staff = await getCurrentStaff();
  if (!staff) return json({ error: 'Session expirée. Reconnectez-vous.' }, 401);

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_UPLOAD_BYTES + 64 * 1024) {
    return json({ error: 'Ce fichier dépasse 4 Mo, même compressé.' }, 413);
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Envoi illisible.' }, 400);
  }

  const file = form.get('file');
  const folder = form.get('folder');
  const scope = String(form.get('scope') ?? 'divers');

  if (!(file instanceof Blob) || !isUploadFolder(folder)) {
    return json({ error: 'Envoi incomplet.' }, 400);
  }

  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return json({ error: 'Ce fichier dépasse 4 Mo, même compressé.' }, 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);

  if (!kind) return json({ error: 'Formats acceptés : JPG, PNG ou WEBP.' }, 415);

  try {
    const url = await saveImage(
      buildObjectPath(folder, scope, kind),
      bytes,
      IMAGE_TYPES[kind].mime,
    );
    return json({ url }, 201);
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return json({ error: error.message }, 503);

    console.error('[envoi] stockage en échec', error);
    return json({ error: 'Le stockage n’a pas accepté la photo. Réessayez.' }, 502);
  }
}
