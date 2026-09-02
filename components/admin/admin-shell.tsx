'use client';

import { ArrowLeft, ExternalLink, LogOut, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/admin/theme-toggle';
import { AdminButton } from '@/components/admin/ui/primitives';
import { ADMIN_NAV, ADMIN_ROUTES } from '@/constants/admin-navigation';
import { BRAND_MARK } from '@/constants/media';
import { ROUTES } from '@/constants/navigation';
import { SITE } from '@/constants/site';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/lib/auth';

interface AdminShellProps {
  readonly staff: StaffMember;
  readonly signOut: () => Promise<void>;
  readonly children: ReactNode;
}

/**
 * Coquille du tableau de bord : barre latérale fixe en desktop, tiroir en
 * mobile, en-tête compact. Sobre et dense, à la manière d'un outil de travail.
 */
export function AdminShell({ staff, signOut, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Le tiroir se referme dès qu'on change de page.
  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string): boolean =>
    href === ADMIN_ROUTES.dashboard ? pathname === href : pathname.startsWith(href);

  const navigation = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4" aria-label="Sections">
      {ADMIN_NAV.map((group) => (
        <div key={group.title}>
          <p className="px-2.5 pb-2 text-[0.6875rem] font-medium tracking-wide text-panel-faint uppercase dark:text-panel-dark-faint">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] transition-colors duration-150 ease-out',
                      active
                        ? 'bg-panel-sunken font-medium text-panel-ink dark:bg-panel-dark-sunken dark:text-panel-dark-ink'
                        : 'text-panel-soft hover:bg-panel-muted hover:text-panel-ink dark:text-panel-dark-soft dark:hover:bg-panel-dark-sunken dark:hover:text-panel-dark-ink',
                    )}
                  >
                    <item.icon
                      size={16}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className={active ? 'text-accent' : ''}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  // Le logotype ramène au site : c'est le geste attendu, et il évite d'avoir
  // à connaître l'URL publique pour sortir du tableau de bord.
  const brand = (
    <Link
      href={ROUTES.home}
      aria-label="Retour au site public"
      className="flex h-14 shrink-0 items-center gap-2.5 border-b border-panel-border px-4 transition-colors duration-150 ease-out hover:bg-panel-muted dark:border-panel-dark-border dark:hover:bg-panel-dark-sunken"
    >
      <Image
        src={BRAND_MARK.src}
        alt=""
        width={BRAND_MARK.width}
        height={BRAND_MARK.height}
        sizes="48px"
        aria-hidden="true"
        className="size-8 shrink-0 object-contain"
      />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[0.8125rem] font-semibold text-panel-ink dark:text-panel-dark-ink">
          {SITE.wordmark}
        </span>
        <span className="mt-0.5 text-[0.625rem] tracking-wide text-panel-faint dark:text-panel-dark-faint">
          Administration
        </span>
      </span>
    </Link>
  );

  const footer = (
    <div className="shrink-0 border-t border-panel-border p-3 dark:border-panel-dark-border">
      <div className="mb-3 flex items-center gap-2.5 px-1">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-sans text-xs font-semibold text-accent-strong dark:bg-accent/20 dark:text-accent-soft"
        >
          {staff.fullName.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.8125rem] font-medium text-panel-ink dark:text-panel-dark-ink">
            {staff.fullName}
          </span>
          <span className="block truncate text-[0.6875rem] text-panel-faint dark:text-panel-dark-faint">
            {staff.role === 'admin' ? 'Administrateur' : 'Éditeur'}
          </span>
        </span>
      </div>

      {/* Sortie franche du tableau de bord, dans le même onglet. */}
      <AdminButton asChild variant="secondary" size="sm" className="mb-3 w-full justify-start">
        <Link href={ROUTES.home}>
          <ArrowLeft size={14} strokeWidth={1.7} aria-hidden="true" />
          Retour au site
        </Link>
      </AdminButton>

      <div className="flex items-center justify-between gap-2">
        <ThemeToggle />
        <form action={signOut}>
          <AdminButton type="submit" variant="ghost" size="sm">
            <LogOut size={14} strokeWidth={1.7} aria-hidden="true" />
            Quitter
          </AdminButton>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-panel-muted text-panel-ink dark:bg-panel-dark dark:text-panel-dark-ink">
      {/* Barre latérale fixe — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-panel-border bg-panel lg:flex dark:border-panel-dark-border dark:bg-panel-dark-muted">
        {brand}
        {navigation}
        {footer}
      </aside>

      {/* Tiroir — mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-panel-ink/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-panel-border bg-panel dark:border-panel-dark-border dark:bg-panel-dark-muted">
            {brand}
            {navigation}
            {footer}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-panel-border bg-panel/85 px-4 backdrop-blur-md dark:border-panel-dark-border dark:bg-panel-dark-muted/85">
          <AdminButton
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X size={18} strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <Menu size={18} strokeWidth={1.7} aria-hidden="true" />
            )}
          </AdminButton>

          <span className="hidden text-[0.8125rem] text-panel-soft lg:block dark:text-panel-dark-soft">
            Les modifications sont publiées immédiatement sur le site.
          </span>

          <AdminButton asChild variant="secondary" size="sm">
            <a href={ROUTES.home} target="_blank" rel="noopener noreferrer">
              Voir le site
              <ExternalLink size={13} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </AdminButton>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
