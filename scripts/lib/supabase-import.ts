import type { BatchItem } from 'drizzle-orm/batch';
import type { Database } from '@/lib/db/connection';
import {
  collectionImages,
  collections,
  faq,
  galleryImages,
  services,
  settings,
  testimonials,
} from '@/lib/db/schema';
import { IMAGE_TYPES, sniffImage } from '@/lib/storage/image';

/**
 * Reprise du contenu d'un projet Supabase dans la base Neon.
 *
 * Les lignes gardent leurs identifiants, leurs positions et leurs dates ; les
 * photos du compartiment `media` sont téléchargées puis confiées au nouveau
 * stockage, et chaque chemin est réécrit vers sa nouvelle adresse — y compris
 * dans les réglages JSON (bandeau, portrait, visuels).
 *
 * Les comptes ne sont pas repris : Supabase ne livre pas les empreintes de
 * mot de passe par son API. On les recrée avec `npm run admin:create`.
 *
 * Les dépendances (lecture Supabase, écriture des images) sont injectées :
 * la logique se teste sans réseau.
 */

export type Row = Record<string, unknown>;

export interface SupabaseSource {
  /** Toutes les lignes d'une table du schéma `public`. */
  fetchTable(table: string): Promise<readonly Row[]>;
  /** Un objet du compartiment `media`, ou `null` s'il est introuvable. */
  downloadObject(path: string): Promise<Uint8Array | null>;
}

export interface ImageSink {
  /** Enregistre une image et renvoie son adresse publique. */
  save(path: string, bytes: Uint8Array, contentType: string): Promise<string>;
}

export interface ImportOptions {
  readonly db: Database;
  readonly source: SupabaseSource;
  readonly sink: ImageSink;
  readonly dryRun?: boolean;
  readonly log?: (message: string) => void;
}

export interface ImportReport {
  readonly collections: number;
  readonly collectionImages: number;
  readonly gallery: number;
  readonly services: number;
  readonly testimonials: number;
  readonly faq: number;
  readonly settings: number;
  readonly imagesCopied: number;
  readonly imagesMissing: readonly string[];
}

/* -------------------------------------------------------------------------- */
/*  Lecture prudente des lignes                                                */
/* -------------------------------------------------------------------------- */

const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const nullableText = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const int = (value: unknown, fallback = 0): number => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
};

const bool = (value: unknown): boolean => value === true || value === 'true';

const date = (value: unknown): Date => {
  const parsed = typeof value === 'string' ? new Date(value) : new Date(Number.NaN);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const status = (value: unknown): 'visible' | 'hidden' =>
  value === 'hidden' ? 'hidden' : 'visible';

/**
 * Chemin relatif d'un objet Supabase, ou `null` si la valeur désigne autre
 * chose (visuel livré avec le site, adresse externe, vide).
 */
export function supabaseObjectPath(value: string): string | null {
  if (!value || value.startsWith('/')) return null;

  const marker = '/storage/v1/object/public/media/';
  if (value.startsWith('http')) {
    const index = value.indexOf(marker);
    return index === -1 ? null : decodeURIComponent(value.slice(index + marker.length));
  }

  return value.replace(/^media\//, '');
}

/* -------------------------------------------------------------------------- */
/*  Import                                                                     */
/* -------------------------------------------------------------------------- */

export async function importFromSupabase({
  db,
  source,
  sink,
  dryRun = false,
  log = () => undefined,
}: ImportOptions): Promise<ImportReport> {
  const [
    collectionRows,
    imageRows,
    galleryRows,
    serviceRows,
    testimonialRows,
    faqRows,
    settingRows,
  ] = (await Promise.all(
    [
      'collections',
      'collection_images',
      'gallery_images',
      'services',
      'testimonials',
      'faq',
      'settings',
    ].map((table) => source.fetchTable(table)),
  )) as [Row[], Row[], Row[], Row[], Row[], Row[], Row[]];

  log(
    `Lu dans Supabase : ${collectionRows.length} collections, ${imageRows.length} photos de collection, ` +
      `${galleryRows.length} photos de galerie, ${serviceRows.length} services, ` +
      `${testimonialRows.length} témoignages, ${faqRows.length} questions, ${settingRows.length} réglages.`,
  );

  /* --- Images ------------------------------------------------------------ */

  const moved = new Map<string, string | null>();
  const missing: string[] = [];
  let copied = 0;

  /** Nouvelle adresse d'une image ; la valeur d'origine si rien n'est à déplacer. */
  const relocate = async (value: string): Promise<string | null> => {
    const objectPath = supabaseObjectPath(value);
    if (!objectPath) return value || null;
    if (moved.has(objectPath)) return moved.get(objectPath) ?? null;

    if (dryRun) {
      moved.set(objectPath, value);
      return value;
    }

    const bytes = await source.downloadObject(objectPath);
    const kind = bytes ? sniffImage(bytes) : null;

    if (!bytes || !kind) {
      missing.push(objectPath);
      moved.set(objectPath, null);
      log(`  ✗ image introuvable ou illisible : ${objectPath}`);
      return null;
    }

    const url = await sink.save(objectPath, bytes, IMAGE_TYPES[kind].mime);
    moved.set(objectPath, url);
    copied += 1;
    log(`  ✓ ${objectPath}`);
    return url;
  };

  const collectionImageValues = [];
  for (const row of imageRows) {
    const src = await relocate(text(row.storage_path));
    if (!src) continue;

    collectionImageValues.push({
      id: text(row.id),
      collection_id: text(row.collection_id),
      storage_path: src,
      alt: text(row.alt),
      width: int(row.width),
      height: int(row.height),
      position: int(row.position),
      is_primary: bool(row.is_primary),
      created_at: date(row.created_at),
    });
  }

  const galleryValues = [];
  for (const row of galleryRows) {
    const src = await relocate(text(row.storage_path));
    if (!src) continue;

    galleryValues.push({
      id: text(row.id),
      storage_path: src,
      alt: text(row.alt),
      caption: nullableText(row.caption),
      width: int(row.width),
      height: int(row.height),
      col_span: (int(row.col_span, 1) === 2 ? 2 : 1) as 1 | 2,
      row_span: (int(row.row_span, 2) === 3 ? 3 : 2) as 2 | 3,
      status: status(row.status),
      position: int(row.position),
      created_at: date(row.created_at),
      updated_at: date(row.updated_at),
    });
  }

  /** Réécrit les chemins d'image contenus dans les réglages JSON. */
  const settingValues = [];
  for (const row of settingRows) {
    const key = text(row.key);
    const value = (
      row.value && typeof row.value === 'object' ? { ...(row.value as Row) } : {}
    ) as Row;

    if (key === 'hero' && typeof value.imagePath === 'string') {
      value.imagePath = (await relocate(value.imagePath)) ?? '';
    }

    if (key === 'about' && typeof value.portraitPath === 'string') {
      value.portraitPath = (await relocate(value.portraitPath)) ?? '';
    }

    if (key === 'visuals') {
      for (const [slot, visual] of Object.entries(value)) {
        if (visual && typeof visual === 'object' && typeof (visual as Row).path === 'string') {
          value[slot] = {
            ...(visual as Row),
            path: (await relocate((visual as Row).path as string)) ?? '',
          };
        }
      }
    }

    if (key) settingValues.push({ key, value, updated_at: date(row.updated_at) });
  }

  /* --- Lignes ------------------------------------------------------------- */

  const collectionValues = collectionRows.map((row) => ({
    id: text(row.id),
    slug: text(row.slug),
    name: text(row.name),
    tagline: text(row.tagline),
    description: nullableText(row.description),
    category: text(row.category, 'bijoux'),
    status: status(row.status),
    position: int(row.position),
    created_at: date(row.created_at),
    updated_at: date(row.updated_at),
  }));

  const serviceValues = serviceRows.map((row) => ({
    id: text(row.id),
    icon: text(row.icon, 'repair'),
    title: text(row.title),
    description: text(row.description),
    price: text(row.price),
    status: status(row.status),
    position: int(row.position),
    created_at: date(row.created_at),
    updated_at: date(row.updated_at),
  }));

  const testimonialValues = testimonialRows.map((row) => ({
    id: text(row.id),
    quote: text(row.quote),
    author: text(row.author),
    context: text(row.context),
    rating: Math.min(5, Math.max(1, int(row.rating, 5))),
    is_featured: bool(row.is_featured),
    status: status(row.status),
    position: int(row.position),
    created_at: date(row.created_at),
    updated_at: date(row.updated_at),
  }));

  const faqValues = faqRows.map((row) => ({
    id: text(row.id),
    question: text(row.question),
    answer: text(row.answer),
    status: status(row.status),
    position: int(row.position),
    created_at: date(row.created_at),
    updated_at: date(row.updated_at),
  }));

  const report: ImportReport = {
    collections: collectionValues.length,
    collectionImages: collectionImageValues.length,
    gallery: galleryValues.length,
    services: serviceValues.length,
    testimonials: testimonialValues.length,
    faq: faqValues.length,
    settings: settingValues.length,
    imagesCopied: copied,
    imagesMissing: missing,
  };

  if (dryRun) return report;

  const statements = [
    collectionValues.length > 0 ? db.insert(collections).values(collectionValues) : null,
    collectionImageValues.length > 0
      ? db.insert(collectionImages).values(collectionImageValues)
      : null,
    galleryValues.length > 0 ? db.insert(galleryImages).values(galleryValues) : null,
    serviceValues.length > 0 ? db.insert(services).values(serviceValues) : null,
    testimonialValues.length > 0 ? db.insert(testimonials).values(testimonialValues) : null,
    faqValues.length > 0 ? db.insert(faq).values(faqValues) : null,
    settingValues.length > 0
      ? db.insert(settings).values(settingValues).onConflictDoNothing({ target: settings.key })
      : null,
  ].filter((statement) => statement !== null);

  if (statements.length === 0) return report;

  // Avec Neon, tout part en une transaction : la base est importée en entier ou pas du tout.
  if ('batch' in db && typeof db.batch === 'function') {
    await db.batch(statements as unknown as readonly [BatchItem<'pg'>, ...BatchItem<'pg'>[]]);
  } else {
    for (const statement of statements) await statement;
  }

  return report;
}

/* -------------------------------------------------------------------------- */
/*  Source réelle : l'API REST de Supabase                                     */
/* -------------------------------------------------------------------------- */

export function createSupabaseSource(projectUrl: string, serviceRoleKey: string): SupabaseSource {
  const base = projectUrl.replace(/\/+$/, '');
  const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };

  return {
    async fetchTable(table) {
      const response = await fetch(`${base}/rest/v1/${table}?select=*`, {
        headers: { ...headers, Range: '0-9999' },
        signal: AbortSignal.timeout(30_000),
      });

      if (response.status === 404) return [];
      if (!response.ok) {
        throw new Error(
          `Lecture de « ${table} » refusée (${response.status}) : ${await response.text()}`,
        );
      }

      return (await response.json()) as Row[];
    },

    async downloadObject(path) {
      const encoded = path.split('/').map(encodeURIComponent).join('/');
      const response = await fetch(`${base}/storage/v1/object/media/${encoded}`, {
        headers,
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) return null;
      return new Uint8Array(await response.arrayBuffer());
    },
  };
}
