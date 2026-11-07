import { setDefaultAutoSelectFamilyAttemptTimeout } from 'node:net';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';

/**
 * Connexion à Neon, sans dépendance à Next.js : l'application et les scripts
 * en ligne de commande (migrations, amorçage, import) passent par ici.
 *
 * Le pilote HTTP de Neon envoie chaque requête en un seul aller-retour HTTPS,
 * sans connexion persistante : c'est le mode adapté aux fonctions serverless,
 * qui naissent et meurent avec chaque requête.
 */

/** Hôte du relais local (docker compose) qui imite l'API HTTP de Neon. */
const LOCAL_PROXY_HOST = 'db.localtest.me';
const LOCAL_PROXY_PORT = 4444;

/**
 * Délai maximal d'une requête.
 *
 * Neon met en veille une base inactive depuis cinq minutes et la réveille en
 * quelques centaines de millisecondes : huit secondes couvrent largement un
 * réveil, sans figer un rendu sur une panne réseau.
 */
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Coupe-circuit : après un échec réseau, les requêtes sont suspendues une
 * demi-minute et la couche de contenu sert aussitôt ses valeurs de repli,
 * plutôt que de repayer le délai d'attente à chaque lecture.
 */
const CIRCUIT_OPEN_MS = 30_000;
let unreachableUntil = 0;

export class DatabaseUnavailableError extends Error {
  constructor(message = 'Base de données momentanément injoignable.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

const guardedFetch: typeof fetch = async (input, init) => {
  if (Date.now() < unreachableUntil) {
    throw new DatabaseUnavailableError(
      'Base injoignable — requêtes suspendues après un échec réseau.',
    );
  }

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
    });

    unreachableUntil = 0;
    return response;
  } catch (error) {
    unreachableUntil = Date.now() + CIRCUIT_OPEN_MS;
    throw error;
  }
};

let configured = false;

function configureNeon(): void {
  if (configured) return;
  configured = true;

  /*
   * Node essaie chaque adresse IP du serveur pendant 250 ms seulement avant de
   * passer à la suivante (« happy eyeballs »). Depuis Cotonou, la base Neon
   * (us-east-2) est plus loin que cela : toutes les tentatives expiraient et
   * la base semblait injoignable en développement. Deux secondes par adresse
   * laissent le temps d'établir la connexion ; sur Vercel, proche de la base,
   * cela ne change rien.
   */
  if (typeof setDefaultAutoSelectFamilyAttemptTimeout === 'function') {
    setDefaultAutoSelectFamilyAttemptTimeout(2000);
  }

  neonConfig.fetchFunction = guardedFetch;

  // En local, le relais docker parle HTTP sur le port 4444 ; partout
  // ailleurs, la logique d'adressage propre à Neon s'applique telle quelle.
  const neonEndpoint = neonConfig.defaults.fetchEndpoint;

  neonConfig.fetchEndpoint = (host, port, options) => {
    if (host === LOCAL_PROXY_HOST) return `http://${LOCAL_PROXY_HOST}:${LOCAL_PROXY_PORT}/sql`;
    return typeof neonEndpoint === 'function' ? neonEndpoint(host, port, options) : neonEndpoint;
  };
}

/**
 * Adresse de la base, ou chaîne vide si elle n'est pas configurée.
 *
 * `DATABASE_URL` est le nom posé par Neon (CLI, console et intégration
 * Vercel) ; `POSTGRES_URL` est accepté en secours, c'est celui de certaines
 * intégrations Vercel.
 */
export function readDatabaseUrl(): string {
  return cleanConnectionString(process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '');
}

/**
 * Nettoie une adresse collée depuis un fichier `.env` : la ligne entière
 * (`DATABASE_URL="…"`) ou les guillemets finissent souvent dans le champ de
 * Vercel, qui les enregistre tels quels — et l'adresse devient invalide.
 */
export function cleanConnectionString(raw: string): string {
  return raw
    .trim()
    .replace(/^(?:export\s+)?[A-Z_]+\s*=\s*/, '')
    .replace(/^(['"])(.*)\1$/, '$2')
    .trim();
}

export function createDatabase(url: string) {
  configureNeon();
  return drizzle({ client: neon(url), schema });
}

export type Database = ReturnType<typeof createDatabase>;
