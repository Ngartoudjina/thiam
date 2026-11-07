'use client';

import { LogOut } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AdminButton, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { TextInput } from '@/components/admin/ui/form-fields';
import {
  changePasswordAction,
  signOutOtherSessionsAction,
  updateProfileAction,
} from '@/services/admin/account-actions';
import type { ActionResult } from '@/services/admin/action-result';

function useResultToast(state: ActionResult | null): void {
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else if (!state.fieldErrors) toast.error(state.message);
  }, [state]);
}

export function ProfileForm({
  fullName,
  email,
}: {
  readonly fullName: string;
  readonly email: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileAction,
    null,
  );
  useResultToast(state);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Panel>
      <PanelHeader title="Profil" description={`Connecté avec l’adresse ${email}.`} />
      <form action={formAction} className="flex flex-wrap items-end gap-3 p-5" noValidate>
        <TextInput
          id="profile-name"
          name="fullName"
          label="Nom affiché"
          required
          defaultValue={fullName}
          error={errors?.fullName?.[0]}
          wrapperClassName="min-w-60 flex-1"
        />
        <AdminButton type="submit" variant="secondary" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </form>
    </Panel>
  );
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    changePasswordAction,
    null,
  );
  useResultToast(state);

  // Les champs se vident après un changement réussi.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Panel>
      <PanelHeader
        title="Mot de passe"
        description="Au moins 10 caractères. Une phrase de quelques mots est à la fois solide et facile à retenir."
      />
      <form ref={formRef} action={formAction} className="flex flex-col gap-4 p-5" noValidate>
        <TextInput
          id="password-current"
          name="current"
          type="password"
          label="Mot de passe actuel"
          autoComplete="current-password"
          required
          error={errors?.current?.[0]}
          wrapperClassName="sm:max-w-sm"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="password-next"
            name="next"
            type="password"
            label="Nouveau mot de passe"
            autoComplete="new-password"
            required
            error={errors?.next?.[0]}
          />
          <TextInput
            id="password-confirm"
            name="confirm"
            type="password"
            label="Confirmation"
            autoComplete="new-password"
            required
            error={errors?.confirm?.[0]}
          />
        </div>
        <div className="flex justify-end border-t border-panel-border pt-4 dark:border-panel-dark-border">
          <AdminButton type="submit" variant="primary" disabled={pending}>
            {pending ? 'Modification…' : 'Changer le mot de passe'}
          </AdminButton>
        </div>
      </form>
    </Panel>
  );
}

export function SessionsPanel() {
  const [pending, setPending] = useState(false);

  const signOutOthers = async (): Promise<void> => {
    setPending(true);
    const result = await signOutOtherSessionsAction();
    setPending(false);

    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <Panel>
      <PanelHeader
        title="Sessions"
        description="Un téléphone perdu, un ordinateur partagé ? Fermez d’un geste toutes les sessions ouvertes ailleurs que sur cet appareil."
        action={
          <AdminButton
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => void signOutOthers()}
          >
            <LogOut size={14} strokeWidth={1.7} aria-hidden="true" />
            Fermer les autres sessions
          </AdminButton>
        }
      />
    </Panel>
  );
}
