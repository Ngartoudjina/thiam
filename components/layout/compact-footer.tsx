import { DeveloperCredit } from '@/components/layout/developer-credit';
import Link from 'next/link';
import { BrandLockup } from '@/components/layout/brand-lockup';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { WhatsAppIcon } from '@/components/common/icons';
import { SITE } from '@/constants/site';
import { contactLinks, getSiteSettings } from '@/services/content';
import type { ContactSettings, HoursContent } from '@/lib/schemas/content';

interface CompactFooterProps {
  readonly contact?: ContactSettings;
  readonly hours?: HoursContent;
  /** Ligne médiane : résumé d'horaires (Collections) ou mention légale (Contact). */
  readonly variant?: 'hours' | 'copyright';
}

/**
 * Bandeau de pied de page des pages intérieures — écrans Collections et
 * Contact de la maquette : logotype, une ligne d'information, contact direct.
 *
 * Sans coordonnées fournies par la page (404, pages légales), il les lit
 * lui-même : jamais les valeurs figées de la maquette, qui ne suivraient pas
 * une modification faite dans le tableau de bord.
 */
export async function CompactFooter({ variant = 'hours', ...props }: CompactFooterProps) {
  const settings = props.contact && props.hours ? null : await getSiteSettings();
  const contact = props.contact ?? settings!.contact;
  const hours = props.hours ?? settings!.hours;
  const links = contactLinks(contact);
  return (
    /* Même réserve que le pied complet : la barre d'action mobile est fixe. */
    <footer className="flex flex-col items-start gap-7 border-t border-rule-dark bg-obsidian gutter pt-14 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-14">
      <BrandLockup theme="light" />

      <div className="flex flex-col gap-1.5">
        <p className="text-meta-lg font-normal text-on-dark-faint">
          {variant === 'hours'
            ? `${links.cityCountry} · ${hours.summary}`
            : `© ${SITE.copyrightYear} ${SITE.name} — ${links.cityCountry}`}
        </p>
        <DeveloperCredit />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Link
          href={ADMIN_ROUTES.dashboard}
          rel="nofollow"
          className="text-caption-lg font-normal text-[rgb(22_18_15/0.32)] transition-colors duration-(--duration-state) ease-out hover:text-gold-light"
        >
          Espace maison
        </Link>
        <a
          href={links.phoneHref}
          className="font-serif text-[1.375rem] font-light text-ink transition-colors duration-(--duration-state) ease-out hover:text-gold-light"
        >
          {contact.phoneDisplay}
        </a>
        <a
          href={links.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-gold-gradient px-[22px] py-3.5 text-label font-medium tracking-(--tracking-button) text-cacao uppercase transition-[background] duration-(--duration-state) ease-out hover:bg-gold-gradient-hover"
        >
          <WhatsAppIcon size={14} />
          WhatsApp
        </a>
      </div>
    </footer>
  );
}
