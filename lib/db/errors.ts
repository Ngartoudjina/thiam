/**
 * Lecture des erreurs Postgres.
 *
 * Drizzle enveloppe l'erreur du pilote dans la sienne (`cause`) : le code
 * SQLSTATE peut donc se trouver un ou deux niveaux plus bas.
 */
export function pgErrorCode(error: unknown): string | undefined {
  let current: unknown = error;

  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const { code, cause } = current as { code?: unknown; cause?: unknown };
    if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) return code;
    current = cause;
  }

  return undefined;
}

/** Violation d'unicité : identifiant d'URL ou adresse e-mail déjà pris. */
export const isUniqueViolation = (error: unknown): boolean => pgErrorCode(error) === '23505';

/** Identifiant mal formé (un uuid qui n'en est pas un, par exemple). */
export const isInvalidInput = (error: unknown): boolean => pgErrorCode(error) === '22P02';

/** Clé étrangère : la ligne référencée n'existe plus. */
export const isForeignKeyViolation = (error: unknown): boolean => pgErrorCode(error) === '23503';

/** Panne réseau ou délai dépassé : la base n'a pas répondu. */
export function isConnectionFailure(error: unknown): boolean {
  let current: unknown = error;

  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const { name, message, cause } = current as {
      name?: unknown;
      message?: unknown;
      cause?: unknown;
    };

    if (
      name === 'DatabaseUnavailableError' ||
      name === 'TimeoutError' ||
      name === 'AbortError' ||
      (typeof message === 'string' &&
        /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(message))
    ) {
      return true;
    }

    current = cause;
  }

  return false;
}
