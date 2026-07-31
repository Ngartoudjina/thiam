import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';

import { fontVariables } from '@/app/fonts';
import { JsonLd } from '@/components/common/json-ld';
import { AppProviders } from '@/components/providers/app-providers';
import { SiteContentProvider } from '@/components/providers/site-content-provider';
import { SITE } from '@/constants/site';
import { getCollections, getServices, getSiteSettings } from '@/services/content';
import { buildJewelryStoreSchema, buildWebsiteSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Bijoutier joaillier à Cotonou`,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: '/' },
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Bijouterie',
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
  ],
  colorScheme: 'light',
};

/**
 * Mise en page racine.
 *
 * Elle ne porte que le socle commun au site vitrine et au tableau de bord :
 * fontes, styles et fournisseurs. La chrome du site public (barre de
 * navigation, barre d'action mobile) vit dans `app/(site)/layout.tsx`, de sorte
 * que `/admin` n'en hérite pas.
 */
export default async function RootLayout({ children }: { readonly children: ReactNode }) {
  const [settings, services, collections] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getCollections(),
  ]);

  return (
    <html lang="fr" className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
          Marque le document comme « JavaScript disponible » avant la première
          peinture. Les états masqués des révélations en dépendent : sans
          script, le contenu reste visible plutôt que d'être escamoté.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      {/*
        `suppressHydrationWarning` : certaines extensions de navigateur —
        Grammarly en tête, avec `data-gr-ext-installed` — ajoutent leurs propres
        attributs sur `<body>` avant que React ne s'hydrate. L'écart signalé ne
        vient donc pas du rendu, et il ne concerne que cet élément : les vraies
        divergences d'hydratation restent signalées partout ailleurs.
      */}
      <body className="antialiased" suppressHydrationWarning>
        <JsonLd
          id="schema-boutique"
          data={buildJewelryStoreSchema({
            contact: settings.contact,
            hours: settings.hours,
            services,
            collections,
          })}
        />
        <JsonLd id="schema-site" data={buildWebsiteSchema()} />

        <SiteContentProvider contact={settings.contact} hours={settings.hours}>
          <AppProviders>{children}</AppProviders>
        </SiteContentProvider>
      </body>
    </html>
  );
}
