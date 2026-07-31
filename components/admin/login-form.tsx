'use client';

import { LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { AdminButton, Panel } from '@/components/admin/ui/primitives';
import { TextInput } from '@/components/admin/ui/form-fields';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { signInAction } from '@/services/admin/auth-actions';
import type { ActionResult } from '@/services/admin/action-result';

/**
 * Formulaire de connexion.
 *
 * `useActionState` conserve le résultat de l'action serveur entre deux rendus :
 * les erreurs de champ remontent sans état local, et le formulaire reste
 * opérant même avant l'hydratation.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    signInAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      const next = searchParams.get('suite');
      router.replace(next?.startsWith('/admin') ? next : ADMIN_ROUTES.dashboard);
      router.refresh();
    }
  }, [state, router, searchParams]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Panel className="p-6">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <TextInput
          id="email"
          name="email"
          type="email"
          label="Adresse e-mail"
          autoComplete="email"
          required
          error={fieldErrors?.email?.[0]}
        />

        <TextInput
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          autoComplete="current-password"
          required
          error={fieldErrors?.password?.[0]}
        />

        {state && !state.ok && !fieldErrors ? (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
            {state.message}
          </p>
        ) : null}

        <AdminButton type="submit" variant="primary" size="lg" disabled={pending} className="mt-1">
          <LogIn size={15} strokeWidth={1.8} aria-hidden="true" />
          {pending ? 'Connexion…' : 'Se connecter'}
        </AdminButton>
      </form>
    </Panel>
  );
}
