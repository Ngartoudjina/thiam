import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';
import { RATE_LIMITS, clientAddress, consumeRateLimit, fingerprint } from '@/lib/rate-limit';
import { newsletterSchema } from '@/lib/validation';
import { relayToWebhook } from '@/services/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Inscription à la lettre de la maison.
 *
 * L'adresse est enregistrée en base — la liste s'exporte depuis le tableau
 * de bord — et relayée vers `NEWSLETTER_WEBHOOK_URL` si elle est renseignée.
 * Une adresse déjà inscrite reçoit la même réponse qu'une nouvelle : la route
 * ne révèle pas qui est abonné.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'Adresse invalide.' }, { status: 422 });

  const email = parsed.data.email.trim().toLowerCase();
  const db = getDb();

  if (db) {
    try {
      const visitor = fingerprint(clientAddress(request.headers));
      const limit = await consumeRateLimit(db, `lettre:${visitor}`, RATE_LIMITS.newsletter);

      if (!limit.allowed) {
        return NextResponse.json(
          { error: 'Trop de demandes. Réessayez dans quelques minutes.' },
          { status: 429 },
        );
      }
    } catch (error) {
      console.error('[lettre] limitation indisponible', error);
    }
  }

  const [stored, relayed] = await Promise.all([
    db
      ? db
          .insert(newsletterSubscribers)
          .values({ email })
          .onConflictDoNothing({ target: newsletterSubscribers.email })
          .then(() => true)
          .catch((error: unknown) => {
            console.error('[lettre] enregistrement impossible', error);
            return false;
          })
      : Promise.resolve(false),
    relayToWebhook(process.env.NEWSLETTER_WEBHOOK_URL, { email }),
  ]);

  if (stored || relayed === 'sent' || (!db && relayed === 'not-configured')) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ error: 'Inscription non enregistrée.' }, { status: 502 });
}
