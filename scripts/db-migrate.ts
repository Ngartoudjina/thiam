/**
 * Applique les migrations SQL de `drizzle/` à la base Neon.
 *
 *   npm run db:migrate
 *   tsx scripts/db-migrate.ts --if-configured   (utilisé au build Vercel)
 *
 * Chaque migration part dans une transaction unique, avec son inscription au
 * registre : une migration interrompue ne laisse jamais la base à moitié
 * transformée. Le registre est celui de Drizzle (`drizzle.__drizzle_migrations`),
 * si bien que `drizzle-kit` et ce script restent interchangeables.
 *
 * `--if-configured` : sans `DATABASE_URL`, le script s'arrête sans erreur.
 * C'est ce qui permet de lancer un build sans base, par exemple pour vérifier
 * le site sur ses contenus de repli.
 */
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { createDatabase, readDatabaseUrl } from '@/lib/db/connection';
import { loadLocalEnv } from './lib/env';

async function main(): Promise<void> {
  loadLocalEnv();

  const ifConfigured = process.argv.includes('--if-configured');
  const url = readDatabaseUrl();

  if (!url) {
    if (ifConfigured) {
      console.log('[migrations] DATABASE_URL absente : aucune migration appliquée.');
      return;
    }

    throw new Error('DATABASE_URL est absente (voir .env.example).');
  }

  const sql = createDatabase(url).$client;
  const migrations = readMigrationFiles({ migrationsFolder: 'drizzle' });

  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  const [last] = await sql`
    SELECT created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 1
  `;
  const lastApplied = Number(last?.created_at ?? 0);
  const pending = migrations.filter((migration) => migration.folderMillis > lastApplied);

  if (pending.length === 0) {
    console.log(`[migrations] Base à jour (${migrations.length} migration(s) appliquée(s)).`);
    return;
  }

  for (const migration of pending) {
    await sql.transaction([
      ...migration.sql
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0)
        .map((statement) => sql.query(statement)),
      sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${migration.hash}, ${migration.folderMillis})
      `,
    ]);

    console.log(`[migrations] Appliquée : ${new Date(migration.folderMillis).toISOString()}`);
  }

  console.log(`[migrations] ${pending.length} migration(s) appliquée(s).`);
}

main().catch((error: unknown) => {
  console.error('[migrations] Échec :', error instanceof Error ? error.message : error);
  process.exit(1);
});
