import { describe, expect, it } from 'vitest';
import {
  generatePassword,
  hashPassword,
  needsRehash,
  verifyAgainstDecoy,
  verifyPassword,
} from '@/lib/auth/password';

describe('empreintes de mot de passe', () => {
  it('vérifie le bon mot de passe et refuse les autres', async () => {
    const hash = await hashPassword('correct horse battery staple');

    expect(hash).toMatch(/^scrypt\$131072\$8\$1\$[\w-]+\$[\w-]+$/);
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
    await expect(verifyPassword('correct horse battery stapl', hash)).resolves.toBe(false);
    await expect(verifyPassword('', hash)).resolves.toBe(false);
  });

  it('sale chaque empreinte : deux hachages du même mot de passe diffèrent', async () => {
    const [first, second] = await Promise.all([
      hashPassword('même secret'),
      hashPassword('même secret'),
    ]);
    expect(first).not.toBe(second);
  });

  it('normalise l’Unicode : un « é » composé ou précomposé donne le même mot de passe', async () => {
    const hash = await hashPassword('café-noir-2026');
    await expect(verifyPassword('café-noir-2026', hash)).resolves.toBe(true);
  });

  it('rejette les empreintes malformées ou aux paramètres dangereux sans calculer', async () => {
    await expect(verifyPassword('x', 'n’importe quoi')).resolves.toBe(false);
    await expect(verifyPassword('x', 'scrypt$3$8$1$c2Fs$a2V5')).resolves.toBe(false);
    // N = 2^24 épuiserait la mémoire : refusé d'emblée.
    await expect(verifyPassword('x', `scrypt$${2 ** 24}$8$1$c2Fs$${'a'.repeat(64)}`)).resolves.toBe(
      false,
    );
  });

  it('signale les empreintes à renforcer', async () => {
    expect(needsRehash(await hashPassword('un mot de passe'))).toBe(false);
    expect(needsRehash(`scrypt$16384$8$1$c2Fs$${'a'.repeat(64)}`)).toBe(true);
    expect(needsRehash('bcrypt$whatever')).toBe(true);
  });

  it('la vérification factice échoue toujours', async () => {
    await expect(verifyAgainstDecoy('quelconque')).resolves.toBe(false);
  });

  it('génère des mots de passe longs, lisibles et distincts', () => {
    const passwords = new Set(Array.from({ length: 50 }, generatePassword));

    expect(passwords.size).toBe(50);
    for (const password of passwords) {
      expect(password).toMatch(/^[a-zA-Z2-9]{5}(-[a-zA-Z2-9]{5}){3}$/);
      expect(password).not.toMatch(/[0O1lI]/);
    }
  });
});
