'use client';

import { Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { AdminButton, Panel, PanelHeader } from '@/components/admin/ui/primitives';
import { SelectInput, TextInput } from '@/components/admin/ui/form-fields';
import {
  createUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  updateUserRoleAction,
} from '@/services/admin/account-actions';
import type { ActionResult } from '@/services/admin/action-result';
import type { UserRole, UserRow } from '@/types/database';

const ROLES = [
  { value: 'editor', label: 'Éditeur — modifie le contenu' },
  { value: 'admin', label: 'Administrateur — gère aussi les comptes' },
] as const;

const formatDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Porto-Novo',
});

/** Mot de passe affiché une seule fois, avec copie en un geste. */
function OneTimePassword({
  label,
  password,
  onDismiss,
}: {
  readonly label: string;
  readonly password: string;
  readonly onDismiss: () => void;
}) {
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Mot de passe copié.');
    } catch {
      toast.error('Copie impossible : sélectionnez le mot de passe à la main.');
    }
  };

  return (
    <div
      role="status"
      className="rounded-xl border border-accent/50 bg-accent-soft/50 p-4 dark:border-accent/40 dark:bg-accent/10"
    >
      <p className="text-sm font-medium text-panel-ink dark:text-panel-dark-ink">{label}</p>
      <p className="mt-1 text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
        Transmettez-le à la personne concernée : il ne sera plus jamais affiché. Elle pourra le
        changer depuis « Mon compte ».
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-panel px-3 py-2 font-mono text-sm tracking-wide text-panel-ink select-all dark:bg-panel-dark-sunken dark:text-panel-dark-ink">
          {password}
        </code>
        <AdminButton variant="secondary" size="sm" onClick={() => void copy()}>
          <Copy size={14} strokeWidth={1.7} aria-hidden="true" />
          Copier
        </AdminButton>
        <AdminButton variant="ghost" size="sm" onClick={onDismiss}>
          J’ai noté le mot de passe
        </AdminButton>
      </div>
    </div>
  );
}

export function AccountsManager({
  users,
  currentUserId,
}: {
  readonly users: readonly UserRow[];
  readonly currentUserId: string;
}) {
  const [revealed, setRevealed] = useState<{ label: string; password: string } | null>(null);
  const [creating, setCreating] = useState(false);

  const changeRole = async (id: string, role: UserRole): Promise<void> => {
    const result = await updateUserRoleAction(id, role);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const resetPassword = async (user: UserRow): Promise<void> => {
    const result = await resetUserPasswordAction(user.id);

    if (result.ok && result.data) {
      setRevealed({
        label: `Nouveau mot de passe de ${user.email}`,
        password: result.data.password,
      });
    } else {
      toast.error(result.message);
    }
  };

  const remove = async (id: string): Promise<void> => {
    const result = await deleteUserAction(id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="flex flex-col gap-5">
      {revealed ? (
        <OneTimePassword
          label={revealed.label}
          password={revealed.password}
          onDismiss={() => setRevealed(null)}
        />
      ) : null}

      {creating ? (
        <NewUserForm
          onCreated={(email, password) => {
            setCreating(false);
            if (password) setRevealed({ label: `Mot de passe de ${email}`, password });
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <div className="flex justify-end">
          <AdminButton variant="primary" onClick={() => setCreating(true)}>
            <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
            Ajouter un compte
          </AdminButton>
        </div>
      )}

      <Panel>
        <ul className="divide-y divide-panel-border dark:divide-panel-dark-border">
          {users.map((user) => {
            const isMe = user.id === currentUserId;

            return (
              <li
                key={user.id}
                className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
                    {user.full_name || user.email}
                    {isMe ? (
                      <span className="ml-2 text-[0.75rem] font-normal text-panel-faint dark:text-panel-dark-faint">
                        (vous)
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
                    {user.email} ·{' '}
                    {user.last_login_at
                      ? `dernière connexion le ${formatDate.format(user.last_login_at)}`
                      : 'jamais connecté'}
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-1.5">
                  <label htmlFor={`role-${user.id}`} className="sr-only">
                    Rôle de {user.email}
                  </label>
                  <select
                    id={`role-${user.id}`}
                    value={user.role}
                    onChange={(event) => void changeRole(user.id, event.target.value as UserRole)}
                    className="h-8 rounded-lg border border-panel-border bg-panel px-2 text-[0.8125rem] text-panel-ink dark:border-panel-dark-border dark:bg-panel-dark-sunken dark:text-panel-dark-ink"
                  >
                    <option value="editor">Éditeur</option>
                    <option value="admin">Administrateur</option>
                  </select>

                  {!isMe ? (
                    <ConfirmDialog
                      title={`Réinitialiser le mot de passe de ${user.email} ?`}
                      description="Un nouveau mot de passe sera généré et affiché une seule fois. Les sessions ouvertes sur ce compte seront fermées."
                      confirmLabel="Réinitialiser"
                      onConfirm={() => resetPassword(user)}
                      trigger={
                        <AdminButton variant="ghost" size="sm">
                          <KeyRound size={14} strokeWidth={1.7} aria-hidden="true" />
                          Nouveau mot de passe
                        </AdminButton>
                      }
                    />
                  ) : null}

                  {!isMe ? (
                    <ConfirmDialog
                      title={`Supprimer le compte ${user.email} ?`}
                      description="La personne ne pourra plus se connecter. Le contenu qu’elle a publié reste en place."
                      onConfirm={() => remove(user.id)}
                      trigger={
                        <AdminButton
                          variant="ghost"
                          size="icon"
                          aria-label={`Supprimer ${user.email}`}
                        >
                          <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                        </AdminButton>
                      }
                    />
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function NewUserForm({
  onCreated,
  onCancel,
}: {
  readonly onCreated: (email: string, password: string | undefined) => void;
  readonly onCancel: () => void;
}) {
  const [email, setEmail] = useState('');
  const [state, formAction, pending] = useActionState<
    ActionResult<{ password?: string }> | null,
    FormData
  >(createUserAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onCreated(email, state.data?.password);
    } else if (!state.fieldErrors) {
      toast.error(state.message);
    }
    // `email` est lu au moment de la réponse, pas comme déclencheur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Panel>
      <PanelHeader
        title="Nouveau compte"
        description="Laissez le mot de passe vide pour en générer un solide, affiché une seule fois."
      />
      <form action={formAction} className="flex flex-col gap-4 p-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="new-email"
            name="email"
            type="email"
            label="Adresse e-mail"
            required
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors?.email?.[0]}
          />
          <TextInput
            id="new-name"
            name="fullName"
            label="Nom"
            required
            error={errors?.fullName?.[0]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            id="new-role"
            name="role"
            label="Rôle"
            options={[...ROLES]}
            defaultValue="editor"
            error={errors?.role?.[0]}
          />
          <TextInput
            id="new-password"
            name="password"
            type="password"
            label="Mot de passe (facultatif)"
            autoComplete="new-password"
            hint="Au moins 10 caractères."
            error={errors?.password?.[0]}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-panel-border pt-4 dark:border-panel-dark-border">
          <AdminButton variant="secondary" onClick={onCancel} disabled={pending}>
            Annuler
          </AdminButton>
          <AdminButton type="submit" variant="primary" disabled={pending}>
            {pending ? 'Création…' : 'Créer le compte'}
          </AdminButton>
        </div>
      </form>
    </Panel>
  );
}
