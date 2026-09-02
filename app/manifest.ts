import type { MetadataRoute } from 'next';
import { SITE } from '@/constants/site';

/**
 * Manifeste d'application.
 *
 * L'icône pointe vers la route `/icon`, générée à la volée en 64 px, et non
 * vers le logotype source de 500 px : celui-ci pesait 57 ko et était téléchargé
 * dès le premier affichage — la ressource la plus lourde de la page, pour une
 * vignette que le visiteur ne voit qu'à l'installation.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    lang: SITE.language,
    start_url: '/',
    display: 'standalone',
    background_color: '#fffcf7',
    theme_color: '#fffcf7',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
