'use server';

import { and, count, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ADMIN_ROUTES } from '@/constants/admin-navigation';
import { requireAdmin, requireStaff } from '@/lib/auth';
import {
  PASSWORD_MIN_LENGTH,
  generatePassword,
  hashPassword,
  verifyPassword,
} from '@/lib/auth/password';
import { invalidateUserSessions } from '@/lib/auth/session';
import { requireDb, type Database } from '@/lib/db';
import { isUniqueViolation } from '@/lib/db/errors';
import { users } from '@/lib/db/schema';
import { failure, runAction, success, type ActionResult } from '@/services/admin/action-result';

/**
 * Gestion des comptes du tableau de bord.
 *
 * Les comptes se créent ici (ou par `npm run admin:create`) : aucune page
 * d'inscription publique n'existe. Un mot de passe généré n'est montré qu'une
 * fois, à celui qui l'a demandé ; la base n'en garde que l'empreinte.
 */

const fieldErrors = (error: z.ZodError) => z.flattenError(error).fieldErrors;

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Au moins ${PASSWORD_MIN_LENGTH} caractères.`)
  .max(200, 'Deux cents caractères maximum.');

const roleSchema = z.enum(['admin', 'editor']);

async function adminCount(db: Database): Promise<number> {
  const [row] = await db.select({ total: count() }).from(users).where(eq(users.role, 'admin'));
  return row?.total ?? 0;
}

/* -------------------------------------------------------------------------- */
/*  Administration des comptes                                                 */
/* -------------------------------------------------------------------------- */

const newUserSchema = z.object({
  email: z.email('Cette adresse e-mail ne semble pas valide.').max(200),
  fullName: z.string().trim().min(2, 'Le nom est obligatoire.').max(80),
  role: roleSchema,
  password: z.union([passwordSchema, z.literal('')]),
});

export async function createUserAction(
  _previous: ActionResult<{ password?: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ password?: string }>> {
  return runAction(async () => {
    await requireAdmin();

    const parsed = newUserSchema.safeParse({
      email: formData.get('email'),
      fullName: formData.get('fullName'),
      role: formData.get('role'),
      password: formData.get('password') ?? '',
    });

    if (!parsed.success) return failure('Vérifiez les champs.', fieldErrors(parsed.error));

    const generated = parsed.data.password ? null : generatePassword();
    const db = requireDb();

    try {
      await db.insert(users).values({
        email: parsed.data.email.trim().toLowerCase(),
        full_name: parsed.data.fullName,
        role: parsed.data.role,
        password_hash: await hashPassword(parsed.data.password || (generated ?? '')),
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return failure('Vérifiez les champs.', {
          email: ['Un compte existe déjà pour cette adresse.'],
        });
      }
      throw error;
    }

    revalidatePath(ADMIN_ROUTES.accounts);
    return success('Compte créé.', generated ? { password: generated } : {});
  });
}

export async function updateUserRoleAction(
  id: string,
  role: 'admin' | 'editor',
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    const parsed = z.object({ id: z.uuid(), role: roleSchema }).safeParse({ id, role });
    if (!parsed.success) return failure('Compte introuvable.');

    const db = requireDb();
    const [target] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, parsed.data.id));
    if (!target) return failure('Compte introuvable.');

    if (target.role === 'admin' && parsed.data.role !== 'admin' && (await adminCount(db)) <= 1) {
      return failure('Il doit rester au moins un administrateur.');
    }

    await db.update(users).set({ role: parsed.data.role }).where(eq(users.id, parsed.data.id));

    revalidatePath(ADMIN_ROUTES.accounts);
    return success('Rôle mis à jour.');
  });
}

/** Nouveau mot de passe généré ; toutes les sessions du compte sont fermées. */
export async function resetUserPasswordAction(
  id: string,
): Promise<ActionResult<{ password: string }>> {
  return runAction(async () => {
    await requireAdmin();
    if (!z.uuid().safeParse(id).success) return failure('Compte introuvable.');

    const db = requireDb();
    const password = generatePassword();

    const updated = await db
      .update(users)
      .set({ password_hash: await hashPassword(password) })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (updated.length === 0) return failure('Compte introuvable.');

    await invalidateUserSessions(db, id);
    return success('Mot de passe réinitialisé.', { password });
  });
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const me = await requireAdmin();
    if (!z.uuid().safeParse(id).success) return failure('Compte introuvable.');
    if (id === me.id) return failure('Vous ne pouvez pas supprimer votre propre compte.');

    const db = requireDb();
    const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, id));
    if (!target) return failure('Compte introuvable.');

    if (target.role === 'admin' && (await adminCount(db)) <= 1) {
      return failure('Il doit rester au moins un administrateur.');
    }

    // Les sessions partent avec le compte (ON DELETE CASCADE).
    await db.delete(users).where(and(eq(users.id, id), ne(users.id, me.id)));

    revalidatePath(ADMIN_ROUTES.accounts);
    return success('Compte supprimé.');
  });
}

/* -------------------------------------------------------------------------- */
/*  Mon compte                                                                 */
/* -------------------------------------------------------------------------- */

export async function updateProfileAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const me = await requireStaff();
    const parsed = z
      .object({ fullName: z.string().trim().min(2, 'Le nom est obligatoire.').max(80) })
      .safeParse({ fullName: formData.get('fullName') });

    if (!parsed.success) return failure('Vérifiez les champs.', fieldErrors(parsed.error));

    await requireDb()
      .update(users)
      .set({ full_name: parsed.data.fullName })
      .where(eq(users.id, me.id));

    revalidatePath('/admin', 'layout');
    return success('Profil mis à jour.');
  });
}

const changePasswordSchema = z
  .object({
    current: z.string().min(1, 'Saisissez votre mot de passe actuel.').max(200),
    next: passwordSchema,
    confirm: z.string(),
  })
  .refine((value) => value.next === value.confirm, {
    path: ['confirm'],
    message: 'Les deux saisies ne correspondent pas.',
  });

/**
 * Changement de mot de passe : l'actuel est exigé, et toutes les autres
 * sessions du compte sont fermées — un appareil perdu perd aussi son accès.
 */
export async function changePasswordAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const me = await requireStaff();
    const parsed = changePasswordSchema.safeParse({
      current: formData.get('current'),
      next: formData.get('next'),
      confirm: formData.get('confirm'),
    });

    if (!parsed.success) return failure('Vérifiez les champs.', fieldErrors(parsed.error));

    const db = requireDb();
    const [user] = await db
      .select({ password_hash: users.password_hash })
      .from(users)
      .where(eq(users.id, me.id));

    if (!user || !(await verifyPassword(parsed.data.current, user.password_hash))) {
      return failure('Vérifiez les champs.', { current: ['Mot de passe actuel incorrect.'] });
    }

    await db
      .update(users)
      .set({ password_hash: await hashPassword(parsed.data.next) })
      .where(eq(users.id, me.id));

    await invalidateUserSessions(db, me.id, me.sessionId);
    return success('Mot de passe modifié. Vos autres sessions ont été fermées.');
  });
}

export async function signOutOtherSessionsAction(): Promise<ActionResult> {
  return runAction(async () => {
    const me = await requireStaff();
    await invalidateUserSessions(requireDb(), me.id, me.sessionId);
    return success('Toutes vos autres sessions ont été fermées.');
  });
}
