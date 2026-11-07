import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Database } from '@/lib/db/connection';
import * as schema from '@/lib/db/schema';

/**
 * Base Postgres embarquée, en mémoire, avec les migrations du dépôt.
 *
 * Même moteur que Neon (Postgres), mêmes migrations : les tests éprouvent le
 * vrai schéma — contraintes, index uniques, valeurs par défaut — sans réseau.
 * Le pilote diffère (PGlite au lieu du HTTP de Neon) ; le code applicatif
 * n'utilise que l'API commune de Drizzle, d'où la conversion de type.
 */
export async function createTestDatabase(): Promise<{
  readonly db: Database;
  readonly close: () => Promise<void>;
}> {
  const client = new PGlite();
  const db = drizzle({ client, schema });

  await migrate(db, { migrationsFolder: 'drizzle' });

  return {
    db: db as unknown as Database,
    close: () => client.close(),
  };
}
