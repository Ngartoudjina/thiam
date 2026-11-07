import Link from 'next/link';
import { PageHeader } from '@/components/admin/ui/primitives';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { RequestsInbox } from '@/features/admin/requests-inbox';
import { cn } from '@/lib/utils';
import { countNewContactRequests, listContactRequests } from '@/services/admin/queries';

const FILTERS = [
  { value: 'new', label: 'Nouvelles' },
  { value: 'handled', label: 'Traitées' },
  { value: 'all', label: 'Toutes' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

const isFilter = (value: unknown): value is Filter =>
  FILTERS.some((filter) => filter.value === value);

export default async function AdminRequestsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const active: Filter = isFilter(filtre) ? filtre : 'new';

  const [requests, pending] = await Promise.all([
    listContactRequests(active),
    countNewContactRequests(),
  ]);

  return (
    <>
      <PageHeader
        title="Demandes"
        description="Les messages envoyés par le formulaire de contact. Rappelez, écrivez sur WhatsApp, puis marquez la demande comme traitée."
      />

      <nav aria-label="Filtrer les demandes" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={
              filter.value === 'new'
                ? ADMIN_ROUTES.requests
                : `${ADMIN_ROUTES.requests}?filtre=${filter.value}`
            }
            aria-current={filter.value === active ? 'page' : undefined}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors duration-150 ease-out',
              filter.value === active
                ? 'border-panel-ink bg-panel-ink text-panel dark:border-panel-dark-ink dark:bg-panel-dark-ink dark:text-panel-dark'
                : 'border-panel-border text-panel-soft hover:text-panel-ink dark:border-panel-dark-border dark:text-panel-dark-soft dark:hover:text-panel-dark-ink',
            )}
          >
            {filter.label}
            {filter.value === 'new' && pending > 0 ? ` · ${pending}` : ''}
          </Link>
        ))}
      </nav>

      <RequestsInbox requests={requests} />
    </>
  );
}
