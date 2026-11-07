'use server';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DEFAULT_VISUALS } from '@/constants/defaults';
import { CACHE_TAGS } from '@/lib/cache';
import type { Database } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { isAllowedImageSource } from '@/lib/media-source';
import {
  SETTING_KEYS,
  aboutSchema,
  catalogSchema,
  contactSettingsSchema,
  heroSchema,
  hoursSchema,
  statsSchema,
  visualsSchema,
  type SettingKey,
  type VisualsContent,
} from '@/lib/schemas/content';
import { deleteImages } from '@/lib/storage';
import {
  failure,
  publishChanges,
  runAction,
  success,
  type ActionResult,
} from '@/services/admin/action-result';
import { staffDb } from '@/services/admin/repository';

/** Écrit une clé de `settings` après validation, et publie le changement. */
async function writeSetting(
  db: Database,
  key: SettingKey,
  value: unknown,
  message: string,
): Promise<ActionResult> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updated_at: sql`now()` } });

  publishChanges(CACHE_TAGS.settings);
  return success(message);
}

async function readSetting(db: Database, key: SettingKey): Promise<unknown> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return row?.value;
}

const readJson = (formData: FormData, field: string): unknown => {
  const raw = formData.get(field);
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 100_000) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

const fieldErrors = (error: z.ZodError) => z.flattenError(error).fieldErrors;

/** Une image enregistrée doit venir du stockage du site, ou être vide. */
const isStorablePath = (path: string): boolean => path === '' || isAllowedImageSource(path);

/* -------------------------------------------------------------------------- */
/*  Bandeau d'accueil                                                          */
/* -------------------------------------------------------------------------- */

export async function saveHeroAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = heroSchema.safeParse({
      eyebrow: formData.get('eyebrow'),
      titleLine1: formData.get('titleLine1'),
      titleLine2: formData.get('titleLine2'),
      description: formData.get('description'),
      descriptionMobile: formData.get('descriptionMobile') ?? '',
      primaryCta: { label: formData.get('primaryLabel'), href: formData.get('primaryHref') },
      secondaryCta: { label: formData.get('secondaryLabel'), href: formData.get('secondaryHref') },
      // La grande photo se gère désormais dans « Visuels » (emplacement heroMain).
      imagePath: '',
      imageAlt: '',
    });

    if (!parsed.success) return failure('Vérifiez les champs.', fieldErrors(parsed.error));

    const db = await staffDb();

    /*
     * Reprise d'une ancienne saisie : la photo déposée jadis dans ce
     * formulaire n'était jamais affichée. Si l'emplacement « heroMain » est
     * vide, elle y est reportée avant d'être retirée d'ici.
     */
    const current = heroSchema.safeParse(await readSetting(db, SETTING_KEYS.hero));
    const legacyPath = current.success ? current.data.imagePath : '';

    if (legacyPath && isAllowedImageSource(legacyPath)) {
      const visuals = visualsSchema.safeParse(await readSetting(db, SETTING_KEYS.visuals));
      const base: VisualsContent = visuals.success ? visuals.data : DEFAULT_VISUALS;

      if (!base.heroMain.path) {
        const alt = (current.success && current.data.imageAlt) || base.heroMain.alt;
        await writeSetting(
          db,
          SETTING_KEYS.visuals,
          { ...base, heroMain: { ...base.heroMain, path: legacyPath, alt } },
          'Visuels repris.',
        );
      }
    }

    return writeSetting(db, SETTING_KEYS.hero, parsed.data, 'Bandeau mis à jour.');
  });
}

/* -------------------------------------------------------------------------- */
/*  Chiffres clés                                                              */
/* -------------------------------------------------------------------------- */

export async function saveStatsAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = statsSchema.safeParse({ items: readJson(formData, 'items') });
    if (!parsed.success) return failure('Vérifiez les chiffres saisis.', fieldErrors(parsed.error));

    const db = await staffDb();
    return writeSetting(db, SETTING_KEYS.stats, parsed.data, 'Chiffres mis à jour.');
  });
}

/* -------------------------------------------------------------------------- */
/*  Histoire de la maison                                                      */
/* -------------------------------------------------------------------------- */

export async function saveAboutAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = aboutSchema.safeParse({
      eyebrow: formData.get('eyebrow'),
      titleLine1: formData.get('titleLine1'),
      titleLine2: formData.get('titleLine2'),
      description: formData.get('description'),
      quote: formData.get('quote'),
      quoteAuthor: formData.get('quoteAuthor'),
      portraitPath: formData.get('portraitPath') ?? '',
      portraitAlt: formData.get('portraitAlt') ?? '',
      milestones: readJson(formData, 'milestones') ?? [],
    });

    if (!parsed.success) return failure('Vérifiez les champs.', fieldErrors(parsed.error));
    if (!isStorablePath(parsed.data.portraitPath)) {
      return failure('Le portrait doit être déposé depuis ce formulaire.');
    }

    const db = await staffDb();
    const current = aboutSchema.safeParse(await readSetting(db, SETTING_KEYS.about));
    const previousPath = current.success ? current.data.portraitPath : '';

    const result = await writeSetting(db, SETTING_KEYS.about, parsed.data, 'Histoire mise à jour.');

    if (result.ok && previousPath && previousPath !== parsed.data.portraitPath) {
      await deleteImages([previousPath]);
    }

    return result;
  });
}

/* -------------------------------------------------------------------------- */
/*  Coordonnées et horaires                                                    */
/* -------------------------------------------------------------------------- */

export async function saveContactAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = contactSettingsSchema.safeParse({
      phoneDisplay: formData.get('phoneDisplay'),
      phoneE164: formData.get('phoneE164'),
      whatsappNumber: formData.get('whatsappNumber'),
      email: formData.get('email'),
      streetAddress: formData.get('streetAddress') ?? '',
      city: formData.get('city'),
      country: formData.get('country'),
      mapsQuery: formData.get('mapsQuery') ?? '',
      mapsEmbedSrc: formData.get('mapsEmbedSrc') ?? '',
      instagram: formData.get('instagram') ?? '',
      facebook: formData.get('facebook') ?? '',
    });

    if (!parsed.success) return failure('Vérifiez les champs.', fieldErrors(parsed.error));

    const db = await staffDb();
    return writeSetting(db, SETTING_KEYS.contact, parsed.data, 'Coordonnées mises à jour.');
  });
}

export async function saveHoursAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = hoursSchema.safeParse({
      summary: formData.get('summary'),
      days: readJson(formData, 'days') ?? [],
    });

    if (!parsed.success) return failure('Vérifiez les horaires saisis.', fieldErrors(parsed.error));

    const db = await staffDb();
    return writeSetting(db, SETTING_KEYS.hours, parsed.data, 'Horaires mis à jour.');
  });
}

/* -------------------------------------------------------------------------- */
/*  Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

export async function saveCatalogAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = catalogSchema.safeParse({ totalInStore: formData.get('totalInStore') });
    if (!parsed.success) return failure('Vérifiez le nombre saisi.', fieldErrors(parsed.error));

    const db = await staffDb();
    return writeSetting(db, SETTING_KEYS.catalog, parsed.data, 'Catalogue mis à jour.');
  });
}

/* -------------------------------------------------------------------------- */
/*  Visuels fixes                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Remplace les photographies des emplacements de composition.
 *
 * Les anciennes images sont supprimées du stockage une fois les nouvelles
 * enregistrées : remplacer une photo dix fois ne laisse pas neuf fichiers
 * orphelins derrière.
 */
export async function saveVisualsAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = visualsSchema.safeParse(readJson(formData, 'visuals'));
    if (!parsed.success) return failure('Vérifiez les champs.', fieldErrors(parsed.error));

    if (!Object.values(parsed.data).every((visual) => isStorablePath(visual.path))) {
      return failure('Une des images ne provient pas du stockage du site.');
    }

    const db = await staffDb();
    const current = visualsSchema.safeParse(await readSetting(db, SETTING_KEYS.visuals));

    const result = await writeSetting(
      db,
      SETTING_KEYS.visuals,
      parsed.data,
      'Visuels enregistrés. Le site est à jour.',
    );
    if (!result.ok || !current.success) return result;

    // Ménage : uniquement les fichiers qu'aucun emplacement ne référence plus.
    const stillUsed = new Set(Object.values(parsed.data).map((visual) => visual.path));
    const orphans = Object.values(current.data)
      .map((visual) => visual.path)
      .filter((path) => path && !stillUsed.has(path));

    await deleteImages(orphans);
    return result;
  });
}
