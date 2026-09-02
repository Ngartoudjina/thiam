import type { ReactNode } from 'react';
import { MobileActionBar } from '@/components/layout/mobile-action-bar';
import { WhatsAppFab } from '@/components/layout/whatsapp-fab';
import { RevealObserver } from '@/components/motion/reveal-observer';
import { SiteHeader } from '@/components/layout/site-header';
import { SkipLink } from '@/components/layout/skip-link';

/**
 * Chrome du site vitrine.
 *
 * Regroupée ici plutôt que dans la mise en page racine : le tableau de bord
 * partage les fontes et les fournisseurs, mais pas la barre de navigation
 * publique ni la barre d'action WhatsApp.
 */
export default function SiteLayout({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      {/* Aucune marge ici : le hero de l'accueil passe sous la barre
          transparente, les pages intérieures compensent elles-mêmes. */}
      <main id="contenu">{children}</main>
      <MobileActionBar />
      <WhatsAppFab />
      {/* Une seule frontière client pour toutes les révélations du site. */}
      <RevealObserver />
    </>
  );
}
