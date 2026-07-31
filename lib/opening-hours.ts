import { DEFAULT_HOURS } from '@/constants/defaults';
import { LOCATION } from '@/constants/site';
import type { HoursContent } from '@/lib/schemas/content';
import type { WeekdayIndex } from '@/types';

export interface ShopStatus {
  readonly isOpen: boolean;
  /** Heure de fermeture du créneau en cours, si la boutique est ouverte. */
  readonly closesAt: string | null;
  readonly label: string;
}

type OpeningDayLike = HoursContent['days'][number];

const SCHEMA_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const toMinutes = (time: string): number => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
};

/** Heure locale de Cotonou, indépendante du fuseau du visiteur. */
export function getLocalShopTime(now: Date = new Date()): {
  weekday: WeekdayIndex;
  minutes: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: LOCATION.timeZone,
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const weekdayLabel = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

  const weekdayMap: Record<string, WeekdayIndex> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    weekday: weekdayMap[weekdayLabel] ?? 0,
    minutes: (hour % 24) * 60 + minute,
  };
}

/**
 * Détermine si la boutique est ouverte à l'instant donné, heure de Cotonou.
 * Les horaires sont fournis par le tableau de bord ; à défaut, ceux de la maquette.
 */
export function getShopStatus(
  days: readonly OpeningDayLike[] = DEFAULT_HOURS.days,
  now: Date = new Date(),
): ShopStatus {
  const { weekday, minutes } = getLocalShopTime(now);
  const day = days.find((entry) => entry.weekdays.includes(weekday));

  if (!day || day.byAppointmentOnly || day.ranges.length === 0) {
    return { isOpen: false, closesAt: null, label: 'Sur rendez-vous' };
  }

  const current = day.ranges.find(
    (range) => minutes >= toMinutes(range.opensAt) && minutes < toMinutes(range.closesAt),
  );

  if (!current) {
    return { isOpen: false, closesAt: null, label: `Fermé · ouvre ${day.display}` };
  }

  const closesAt = current.closesAt.replace(':00', 'h').replace(':', 'h');
  return { isOpen: true, closesAt, label: `Ouvert · ferme à ${closesAt}` };
}

/** Format `openingHoursSpecification` attendu par schema.org. */
export function toSchemaOpeningHours(
  days: readonly OpeningDayLike[] = DEFAULT_HOURS.days,
): ReadonlyArray<{
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: readonly string[];
  opens: string;
  closes: string;
}> {
  return days.flatMap((day) =>
    day.ranges.map((range) => ({
      '@type': 'OpeningHoursSpecification' as const,
      dayOfWeek: day.weekdays.map((weekday) => SCHEMA_WEEKDAYS[weekday as WeekdayIndex]),
      opens: range.opensAt,
      closes: range.closesAt,
    })),
  );
}
