import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { contactRequests } from '@/lib/db/schema';
import { RATE_LIMITS, clientAddress, consumeRateLimit, fingerprint } from '@/lib/rate-limit';
import { purgeExpiredContactRequests } from '@/lib/retention';
import { contactSchema } from '@/lib/validation';
import { relayToWebhook } from '@/services/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Réception des demandes de rendez-vous.
 *
 * Chaque demande est enregistrée en base et apparaît dans le tableau de bord
 * (rubrique Demandes) : aucune ne se perd. Si `CONTACT_WEBHOOK_URL` est
 * renseignée, elle est aussi relayée vers l'outil de la maison (CRM, e-mail,
 * feuille de calcul…).
 *
 * La validation reprend le schéma du formulaire : un envoi forgé hors
 * navigateur subit exactement les mêmes règles. Le champ leurre et une
 * limitation par visiteur écartent les robots sans imposer de captcha.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  // Champ leurre rempli : on répond « reçu » sans rien enregistrer ni dire
  // au robot qu'il a été repéré.
  if (payload && typeof payload === 'object' && 'company' in payload && payload.company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 422 });
  }

  const db = getDb();
  const input = parsed.data;

  if (db) {
    try {
      const visitor = fingerprint(clientAddress(request.headers));
      const limit = await consumeRateLimit(db, `contact:${visitor}`, RATE_LIMITS.contact);

      if (!limit.allowed) {
        return NextResponse.json(
          { error: 'Trop de demandes. Réessayez dans quelques minutes.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } },
        );
      }
    } catch (error) {
      // Une limitation indisponible ne doit pas bloquer un client réel.
      console.error('[contact] limitation indisponible', error);
    }
  }

  const [stored, relayed] = await Promise.all([
    db
      ? db
          .insert(contactRequests)
          .values({
            full_name: input.fullName,
            phone: input.phone,
            topic: input.topic,
            message: input.message ?? '',
          })
          .then(() => true)
          .catch((error: unknown) => {
            console.error('[contact] enregistrement impossible', error);
            return false;
          })
      : Promise.resolve(false),
    relayToWebhook(process.env.CONTACT_WEBHOOK_URL, {
      fullName: input.fullName,
      phone: input.phone,
      topic: input.topic,
      message: input.message ?? '',
      receivedAt: new Date().toISOString(),
    }),
  ]);

  if (stored || relayed === 'sent') {
    if (db) {
      await purgeExpiredContactRequests(db).catch((error: unknown) => {
        console.error('[contact] effacement des anciennes demandes impossible', error);
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!db && relayed === 'not-configured') {
    // Ni base ni relais : la demande n'est conservée que dans les journaux.
    console.warn('[contact] ni base ni CONTACT_WEBHOOK_URL — demande tracée ici seulement', {
      fullName: input.fullName,
      topic: input.topic,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ error: 'Demande non transmise.' }, { status: 502 });
}
