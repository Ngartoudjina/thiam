import type { NextConfig } from 'next';

/** Hôte Supabase, extrait de l'URL du projet lorsqu'elle est renseignée. */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

/**
 * En-têtes de sécurité appliqués à toutes les routes.
 * Nécessaires pour viser 100 en « Best Practices » sur Lighthouse.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Les visuels téléversés depuis le tableau de bord sont servis par
    // Supabase Storage ; ils restent optimisés par `next/image`.
    remotePatterns: [
      { protocol: 'https', hostname: 'tile.openstreetmap.org', pathname: '/**' },
      ...(supabaseHost
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHost,
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
    ],
    // Tuiles du plan de situation : mises en cache par notre serveur, la
    // charge sur OpenStreetMap reste négligeable.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 31_536_000,
  },

  experimental: {
    // Ne charge que les icônes réellement importées : évite d'embarquer
    // l'intégralité de lucide-react dans le bundle client.
    optimizePackageImports: ['lucide-react', 'framer-motion'],

    /**
     * Cache de navigation du routeur.
     *
     * Next réutilise le rendu déjà reçu pendant ces durées : revenir en
     * arrière, ou repasser par une page visitée, devient instantané au lieu de
     * redemander la charge au serveur. Les pages du site étant statiques et
     * invalidées par étiquette à chaque modification du tableau de bord, trois
     * minutes ne présentent aucun risque de contenu périmé.
     */
    staleTimes: {
      static: 180,
      dynamic: 30,
    },
  },

  async headers() {
    return [
      { source: '/:path*', headers: [...securityHeaders] },

      /**
       * Photographies et logotype livrés avec le site.
       *
       * Leur contenu ne change jamais sous une même adresse — un remplacement
       * passe par le tableau de bord et produit un nouveau chemin. On peut donc
       * les déclarer immuables : le navigateur ne les redemande plus jamais.
       */
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/brand/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
