import Link from 'next/link';
import { ROUTES } from '@/constants/navigation';

const STEPS = [
  'Créer un projet sur supabase.com, puis relever dans Settings → API son URL, sa clé publique et sa clé de service.',
  'Copier « .env.example » en « .env.local », y renseigner ces trois valeurs, puis relancer le serveur.',
  'Ouvrir l’éditeur SQL du projet et exécuter les deux fichiers de « supabase/migrations/ », dans l’ordre.',
  'Créer le compte de la maison depuis Supabase : Authentication → Users → Add user. Le premier compte créé devient administrateur.',
  'Se connecter ici, puis importer le contenu de la maquette d’un clic depuis le tableau de bord.',
] as const;

/**
 * Page d'installation.
 *
 * Tant que Supabase n'est pas configuré, le site vitrine fonctionne sur ses
 * valeurs de repli : on ne bloque donc rien, on explique simplement la suite.
 */
export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-[0.6875rem] font-medium tracking-wide text-accent uppercase">
        Administration
      </p>
      <h1 className="font-sans text-2xl font-semibold tracking-[-0.01em] text-panel-ink dark:text-panel-dark-ink">
        Il reste une étape avant d’ouvrir le tableau de bord
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-panel-soft dark:text-panel-dark-soft">
        Le site public fonctionne déjà : il affiche le contenu livré avec la maquette. Pour pouvoir
        le modifier depuis cette interface, connectez le projet à Supabase.
      </p>

      <ol className="mt-8 flex flex-col gap-4">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-sans text-xs font-semibold text-accent-strong dark:bg-accent/20 dark:text-accent-soft">
              {index + 1}
            </span>
            <span className="text-sm leading-relaxed text-panel-ink dark:text-panel-dark-ink">
              {step}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-sm text-panel-soft dark:text-panel-dark-soft">
        La marche à suivre détaillée figure dans le README, section « Tableau de bord ».{' '}
        <Link href={ROUTES.home} className="text-accent underline underline-offset-4">
          Retour au site
        </Link>
      </p>
    </main>
  );
}
