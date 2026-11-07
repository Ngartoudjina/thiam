/**
 * Reprend le contenu de l'ancien projet Supabase dans la base Neon.
 *
 *   npm run import:supabase -- --dry-run     simulation : lit et compte, n'écrit rien
 *   npm run import:supabase                  import réel
 *   npm run import:supabase -- --replace     vide d'abord le contenu déjà présent
 *
 * Variables lues (dans .env.local ou l'environnement) :
 *   SUPABASE_URL                  https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     clé « service_role » (Settings → API)
 *   DATABASE_URL                  base Neon de destination
 *   BLOB_READ_WRITE_TOKEN         stockage des photos (sinon : disque local)
 *
 * Un projet Supabase en pause doit d'abord être réactivé depuis son tableau
 * de bord (« Restore project ») : ses données restent récupérables pendant
 * quatre-vingt-dix jours.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { put } from '@vercel/blob';
import {
  collectionImages,
  collections,
  faq,
  galleryImages,
  pieces,
  services,
  settings,
  testimonials,
} from '@/lib/db/schema';
import { createDatabase, readDatabaseUrl } from '@/lib/db/connection';
import { hasCollections } from '@/lib/db/seed';
import { loadLocalEnv } from './lib/env';
import { createSupabaseSource, importFromSupabase, type ImageSink } from './lib/supabase-import';

function blobSink(): ImageSink {
  return {
    async save(path, bytes, contentType) {
      const blob = await put(path, Buffer.from(bytes), {
        access: 'public',
        contentType,
        addRandomSuffix: true,
        cacheControlMaxAge: 31_536_000,
      });
      return blob.url;
    },
  };
}

function localSink(): ImageSink {
  const root = process.env.LOCAL_MEDIA_DIR?.trim() || join(process.cwd(), '.data', 'media');

  return {
    async save(path, bytes) {
      const target = join(root, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes);
      return `/media/${path}`;
    },
  };
}

async function main(): Promise<void> {
  loadLocalEnv();

  const dryRun = process.argv.includes('--dry-run');
  const replace = process.argv.includes('--replace');

  const supabaseUrl = (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ''
  ).trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  const databaseUrl = readDatabaseUrl();

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont nécessaires (voir l’en-tête du script).',
    );
  }
  if (!databaseUrl) throw new Error('DATABASE_URL est absente : la base Neon de destination.');

  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  const db = createDatabase(databaseUrl);

  if (!dryRun && (await hasCollections(db))) {
    if (!replace) {
      throw new Error(
        'La base Neon contient déjà des collections. Relancez avec --replace pour remplacer ce contenu.',
      );
    }

    console.log(
      '--replace : suppression du contenu existant (les comptes et les demandes sont conservés)…',
    );
    await db.batch([
      db.delete(collectionImages),
      db.delete(pieces),
      db.delete(collections),
      db.delete(galleryImages),
      db.delete(services),
      db.delete(testimonials),
      db.delete(faq),
      db.delete(settings),
    ]);
  }

  console.log(
    dryRun
      ? 'Simulation : rien ne sera écrit.'
      : `Photos copiées vers ${useBlob ? 'Vercel Blob' : 'le disque local (.data/media)'}.`,
  );

  const report = await importFromSupabase({
    db,
    source: createSupabaseSource(supabaseUrl, serviceKey),
    sink: useBlob ? blobSink() : localSink(),
    dryRun,
    log: (message) => console.log(message),
  });

  console.log('');
  console.log(dryRun ? 'Simulation terminée :' : 'Import terminé :');
  console.log(
    `  ${report.collections} collections, ${report.collectionImages} photos de collection, ` +
      `${report.gallery} photos de galerie, ${report.services} services, ` +
      `${report.testimonials} témoignages, ${report.faq} questions, ${report.settings} réglages.`,
  );

  if (!dryRun) console.log(`  ${report.imagesCopied} photo(s) copiée(s).`);
  if (report.imagesMissing.length > 0) {
    console.log(`  ${report.imagesMissing.length} photo(s) introuvable(s), ignorée(s).`);
  }

  console.log('');
  console.log('Les comptes ne sont pas repris : créez-les avec « npm run admin:create ».');
  if (!dryRun) {
    console.log('Site déjà en ligne ? Cliquez sur « Actualiser le site » dans le tableau de bord.');
  }
}

main().catch((error: unknown) => {
  console.error('Échec de l’import :', error instanceof Error ? error.message : error);
  process.exit(1);
});
