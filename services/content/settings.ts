import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { TOTAL_PIECES } from '@/constants/collections';
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_HOURS,
  DEFAULT_STATS,
  DEFAULT_VISUALS,
} from '@/constants/defaults';
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from '@/lib/cache';
import { settings } from '@/lib/db/schema';
import {
  SETTING_KEYS,
  aboutSchema,
  catalogSchema,
  contactSettingsSchema,
  heroSchema,
  hoursSchema,
  statsSchema,
  visualsSchema,
  type AboutContent,
  type CatalogSettings,
  type ContactSettings,
  type HeroContent,
  type HoursContent,
  type StatsContent,
  type VisualsContent,
} from '@/lib/schemas/content';
import { publicDb, readOrFallback } from '@/services/content/read';

export interface SiteSettings {
  readonly hero: HeroContent;
  readonly about: AboutContent;
  readonly contact: ContactSettings;
  readonly hours: HoursContent;
  readonly stats: StatsContent;
  readonly visuals: VisualsContent;
  readonly catalog: CatalogSettings;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  contact: DEFAULT_CONTACT,
  hours: DEFAULT_HOURS,
  stats: DEFAULT_STATS,
  visuals: DEFAULT_VISUALS,
  catalog: { totalInStore: TOTAL_PIECES },
};

interface Parser<T> {
  safeParse: (value: unknown) => { success: true; data: T } | { success: false };
}

/**
 * Lit chaque bloc à travers son schéma : un JSON incomplet ou modifié à la
 * main en base ne casse jamais le rendu, la valeur de repli prend le relais
 * pour la seule clé fautive.
 */
export function parseSettings(rows: readonly { key: string; value: unknown }[]): SiteSettings {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  const parse = <T>(key: string, schema: Parser<T>, fallback: T): T => {
    if (!byKey.has(key)) return fallback;
    const result = schema.safeParse(byKey.get(key));
    return result.success ? result.data : fallback;
  };

  const hero = parse(SETTING_KEYS.hero, heroSchema, DEFAULT_SETTINGS.hero);
  const visuals = parse(SETTING_KEYS.visuals, visualsSchema, DEFAULT_SETTINGS.visuals);

  return {
    hero,
    about: parse(SETTING_KEYS.about, aboutSchema, DEFAULT_SETTINGS.about),
    contact: parse(SETTING_KEYS.contact, contactSettingsSchema, DEFAULT_SETTINGS.contact),
    hours: parse(SETTING_KEYS.hours, hoursSchema, DEFAULT_SETTINGS.hours),
    stats: parse(SETTING_KEYS.stats, statsSchema, DEFAULT_SETTINGS.stats),
    catalog: parse(SETTING_KEYS.catalog, catalogSchema, DEFAULT_SETTINGS.catalog),
    /*
     * Ancienne saisie : la photo déposée dans le formulaire « Accueil »
     * n'était jamais affichée. Tant que l'emplacement « heroMain » est vide,
     * elle y est reprise.
     */
    visuals:
      hero.imagePath && !visuals.heroMain.path
        ? {
            ...visuals,
            heroMain: {
              ...visuals.heroMain,
              path: hero.imagePath,
              alt: hero.imageAlt || visuals.heroMain.alt,
            },
          }
        : visuals,
  };
}

const cachedSettings = unstable_cache(
  async (): Promise<SiteSettings | null> => {
    const db = publicDb();
    if (!db) return null;

    const rows = await db.select({ key: settings.key, value: settings.value }).from(settings);
    return parseSettings(rows);
  },
  ['reglages-publics'],
  { tags: [CACHE_TAGS.settings], revalidate: CONTENT_REVALIDATE_SECONDS },
);

/** Blocs singuliers du site : bandeau, histoire, coordonnées, horaires, visuels… */
export const getSiteSettings = cache((): Promise<SiteSettings> =>
  readOrFallback('réglages', cachedSettings, DEFAULT_SETTINGS),
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
