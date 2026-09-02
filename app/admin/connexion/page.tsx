import { LoginForm } from '@/components/admin/login-form';
import { SITE } from '@/constants/site';
import Image from 'next/image';
import { BRAND_MARK } from '@/constants/media';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-panel-muted px-6 py-16 dark:bg-panel-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
        src={BRAND_MARK.src}
        alt=""
        width={BRAND_MARK.width}
        height={BRAND_MARK.height}
        sizes="48px"
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

        <LoginForm />
      </div>
    </main>
  );
}
