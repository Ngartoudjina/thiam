/**
 * Importe le contenu de la maquette dans la base, hors application.
 *
 *   npm run db:seed
 *
 * Même contenu que le bouton « Importer le contenu » du tableau de bord.
 * Refusé si des collections existent déjà : rien n'est jamais écrasé.
 */
import { createDatabase, readDatabaseUrl } from '@/lib/db/connection';
import { seedInitialContent } from '@/lib/db/seed';
import { loadLocalEnv } from './lib/env';

async function main(): Promise<void> {
  loadLocalEnv();

  const url = readDatabaseUrl();
  if (!url) throw new Error('DATABASE_URL est absente (voir .env.example).');

  const report = await seedInitialContent(createDatabase(url));

  if (!report) {
    console.log('La base contient déjà des collections : rien n’a été modifié.');
    return;
  }

  console.log(
    `Importé : ${report.collections} collections, ${report.collectionImages} photos de collection, ` +
      `${report.pieces} pièces, ${report.gallery} photos de galerie, ${report.services} services, ` +
      `${report.testimonials} témoignages, ${report.faq} questions, et les réglages du site.`,
  );
  console.log('Site déjà en ligne ? Cliquez sur « Actualiser le site » dans le tableau de bord.');
}

main().catch((error: unknown) => {
  console.error('Échec de l’import :', error instanceof Error ? error.message : error);
  process.exit(1);
});
