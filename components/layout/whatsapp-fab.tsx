'use client';

import { WhatsAppIcon } from '@/components/common/icons';
import { useSiteContent } from '@/components/providers/site-content-provider';
import { useScrollState } from '@/hooks/use-scroll-state';
import { WHATSAPP_INTENTS } from '@/constants/site';
import { cn } from '@/lib/utils';

/**
 * Appel à l'action permanent.
 *
 * Sur grand écran, WhatsApp n'était atteignable que depuis la barre de
 * navigation ou le bas de page : un visiteur au milieu du parcours devait
 * remonter. Ce bouton reste à portée, en bas à droite, sans jamais recouvrir
 * de contenu — la colonne y est libre à toutes les largeurs.
 *
 * En mobile, la barre d'action existante joue déjà ce rôle : le bouton s'y
 * efface pour ne pas la doubler.
 */
export function WhatsAppFab() {
  const { links } = useSiteContent();
  const { isScrolled } = useScrollState({ scrolledAfter: 160 });

  return (
    <a
      href={links.whatsappWithMessage(WHATSAPP_INTENTS.appointment)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire à la boutique sur WhatsApp"
      className={cn(
        'group fixed right-6 bottom-6 z-70 hidden items-center gap-3 lg:flex',
        'bg-gold-gradient hover:bg-gold-gradient-hover rounded-full py-4 pr-6 pl-4.5',
        'shadow-[0_14px_34px_-12px_rgb(22_18_15/0.55)] ring-1 ring-[rgb(255_252_247/0.35)]',
        'transition-[opacity,transform,background] duration-(--duration-state) ease-out',
        'hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        // Il n'apparaît qu'une fois le hero dépassé : le premier écran garde
        // ses propres appels à l'action, sans redondance.
        isScrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <WhatsAppIcon size={20} className="text-cacao" />
      <span className="text-label font-medium tracking-(--tracking-button) text-cacao uppercase">
        Écrire sur WhatsApp
      </span>
    </a>
  );
}
