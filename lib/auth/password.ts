import { randomBytes, randomInt, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Empreintes de mots de passe — scrypt, natif dans Node, sans dépendance.
 *
 * Paramètres de l'OWASP pour scrypt : N = 2^17, r = 8, p = 1, soit 128 Mo de
 * mémoire et quelques centaines de millisecondes par essai. C'est ce coût qui
 * rend une base volée inexploitable par force brute.
 *
 * Format stocké : `scrypt$N$r$p$sel$empreinte` (sel et empreinte en base64url).
 * Les paramètres voyagent avec l'empreinte : on peut les durcir plus tard sans
 * invalider les mots de passe existants (voir `needsRehash`).
 */

interface ScryptParams {
  readonly N: number;
  readonly r: number;
  readonly p: number;
}

const CURRENT: ScryptParams = { N: 2 ** 17, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** Au-delà, une empreinte forgée pourrait épuiser la mémoire du serveur. */
const LIMITS = { maxN: 2 ** 20, maxR: 16, maxP: 4 } as const;

/** Mémoire autorisée : 128 × N × r, avec de la marge. */
const maxmem = (params: ScryptParams): number => 256 * params.N * params.r;

function derive(password: string, salt: Buffer, length: number, params: ScryptParams) {
  const options: ScryptOptions = { ...params, maxmem: maxmem(params) };

  return new Promise<Buffer>((resolve, reject) => {
    // NFKC : un même mot de passe saisi sur deux claviers donne la même empreinte.
    scrypt(password.normalize('NFKC'), salt, length, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, KEY_LENGTH, CURRENT);

  return [
    'scrypt',
    CURRENT.N,
    CURRENT.r,
    CURRENT.p,
    salt.toString('base64url'),
    key.toString('base64url'),
  ].join('$');
}

interface ParsedHash {
  readonly params: ScryptParams;
  readonly salt: Buffer;
  readonly key: Buffer;
}

function parseHash(stored: string): ParsedHash | null {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;

  const [, n, r, p, salt, key] = parts;
  const params = { N: Number(n), r: Number(r), p: Number(p) };

  const isPowerOfTwo =
    Number.isInteger(params.N) && params.N > 1 && (params.N & (params.N - 1)) === 0;
  if (!isPowerOfTwo || params.N > LIMITS.maxN) return null;
  if (!Number.isInteger(params.r) || params.r < 1 || params.r > LIMITS.maxR) return null;
  if (!Number.isInteger(params.p) || params.p < 1 || params.p > LIMITS.maxP) return null;
  if (!salt || !key) return null;

  const keyBuffer = Buffer.from(key, 'base64url');
  if (keyBuffer.length < 32) return null;

  return { params, salt: Buffer.from(salt, 'base64url'), key: keyBuffer };
}

/** Comparaison en temps constant : la durée ne trahit pas la position de l'écart. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;

  const candidate = await derive(password, parsed.salt, parsed.key.length, parsed.params);
  return candidate.length === parsed.key.length && timingSafeEqual(candidate, parsed.key);
}

/** Vrai si l'empreinte a été calculée avec des paramètres plus faibles qu'aujourd'hui. */
export function needsRehash(stored: string): boolean {
  const parsed = parseHash(stored);
  if (!parsed) return true;

  return (
    parsed.params.N !== CURRENT.N || parsed.params.r !== CURRENT.r || parsed.params.p !== CURRENT.p
  );
}

let decoy: Promise<string> | null = null;

/**
 * Vérification factice, au même coût qu'une vraie.
 *
 * Appelée quand l'adresse saisie ne correspond à aucun compte : sans elle, la
 * réponse arriverait plus vite et révélerait quelles adresses existent.
 */
export async function verifyAgainstDecoy(password: string): Promise<false> {
  decoy ??= hashPassword(randomBytes(24).toString('base64url'));
  await verifyPassword(password, await decoy);
  return false;
}

/** Mot de passe aléatoire lisible : 4 groupes de 5 caractères sans ambiguïté. */
export function generatePassword(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  // `randomInt` tire sans biais de modulo, contrairement à `octet % taille`.
  const chars = Array.from({ length: 20 }, () => alphabet[randomInt(alphabet.length)]);

  return [0, 5, 10, 15].map((start) => chars.slice(start, start + 5).join('')).join('-');
}

/** Règle commune à toutes les saisies de mot de passe. */
export const PASSWORD_MIN_LENGTH = 10;
