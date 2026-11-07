import { describe, expect, it } from 'vitest';
import { formatWeight, parseWeight } from '@/lib/format';
import { catalogSchema, pieceSchema } from '@/lib/schemas/content';
import { contactSchema } from '@/lib/validation';

const contact = { fullName: 'Awa Dossou', phone: '+229 01 97 84 40 22', message: '' };

describe('formulaire de contact', () => {
  it('accepte un sujet connu', () => {
    expect(contactSchema.safeParse({ ...contact, topic: 'reparation' }).success).toBe(true);
  });

  it('refuse un sujet inventé, y compris les noms hérités d’Object', () => {
    for (const topic of ['n-importe-quoi', 'constructor', 'toString', '__proto__']) {
      expect(contactSchema.safeParse({ ...contact, topic }).success).toBe(false);
    }
  });
});

describe('pièces', () => {
  const base = { name: 'Solitaire Aube', status: 'visible' };

  it('lit le poids à la française ou à l’anglaise', () => {
    expect(pieceSchema.parse({ ...base, weight: '3,2' }).weight).toBe(3.2);
    expect(pieceSchema.parse({ ...base, weight: '62' }).weight).toBe(62);
    expect(pieceSchema.parse({ ...base, weight: ' 4.15 ' }).weight).toBe(4.15);
    expect(pieceSchema.parse({ ...base, weight: '' }).weight).toBeNull();
  });

  it('refuse un poids absurde', () => {
    for (const weight of ['-1', '0', 'trois', '1e9']) {
      expect(pieceSchema.safeParse({ ...base, weight }).success).toBe(false);
    }
  });

  it('n’accepte qu’un univers désigné par son identifiant', () => {
    expect(pieceSchema.safeParse({ ...base, collectionId: 'diamant' }).success).toBe(false);
    expect(
      pieceSchema.safeParse({ ...base, collectionId: '3f2b8c1e-4d5a-4b6c-9d7e-8f9a0b1c2d3e' })
        .success,
    ).toBe(true);
  });

  it('borne le nombre de pièces annoncé', () => {
    expect(catalogSchema.safeParse({ totalInStore: '297' }).success).toBe(true);
    expect(catalogSchema.safeParse({ totalInStore: '-3' }).success).toBe(false);
    expect(catalogSchema.safeParse({ totalInStore: '2,5' }).success).toBe(false);
  });
});

describe('poids', () => {
  it('formate au standard francophone', () => {
    expect(formatWeight(3.2)).toBe('3,2 g');
    expect(formatWeight(62)).toBe('62 g');
    expect(formatWeight(4.156)).toBe('4,16 g');
    expect(formatWeight(1250)).toBe('1 250 g');
    expect(formatWeight(null)).toBe('');
    expect(formatWeight(0)).toBe('');
  });

  it('relit un poids affiché', () => {
    expect(parseWeight('3,2 g')).toBe(3.2);
    expect(parseWeight('62 g')).toBe(62);
    expect(parseWeight('')).toBeNull();
  });
});

describe('erreurs Postgres', () => {
  it('retrouve le code SQLSTATE, même enveloppé par Drizzle', async () => {
    const { isInvalidInput, isUniqueViolation, pgErrorCode } = await import('@/lib/db/errors');
    const wrapped = new Error('Failed query', {
      cause: { code: '23505', message: 'duplicate key' },
    });

    expect(pgErrorCode(wrapped)).toBe('23505');
    expect(isUniqueViolation(wrapped)).toBe(true);
    expect(isInvalidInput({ cause: { cause: { code: '22P02' } } })).toBe(true);
    expect(pgErrorCode(new Error('sans code'))).toBeUndefined();
  });
});
