import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '@/lib/db/connection';
import { rateLimits } from '@/lib/db/schema';
import {
  clientAddress,
  consumeRateLimit,
  fingerprint,
  formatRetryDelay,
  resetRateLimit,
} from '@/lib/rate-limit';
import { createTestDatabase } from './helpers/db';

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDatabase());
});

afterAll(() => close());

const rule = { limit: 3, windowMs: 60_000 };

describe('limitation de débit', () => {
  it('autorise jusqu’à la limite, puis refuse', async () => {
    const results = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      results.push(await consumeRateLimit(db, 'essai:a', rule));
    }

    expect(results.map((result) => result.allowed)).toEqual([true, true, true, false, false]);
    expect(results[0]!.remaining).toBe(2);
    expect(results[4]!.retryAfterMs).toBeGreaterThan(0);
    expect(results[4]!.retryAfterMs).toBeLessThanOrEqual(60_000);
  });

  it('compte juste sous des requêtes simultanées', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => consumeRateLimit(db, 'essai:concurrence', rule)),
    );

    expect(results.filter((result) => result.allowed)).toHaveLength(3);
  });

  it('repart de zéro quand la fenêtre est échue', async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) await consumeRateLimit(db, 'essai:b', rule);

    await db
      .update(rateLimits)
      .set({ reset_at: sql`now() - interval '1 second'` })
      .where(eq(rateLimits.key, 'essai:b'));

    const result = await consumeRateLimit(db, 'essai:b', rule);
    expect(result).toMatchObject({ allowed: true, remaining: 2 });
  });

  it('se réinitialise à la demande', async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) await consumeRateLimit(db, 'essai:c', rule);
    await resetRateLimit(db, 'essai:c');

    await expect(consumeRateLimit(db, 'essai:c', rule)).resolves.toMatchObject({ allowed: true });
  });

  it('ne conserve jamais l’adresse IP en clair', () => {
    const print = fingerprint('203.0.113.7');
    expect(print).toMatch(/^[0-9a-f]{32}$/);
    expect(print).not.toContain('203');
  });

  it('lit l’adresse du client transmise par l’hébergeur', () => {
    expect(clientAddress(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientAddress(new Headers({ 'x-forwarded-for': '198.51.100.3, 10.0.0.1' }))).toBe(
      '198.51.100.3',
    );
    expect(clientAddress(new Headers())).toBe('inconnue');
  });

  it('formule un délai lisible', () => {
    expect(formatRetryDelay(10_000)).toBe('1 minute');
    expect(formatRetryDelay(14 * 60_000 + 1)).toBe('15 minutes');
  });
});

describe('conservation des demandes', () => {
  it('efface les demandes de plus de douze mois, et elles seules', async () => {
    const { contactRequests } = await import('@/lib/db/schema');
    const { purgeExpiredContactRequests } = await import('@/lib/retention');

    await db.insert(contactRequests).values([
      {
        full_name: 'Ancienne',
        phone: '0197844022',
        topic: 'autre',
        created_at: new Date('2024-01-01'),
      },
      { full_name: 'Récente', phone: '0197844022', topic: 'autre' },
    ]);

    await purgeExpiredContactRequests(db);

    const remaining = await db.select({ name: contactRequests.full_name }).from(contactRequests);
    expect(remaining.map((row) => row.name)).toEqual(['Récente']);
  });
});
