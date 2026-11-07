import { createHash } from 'node:crypto';
import { eq, lt, sql } from 'drizzle-orm';
import type { Database } from '@/lib/db/connection';
import { rateLimits } from '@/lib/db/schema';

/**
 * Limitation de débit en base.
 *
 * Une fenêtre fixe par clé : le compteur repart de un dès que la fenêtre est
 * échue. L'incrément est une seule instruction `INSERT … ON CONFLICT`, donc
 * atomique : deux requêtes simultanées ne peuvent pas lire le même compteur.
 */

export interface RateLimitRule {
  readonly limit: number;
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterMs: number;
}

export const RATE_LIMITS = {
  /** Par adresse e-mail visée : freine le cassage d'un compte précis. */
  loginAccount: { limit: 6, windowMs: 15 * 60_000 },
  /** Par adresse IP : freine le balayage de nombreux comptes. */
  loginIp: { limit: 30, windowMs: 15 * 60_000 },
  contact: { limit: 5, windowMs: 15 * 60_000 },
  newsletter: { limit: 5, windowMs: 15 * 60_000 },
} as const satisfies Record<string, RateLimitRule>;

export async function consumeRateLimit(
  db: Database,
  key: string,
  rule: RateLimitRule,
): Promise<RateLimitResult> {
  const window = sql`now() + ${rule.windowMs}::integer * interval '1 millisecond'`;
  const expired = sql`${rateLimits.reset_at} <= now()`;

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, reset_at: window })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        reset_at: sql`case when ${expired} then ${window} else ${rateLimits.reset_at} end`,
      },
    })
    .returning({ count: rateLimits.count, resetAt: rateLimits.reset_at });

  const count = row?.count ?? 1;
  const retryAfterMs = Math.max(0, (row?.resetAt.getTime() ?? Date.now()) - Date.now());

  return {
    allowed: count <= rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfterMs,
  };
}

export async function resetRateLimit(db: Database, key: string): Promise<void> {
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
}

/** Supprime les compteurs échus depuis plus d'un jour. */
export async function purgeRateLimits(db: Database): Promise<void> {
  await db.delete(rateLimits).where(lt(rateLimits.reset_at, sql`now() - interval '1 day'`));
}

/**
 * Empreinte d'un identifiant de visiteur.
 * Les adresses IP ne sont jamais conservées en clair, pas même le temps
 * d'une fenêtre de limitation.
 */
export function fingerprint(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

/** Adresse du client, telle que transmise par l'hébergeur. */
export function clientAddress(headers: Headers): string {
  return (
    headers.get('x-real-ip') ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnue'
  );
}

/** « 3 minutes », « 1 minute » : délai lisible pour un message d'erreur. */
export function formatRetryDelay(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}
