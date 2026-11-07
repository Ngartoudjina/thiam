import Link from 'next/link';
import { AdminButton, PageHeader, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { ADMIN_NAV_ITEMS, ADMIN_ROUTES } from '@/constants/admin-navigation';
import { RefreshSiteButton } from '@/components/admin/refresh-site-button';
import { SeedPanel } from '@/features/admin/seed-panel';
import { getCurrentStaff } from '@/lib/auth';
import { countNewContactRequests, getContentSummary } from '@/services/admin/queries';

const LABELS: Record<string, { readonly label: string; readonly href: string }> = {
  collections: { label: 'Collections', href: ADMIN_ROUTES.collections },
  pieces: { label: 'Pièces en vitrine', href: ADMIN_ROUTES.pieces },
  gallery_images: { label: 'Photos de la galerie', href: ADMIN_ROUTES.gallery },
  services: { label: 'Services', href: ADMIN_ROUTES.services },
  testimonials: { label: 'Témoignages', href: ADMIN_ROUTES.testimonials },
  faq: { label: 'Questions', href: ADMIN_ROUTES.faq },
};

/** Vue d'ensemble : ce qui est publié, et par où commencer. */
export default async function DashboardPage() {
  const [summary, pendingRequests, staff] = await Promise.all([
    getContentSummary(),
    countNewContactRequests(),
    getCurrentStaff(),
  ]);
  const sections = ADMIN_NAV_ITEMS.filter(
    (item) => item.href !== ADMIN_ROUTES.dashboard && (!item.adminOnly || staff?.role === 'admin'),
  );
  const isEmpty = summary.every((entry) => entry.total === 0);

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Ce que le site affiche en ce moment. Chaque modification est publiée immédiatement."
        action={<RefreshSiteButton />}
      />

      {isEmpty ? <SeedPanel /> : null}

      {pendingRequests > 0 ? (
        <Link
          href={ADMIN_ROUTES.requests}
          className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent/50 bg-accent-soft/40 px-5 py-4 transition-colors duration-150 ease-out hover:border-accent dark:border-accent/40 dark:bg-accent/10"
        >
          <span className="text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
            {pendingRequests} demande{pendingRequests > 1 ? 's' : ''} de contact en attente
          </span>
          <span className="text-[0.8125rem] text-accent-strong dark:text-accent-soft">
            Ouvrir la boîte de réception →
          </span>
        </Link>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((entry) => {
          const meta = LABELS[entry.table];
          if (!meta) return null;

          return (
            <Link
              key={entry.table}
              href={meta.href}
              className="rounded-xl border border-panel-border bg-panel p-4 transition-colors duration-150 ease-out hover:border-accent/50 dark:border-panel-dark-border dark:bg-panel-dark-muted"
            >
              <p className="text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
                {meta.label}
              </p>
              <p className="mt-2 font-sans text-2xl font-semibold text-panel-ink dark:text-panel-dark-ink">
                {entry.visible}
                <span className="ml-1.5 text-sm font-normal text-panel-faint dark:text-panel-dark-faint">
                  / {entry.total} publié{entry.total > 1 ? 's' : ''}
                </span>
              </p>
            </Link>
          );
        })}
      </div>

      <Panel>
        <PanelHeader
          title="Rubriques"
          description="Tout le contenu modifiable du site, section par section."
          action={
            <AdminButton asChild variant="secondary" size="sm">
              <Link href={ADMIN_ROUTES.collections}>Commencer par les collections</Link>
            </AdminButton>
          }
        />
        <ul className="divide-y divide-panel-border dark:divide-panel-dark-border">
          {sections.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 ease-out hover:bg-panel-muted dark:hover:bg-panel-dark-sunken"
              >
                <item.icon size={16} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
                    {item.label}
                  </span>
                  <span className="block truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
