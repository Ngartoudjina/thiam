import { defineConfig } from 'drizzle-kit';
import { loadLocalEnv } from './scripts/lib/env';

loadLocalEnv();

/**
 * Configuration de drizzle-kit.
 *
 *   npm run db:generate   écrit une migration SQL dans drizzle/ après une
 *                         modification de lib/db/schema.ts
 *   npm run db:studio     explore la base dans le navigateur
 *
 * L'application des migrations ne passe pas par drizzle-kit mais par
 * `npm run db:migrate` (scripts/db-migrate.ts) : chaque migration y est
 * exécutée dans une transaction, ce que le pilote HTTP de Neon ne fait pas
 * de lui-même.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
});
