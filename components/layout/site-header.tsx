'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSiteContent } from '@/components/providers/site-content-provider';
import { BrandLockup } from '@/components/layout/brand-lockup';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { PhoneIcon, WhatsAppIcon } from '@/components/common/icons';
import { useScrollState } from '@/hooks/use-scroll-state';
import { PRIMARY_NAV, ROUTES } from '@/constants/navigation';
import { WHATSAPP_INTENTS } from '@/constants/site';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

/**
 * Barre de navigation.
 *
 * Sur l'accueil elle se pose en transparence sur le hero nocturne puis prend
 * un voile flouté au défilement ; sur les pages ivoire elle est pleine dès le
 * chargement, comme dans la maquette (écrans 1a, 1e et 1f).
 */
export function SiteHeader() {
  const { contact, links } = useSiteContent();
  const pathname = usePathname();
  const { isScrolled } = useScrollState();

  const isOverHero = pathname === ROUTES.home;
  /*
   * L'encre claire n'est justifiée que sur la photographie du hero. Dès que
   * la barre prend son fond beige au défilement, elle repasse en encre sombre
   * — sinon le logotype blanc disparaissait dans le beige.
   */
  /*
   * Encre sombre en toutes circonstances.
   *
   * La direction blanc / beige / or a supprimé les aplats nocturnes : le haut
   * du hero est désormais beige, et non plus une photographie. Un logotype
   * clair y disparaissait purement et simplement.
   */
  const theme: Theme = 'light';

  const isActive = (href: string): boolean =>
    href === ROUTES.home ? pathname === href : pathname.startsWith(href) && href !== '/#';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-80 transition-[background-color,backdrop-filter,border-color] duration-(--duration-state) ease-out',
        'border-b',
        // La transparence sur le hero est réservée au grand écran : en mobile,
        // la maquette pose la barre sur un aplat nocturne, au-dessus de la photo.
        isOverHero
          ? isScrolled
            ? 'border-rule-dark bg-obsidian/90 backdrop-blur-xl'
            : 'border-transparent bg-obsidian lg:bg-transparent'
          : isScrolled
            ? 'border-rule-light bg-ivory/90 backdrop-blur-xl'
            : 'border-rule-light bg-ivory',
      )}
    >
      <div className="flex h-15 items-center justify-between gutter lg:h-26">
        <MobileMenu theme={theme} />

        <BrandLockup theme={theme} size="sm" priority className="lg:hidden" />
        <BrandLockup theme={theme} size="md" priority className="hidden lg:flex" />

        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex lg:items-center lg:gap-10"
        >
          {PRIMARY_NAV.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative py-1 text-caption tracking-(--tracking-nav) uppercase',
                  'transition-colors duration-(--duration-state) ease-out',
                  active ? 'text-ink' : 'text-stone hover:text-gold-ink',
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -bottom-1 left-0 h-px w-full origin-left transition-transform duration-(--duration-state) ease-out',
                    'bg-gold-dim',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href={links.phoneHref}
            className={cn(
              'hidden text-meta font-normal tracking-[0.06em] transition-colors duration-(--duration-state) ease-out xl:block',
              'text-stone hover:text-gold-ink',
            )}
          >
            {contact.phoneDisplay}
          </a>

          <a
            href={links.phoneHref}
            data-touch-target
            aria-label={`Appeler le ${contact.phoneDisplay}`}
            className={cn('flex size-11 items-center justify-center text-ink lg:hidden')}
          >
            <PhoneIcon size={19} />
          </a>

          <a
            href={links.whatsappWithMessage(WHATSAPP_INTENTS.appointment)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'hidden items-center gap-2.5 px-[22px] py-3.5 text-label font-medium tracking-(--tracking-button) uppercase lg:flex',
              'transition-[background,color] duration-(--duration-state) ease-out',
              'bg-gold-gradient text-cacao hover:bg-gold-gradient-hover',
            )}
          >
            <WhatsAppIcon size={14} />
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
