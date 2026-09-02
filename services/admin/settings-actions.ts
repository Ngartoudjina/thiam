'use server';

import { CACHE_TAGS } from '@/lib/cache';
import {
  aboutSchema,
  contactSettingsSchema,
  heroSchema,
  hoursSchema,
  statsSchema,
  visualsSchema,
  SETTING_KEYS,
} from '@/lib/schemas/content';
import {
  failure,
  publishChanges,
  runAction,
  success,
  type ActionResult,
} from '@/services/admin/action-result';
import { adminClient } from '@/services/admin/repository';
import { removeStorageObjects } from '@/services/admin/storage';

/** Écrit une clé de `settings` après validation, et publie le changement. */
async function writeSetting(key: string, value: unknown, message: string): Promise<ActionResult> {
  const supabase = await adminClient();

  const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) return failure('Enregistrement impossible.');

  publishChanges(CACHE_TAGS.settings);
  return success(message);
}

const readJson = <T>(formData: FormData, field: string): T | null => {
  const raw = formData.get(field);
  if (typeof raw !== 'string' || raw.length === 0) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

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
      primaryCta: {
        label: formData.get('primaryLabel'),
        href: formData.get('primaryHref'),
      },
      secondaryCta: {
        label: formData.get('secondaryLabel'),
        href: formData.get('secondaryHref'),
      },
      imagePath: formData.get('imagePath') ?? '',
      imageAlt: formData.get('imageAlt') ?? '',
    });

    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    const previousPath = String(formData.get('previousImagePath') ?? '');
    const result = await writeSetting(SETTING_KEYS.hero, parsed.data, 'Bandeau mis à jour.');

    if (result.ok && previousPath && previousPath !== parsed.data.imagePath) {
      await removeStorageObjects([previousPath]);
    }

    return result;
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
    const items = readJson<unknown>(formData, 'items');
    const parsed = statsSchema.safeParse({ items });

    if (!parsed.success) {
      return failure('Vérifiez les chiffres saisis.', parsed.error.flatten().fieldErrors);
    }

    return writeSetting(SETTING_KEYS.stats, parsed.data, 'Chiffres mis à jour.');
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
      milestones: readJson<unknown>(formData, 'milestones') ?? [],
    });

    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    const previousPath = String(formData.get('previousPortraitPath') ?? '');
    const result = await writeSetting(SETTING_KEYS.about, parsed.data, 'Histoire mise à jour.');

    if (result.ok && previousPath && previousPath !== parsed.data.portraitPath) {
      await removeStorageObjects([previousPath]);
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

    if (!parsed.success) return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);

    return writeSetting(SETTING_KEYS.contact, parsed.data, 'Coordonnées mises à jour.');
  });
}

export async function saveHoursAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = hoursSchema.safeParse({
      summary: formData.get('summary'),
      days: readJson<unknown>(formData, 'days') ?? [],
    });

    if (!parsed.success) {
      return failure('Vérifiez les horaires saisis.', parsed.error.flatten().fieldErrors);
    }

    return writeSetting(SETTING_KEYS.hours, parsed.data, 'Horaires mis à jour.');
  });
}

/* -------------------------------------------------------------------------- */
/*  Visuels fixes                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Remplace la photographie d'un emplacement de composition.
 *
 * L'ancienne image est supprimée du stockage une fois la nouvelle enregistrée :
 * remplacer une photo dix fois ne laisse pas neuf fichiers orphelins derrière.
 */
export async function saveVisualsAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const submitted = readJson<unknown>(formData, 'visuals');
    if (submitted === null) return failure('Données illisibles.');

    const parsed = visualsSchema.safeParse(submitted);
    if (!parsed.success) {
      return failure('Vérifiez les champs.', parsed.error.flatten().fieldErrors);
    }

    const previousPaths = readJson<Record<string, string>>(formData, 'previousPaths') ?? {};

    const result = await writeSetting(
      SETTING_KEYS.visuals,
      parsed.data,
      'Visuels enregistrés. Le site est à jour.',
    );
    if (!result.ok) return result;

    // Nettoyage : uniquement les fichiers qu'aucun emplacement ne référence plus.
    const stillUsed = new Set(
      Object.values(parsed.data)
        .map((visual) => visual.path)
        .filter(Boolean),
    );

    const orphans = Object.values(previousPaths).filter(
      (path) => Boolean(path) && !stillUsed.has(path),
    );

    if (orphans.length > 0) await removeStorageObjects(orphans);

    return result;
  });
}
