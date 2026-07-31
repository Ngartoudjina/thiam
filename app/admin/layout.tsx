import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { SetupNotice } from '@/components/admin/setup-notice';
import { ThemeScript } from '@/components/admin/theme-toggle';
import { SUPABASE } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};

/** Le tableau de bord lit toujours l'état réel de la base, jamais un cache. */
export const dynamic = 'force-dynamic';

/**
 * Socle du segment `/admin` : thème, notifications, garde d'installation.
 * Le contrôle de session vit un cran plus bas, dans le groupe `(dashboard)`,
 * afin que la page de connexion n'en hérite pas.
 */
export default function AdminSegmentLayout({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <ThemeScript />
      {SUPABASE.isConfigured ? children : <SetupNotice />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              'rounded-lg border border-panel-border bg-panel text-panel-ink shadow-(--shadow-panel-lg) dark:border-panel-dark-border dark:bg-panel-dark-muted dark:text-panel-dark-ink',
          },
        }}
      />
    </>
  );
}
