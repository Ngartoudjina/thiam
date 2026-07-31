import { DEFAULT_HOURS } from '@/constants/defaults';
import type { HoursContent } from '@/lib/schemas/content';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

/** Tableau d'horaires, décliné sur fond ivoire comme sur fond nocturne. */
export function OpeningHoursTable({
  theme = 'dark',
  className,
  days = DEFAULT_HOURS.days,
}: {
  readonly theme?: Theme;
  readonly className?: string;
  readonly days?: HoursContent['days'];
}) {
  return (
    <dl className={cn('w-full', className)}>
      {days.map((day) => (
        <div
          key={day.label}
          className={cn(
            'flex justify-between gap-4 border-b py-2.75 text-body-sm font-light',
            theme === 'dark' ? 'border-[rgb(247_244_239/0.08)]' : 'border-[rgb(22_18_15/0.1)]',
            day.byAppointmentOnly
              ? theme === 'dark'
                ? 'text-on-dark-faint'
                : 'text-clay'
              : theme === 'dark'
                ? 'text-on-dark-muted'
                : 'text-umber',
          )}
        >
          <dt>{day.label}</dt>
          <dd className="text-right">{day.display}</dd>
        </div>
      ))}
    </dl>
  );
}
