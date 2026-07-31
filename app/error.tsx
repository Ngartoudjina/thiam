'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/constants/site';

/**
 * Écran d'erreur applicatif.
 * Le visiteur garde toujours un chemin vers la boutique : le téléphone reste
 * affiché même si le rendu React a échoué.
 */
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error('[thiam] erreur de rendu', error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] flex-col justify-center bg-obsidian gutter py-24">
      <p className="mb-6 text-micro tracking-(--tracking-eyebrow) text-gold-warm uppercase">
        Incident technique
      </p>

      <h1 className="mb-6 font-serif text-section leading-[1.02] font-light text-ivory">
        Quelque chose
        <br />
        <em className="font-light text-gold">s’est interrompu</em>
      </h1>

      <p className="mb-10 max-w-[30rem] text-body leading-[1.75] font-light text-on-dark-faint">
        Rechargez la page. Si cela persiste, appelez-nous : la boutique répond du lundi au samedi.
      </p>

      <div className="flex flex-wrap gap-4">
        <Button variant="gold" size="lg" onClick={reset}>
          Réessayer
        </Button>
        <Button asChild variant="outlineLight" size="lg">
          <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
        </Button>
      </div>
    </section>
  );
}
