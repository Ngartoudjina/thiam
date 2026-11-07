import 'server-only';

import { createDatabase, readDatabaseUrl, type Database } from '@/lib/db/connection';

export { DatabaseUnavailableError, type Database } from '@/lib/db/connection';

/**
 * Accès à la base pour l'application.
 *
 * Le site public reste consultable sans base : tant que `DATABASE_URL` n'est
 * pas renseignée, la couche de contenu sert les valeurs de `constants/` et le
 * tableau de bord affiche sa page d'installation. Aucune exception n'est donc
 * levée au chargement du module.
 */

let instance: Database | null | undefined;

/** Vrai lorsque l'adresse de la base est renseignée. */
export function isDatabaseConfigured(): boolean {
  return readDatabaseUrl().length > 0;
}

/** Client Drizzle, ou `null` si la base n'est pas configurée. */
export function getDb(): Database | null {
  if (instance === undefined) {
    const url = readDatabaseUrl();
    instance = url ? createDatabase(url) : null;
  }

  return instance;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('DATABASE_URL est absente : la base de données n’est pas configurée.');
    this.name = 'DatabaseNotConfiguredError';
  }
}

/** Client Drizzle, pour les chemins qui ne peuvent pas se passer de la base. */
export function requireDb(): Database {
  const db = getDb();
  if (!db) throw new DatabaseNotConfiguredError();
  return db;
}
