'use server';

import { requireAdmin, requireStaff } from '@/lib/auth';
import { CACHE_TAGS } from '@/lib/cache';
import { requireDb } from '@/lib/db';
import { seedInitialContent } from '@/lib/db/seed';
import {
  failure,
  publishChanges,
  runAction,
  success,
  type ActionResult,
} from '@/services/admin/action-result';

/**
 * Import du contenu de la maquette, depuis le tableau de bord.
 *
 * Réservé aux administrateurs, et refusé si des collections existent déjà —
 * on n'écrase jamais un contenu réel par erreur.
 */
export async function seedContentAction(): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const report = await seedInitialContent(requireDb());
    if (!report) return failure('La base contient déjà des collections : l’import a été annulé.');

    publishChanges(...Object.values(CACHE_TAGS));

    return success(
      `Contenu importé : ${report.collections} collections, ${report.pieces} pièces, ` +
        `${report.services} services, ${report.testimonials} témoignages, ${report.faq} questions.`,
    );
  });
}

/**
 * Republie tout le site.
 *
 * Utile après une modification faite hors du tableau de bord — import en
 * ligne de commande, correction dans la console Neon : sans cela, le site
 * servirait l'ancienne version jusqu'à l'expiration de son cache.
 */
export async function refreshSiteAction(): Promise<ActionResult> {
  return runAction(async () => {
    await requireStaff();
    publishChanges(...Object.values(CACHE_TAGS));
    return success('Site actualisé : toutes les pages affichent le contenu de la base.');
  });
}
