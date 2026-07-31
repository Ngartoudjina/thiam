import Link from 'next/link';
import { BrandLockup } from '@/components/layout/brand-lockup';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/common/icons';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { FOOTER_NAV, LEGAL_NAV, ROUTES } from '@/constants/navigation';
import { OPENING_SUMMARY, SITE } from '@/constants/site';
import { contactLinks } from '@/services/content';
import type { ContactSettings } from '@/lib/schemas/content';
import type { Collection } from '@/types';
import { cn } from '@/lib/utils';

const SOCIAL_LINK_CLASSES = cn(
  'flex size-11 items-center justify-center border border-[rgb(247_244_239/0.18)] text-on-dark-soft',
  'transition-colors duration-(--duration-state) ease-out hover:border-gold hover:text-gold-light',
);

/** Pied de page complet — écran d'accueil de la maquette. */
interface SiteFooterProps {
  readonly contact: ContactSettings;
  readonly collections: readonly Collection[];
}

export function SiteFooter({ contact, collections }: SiteFooterProps) {
  const links = contactLinks(contact);

  // La colonne « Collections » suit les univers publiés dans le tableau de bord.
  const navGroups = FOOTER_NAV.map((group) =>
    group.title === 'Collections'
      ? {
          ...group,
          links: collections.map((collection) => ({
            label: collection.name,
            href: `${ROUTES.collections}?univers=${collection.slug}`,
          })),
        }
      : group,
  );

  return (
    <footer className="border-t border-rule-dark bg-obsidian gutter pt-[clamp(3.25rem,2rem+5vw,5.625rem)] pb-11">
      <div className="grid gap-12 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-15 lg:pb-[70px]">
        <div>
          <BrandLockup theme="dark" className="mb-6" />
          <p className="mb-7 max-w-[18.75rem] text-body-sm leading-[1.75] font-light text-on-dark-faint">
            Bijoutier joaillier à {contact.city}. Or 18, 21 et 24 carats, diamants, alliances et
            créations sur mesure.
          </p>
          <div className="flex gap-3">
            <a
              href={links.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={SOCIAL_LINK_CLASSES}
            >
              <span className="sr-only">Écrire à la boutique sur WhatsApp</span>
              <WhatsAppIcon size={15} />
            </a>
            {contact.instagram ? (
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL_LINK_CLASSES}
              >
                <span className="sr-only">Suivre la maison sur Instagram</span>
                <InstagramIcon size={15} />
              </a>
            ) : null}
            {contact.facebook ? (
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL_LINK_CLASSES}
              >
                <span className="sr-only">Suivre la maison sur Facebook</span>
                <FacebookIcon size={15} />
              </a>
            ) : null}
          </div>
        </div>

        {navGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-6 font-sans text-micro tracking-(--tracking-wordmark) text-gold-dim uppercase">
              {group.title}
            </h2>
            <ul className="flex flex-col gap-3.5">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-body-sm font-light text-on-dark-soft transition-colors duration-(--duration-state) ease-out hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="mb-6 font-sans text-micro tracking-(--tracking-wordmark) text-gold-dim uppercase">
            Boutique
          </h2>
          <p className="mb-4.5 text-body-sm leading-[1.8] font-light text-on-dark-soft">
            {links.cityCountry}
            <br />
            {OPENING_SUMMARY}
          </p>
          <a
            href={links.phoneHref}
            className="mb-2 block font-serif text-2xl font-light text-ivory transition-colors duration-(--duration-state) ease-out hover:text-gold-light"
          >
            {contact.phoneDisplay}
          </a>
          <a
            href={links.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta tracking-(--tracking-label) text-gold uppercase transition-colors duration-(--duration-state) ease-out hover:text-gold-pale"
          >
            WhatsApp direct →
          </a>
        </div>
      </div>

      <div className="border-t border-[rgb(247_244_239/0.09)] py-10">
        <NewsletterForm />
      </div>

      <div className="flex flex-col gap-5 border-t border-[rgb(247_244_239/0.09)] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption-lg font-light text-on-dark-faint">
          © {SITE.copyrightYear} {SITE.name} — {links.cityCountry}. Tous droits réservés.
        </p>
        <ul className="flex flex-wrap gap-7">
          {LEGAL_NAV.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-caption-lg font-light text-on-dark-faint transition-colors duration-(--duration-state) ease-out hover:text-gold-light"
              >
                {link.label}
              </Link>
            </li>
          ))}
          {/* Porte d'entrée de la maison. Discrète, mais toujours au même
              endroit — la page est en `noindex` et protégée par la session. */}
          <li>
            <Link
              href={ADMIN_ROUTES.dashboard}
              rel="nofollow"
              className="text-caption-lg font-light text-[rgb(247_244_239/0.32)] transition-colors duration-(--duration-state) ease-out hover:text-gold-light"
            >
              Espace maison
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
