import { LoginForm } from '@/components/admin/login-form';
import { SITE } from '@/constants/site';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-panel-muted px-6 py-16 dark:bg-panel-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="mb-4 size-9 rotate-45 rounded-[3px] bg-gradient-to-br from-gold-mist via-gold to-gold-deep"
          />
          <h1 className="font-sans text-lg font-semibold tracking-[-0.01em] text-panel-ink dark:text-panel-dark-ink">
            {SITE.wordmark} · Administration
          </h1>
          <p className="mt-1.5 text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
            Connectez-vous pour modifier le contenu du site.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
