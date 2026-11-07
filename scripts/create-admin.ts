/**
 * Crée un compte du tableau de bord.
 *
 *   npm run admin:create -- --email=vous@exemple.com --name="Prénom Nom"
 *   npm run admin:create -- --email=… --role=editor
 *
 * Le premier compte de la base devient administrateur, quel que soit le rôle
 * demandé. Le mot de passe est généré, affiché une seule fois, et seule son
 * empreinte est enregistrée. Il se change ensuite depuis « Mon compte ».
 *
 * `--password-stdin` lit le mot de passe sur l'entrée standard plutôt que de
 * le générer (utile en intégration continue) :
 *   printf '%s' "$MOT_DE_PASSE" | npm run admin:create -- --email=… --password-stdin
 */
import { count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, generatePassword, hashPassword } from '@/lib/auth/password';
import { createDatabase, readDatabaseUrl } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { loadLocalEnv } from './lib/env';

function readFlag(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks)
    .toString('utf8')
    .replace(/\r?\n$/, '');
}

async function main(): Promise<void> {
  loadLocalEnv();

  const url = readDatabaseUrl();
  if (!url) throw new Error('DATABASE_URL est absente (voir .env.example).');

  const input = z
    .object({
      email: z.email('Adresse e-mail invalide : --email=vous@exemple.com'),
      name: z.string().trim().max(80).default(''),
      role: z.enum(['admin', 'editor']).default('admin'),
    })
    .safeParse({
      email: readFlag('email'),
      name: readFlag('name') ?? '',
      role: readFlag('role') ?? 'admin',
    });

  if (!input.success) {
    throw new Error(input.error.issues.map((issue) => issue.message).join(' · '));
  }

  const password = process.argv.includes('--password-stdin')
    ? await readStdin()
    : generatePassword();

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Le mot de passe doit compter au moins ${PASSWORD_MIN_LENGTH} caractères.`);
  }

  const db = createDatabase(url);
  const email = input.data.email.trim().toLowerCase();

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) throw new Error(`Un compte existe déjà pour ${email}.`);

  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(users);
  const role = total === 0 ? 'admin' : input.data.role;

  await db.insert(users).values({
    email,
    full_name: input.data.name || email.split('@')[0] || '',
    role,
    password_hash: await hashPassword(password),
  });

  console.log(`Compte créé : ${email} (${role === 'admin' ? 'administrateur' : 'éditeur'}).`);

  if (!process.argv.includes('--password-stdin')) {
    console.log('');
    console.log(`  Mot de passe : ${password}`);
    console.log('');
    console.log('Notez-le maintenant : il ne sera plus jamais affiché.');
    console.log('Il se change ensuite depuis le tableau de bord, rubrique « Mon compte ».');
  }
}

main().catch((error: unknown) => {
  console.error('Échec :', error instanceof Error ? error.message : error);
  process.exit(1);
});
