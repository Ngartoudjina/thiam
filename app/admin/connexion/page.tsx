import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/login-form';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { BRAND_MARK } from '@/constants/media';
import { SITE } from '@/constants/site';
import { getCurrentStaff } from '@/lib/auth';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Déjà connecté : inutile de montrer le formulaire.
  if (await getCurrentStaff()) redirect(ADMIN_ROUTES.dashboard);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-panel-muted px-6 py-16 dark:bg-panel-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src={BRAND_MARK.src}
            alt=""
            width={BRAND_MARK.width}
            height={BRAND_MARK.height}
            sizes="56px"
            aria-hidden="true"
            className="mb-4 size-14 shrink-0 object-contain"
          />
          <h1 className="font-sans text-lg font-semibold tracking-[-0.01em] text-panel-ink dark:text-panel-dark-ink">
            {SITE.wordmark} · Administration
          </h1>
          <p className="mt-1.5 text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
            Connectez-vous pour modifier le contenu du site.
          </p>
        </div>

        {/* `useSearchParams` exige une frontière Suspense. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-panel-faint dark:text-panel-dark-faint">
          Mot de passe oublié ? Un administrateur peut le réinitialiser depuis la rubrique Comptes.
        </p>
      </div>
    </main>
  );
}
