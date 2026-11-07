/**
 * Cookie de session.
 *
 * Sans dépendance serveur : le middleware, qui s'exécute en périphérie, le lit
 * aussi. En production, le préfixe `__Host-` interdit au navigateur d'accepter
 * ce cookie d'un sous-domaine ou sans HTTPS.
 */

const isProduction = process.env.NODE_ENV === 'production';

/** Une session inactive pendant trente jours expire. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE = isProduction ? '__Host-thiam-session' : 'thiam-session';

export interface SessionCookieOptions {
  readonly httpOnly: true;
  readonly secure: boolean;
  readonly sameSite: 'lax';
  readonly path: '/';
  readonly expires: Date;
}

/**
 * `SameSite=Lax` : le cookie n'accompagne aucune requête POST venue d'un autre
 * site, ce qui ferme la porte aux falsifications de requête intersites.
 */
export function sessionCookieOptions(expiresAt: Date): SessionCookieOptions {
  return { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/', expires: expiresAt };
}
