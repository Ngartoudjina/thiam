import { z } from 'zod';

/**
 * Provenances d'image admises.
 *
 * `next/image` refuse — en levant une erreur de rendu — toute adresse dont
 * l'hôte n'est pas déclaré dans `next.config.ts`. Une adresse arbitraire
 * enregistrée en base ferait donc tomber la page : on n'accepte que les
 * visuels livrés avec le site, ceux du stockage local, et ceux de Vercel Blob.
 */
export function isAllowedImageSource(src: string): boolean {
  if (/^\/(?:images|media)\/[A-Za-z0-9/._-]+$/.test(src) && !src.includes('..')) return true;

  try {
    const url = new URL(src);
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export const imageSourceSchema = z
  .string()
  .trim()
  .max(600)
  .refine(isAllowedImageSource, 'Cette image ne provient pas du stockage du site.');
