import { extname } from 'node:path';
import { readLocalImage, storageDriver } from '@/lib/storage';

export const runtime = 'nodejs';

const MIME: Readonly<Record<string, string>> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

/**
 * Images du stockage local (`STORAGE_DRIVER=local`, ou développement sans
 * Vercel Blob). Chaque fichier porte un nom unique : il est servi comme
 * immuable, et le navigateur ne le redemande jamais.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chemin: string[] }> },
): Promise<Response> {
  if (storageDriver() !== 'local') return new Response('Introuvable', { status: 404 });

  const { chemin } = await params;
  const objectPath = chemin.join('/');
  const bytes = await readLocalImage(objectPath);

  if (!bytes) return new Response('Introuvable', { status: 404 });

  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': MIME[extname(objectPath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
