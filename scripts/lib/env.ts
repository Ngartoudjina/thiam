import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Charge `.env.local` puis `.env` dans `process.env`, sans écraser ce qui est
 * déjà défini (variables du terminal, de la CI ou de Vercel).
 *
 * Next.js le fait seul pour l'application ; les scripts en ligne de commande
 * en ont besoin explicitement. `process.loadEnvFile` est natif depuis Node 20.12.
 */
export function loadLocalEnv(cwd: string = process.cwd()): void {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(cwd, file);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}
