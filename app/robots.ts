import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

/**
 * Le tableau de bord et les routes d'API n'ont rien à faire dans l'index :
 * ils ne répondent qu'aux personnes authentifiées, et une URL d'API indexée
 * n'apporte que des résultats sans valeur pour un visiteur.
 *
 * Le relais de tuiles cartographiques est écarté séparément : il sert des
 * images qui ne sont pas celles de la maison.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
