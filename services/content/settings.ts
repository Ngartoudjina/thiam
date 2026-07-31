import 'server-only';

import { unstable_cache } from 'next/cache';
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_HOURS,
  DEFAULT_STATS,
} from '@/constants/defaults';
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from '@/lib/cache';
import {
  aboutSchema,
  contactSettingsSchema,
  heroSchema,
  hoursSchema,
  statsSchema,
  SETTING_KEYS,
  type AboutContent,
  type ContactSettings,
  type HeroContent,
  type HoursContent,
  type StatsContent,
} from '@/lib/schemas/content';
import { createPublicSupabase } from '@/lib/supabase/server';

export interface SiteSettings {
  readonly hero: HeroContent;
  readonly about: AboutContent;
  readonly contact: ContactSettings;
  readonly hours: HoursContent;
  readonly stats: StatsContent;
}

const FALLBACK: SiteSettings = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  contact: DEFAULT_CONTACT,
  hours: DEFAULT_HOURS,
  stats: DEFAULT_STATS,
};

/**
 * Blocs singuliers du site.
 *
 * Chaque valeur est repassée par son schéma : un JSON incomplet ou modifié à
 * la main en base ne casse jamais le rendu, la valeur de repli prend le relais
 * pour la seule clé fautive.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createPublicSupabase();
    if (!supabase) return FALLBACK;

    const { data, error } = await supabase.from('settings').select('key, value');
    if (error || !data) return FALLBACK;

    const byKey = new Map(data.map((row) => [row.key, row.value]));

    const parse = <T>(
      key: string,
      schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
      fallback: T,
    ): T => {
      if (!byKey.has(key)) return fallback;
      const result = schema.safeParse(byKey.get(key));
      return result.success && result.data !== undefined ? result.data : fallback;
    };

    return {
      hero: parse(SETTING_KEYS.hero, heroSchema, FALLBACK.hero),
      about: parse(SETTING_KEYS.about, aboutSchema, FALLBACK.about),
      contact: parse(SETTING_KEYS.contact, contactSettingsSchema, FALLBACK.contact),
      hours: parse(SETTING_KEYS.hours, hoursSchema, FALLBACK.hours),
      stats: parse(SETTING_KEYS.stats, statsSchema, FALLBACK.stats),
    };
  },
  ['reglages-publics'],
  { tags: [CACHE_TAGS.settings], revalidate: CONTENT_REVALIDATE_SECONDS },
);

/** Liens de contact dérivés des réglages, prêts à poser dans un `href`. */
export function contactLinks(contact: ContactSettings) {
  const wa = `https://wa.me/${contact.whatsappNumber}`;

  return {
    phoneHref: `tel:${contact.phoneE164}`,
    whatsappHref: wa,
    whatsappWithMessage: (message: string): string => `${wa}?text=${encodeURIComponent(message)}`,
    mailHref: `mailto:${contact.email}`,
    directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      contact.mapsQuery || `${contact.city}, ${contact.country}`,
    )}`,
    cityCountry: `${contact.city}, ${contact.country}`,
  } as const;
}
