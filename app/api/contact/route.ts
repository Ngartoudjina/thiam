import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Fenêtre de limitation : 5 envois par adresse et par quart d'heure. */
const RATE_LIMIT = { windowMs: 15 * 60_000, max: 5 } as const;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

/**
 * Réception des demandes de rendez-vous.
 *
 * La validation reprend le schéma du formulaire : un envoi forgé hors
 * navigateur subit exactement les mêmes règles. Le champ leurre et une
 * limitation par IP écartent les robots sans imposer de captcha au visiteur.
 *
 * Branchement : renseigner `CONTACT_WEBHOOK_URL` pour relayer vers l'outil de
 * la maison (CRM, e-mail transactionnel, Google Sheet…).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'inconnu';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez dans quelques minutes.' },
      { status: 429 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Champ leurre rempli : on répond « reçu » sans rien transmettre.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    // Sans destination configurée, la demande est tracée côté serveur pour
    // que le déploiement ne perde jamais silencieusement un message.
    console.warn('[contact] CONTACT_WEBHOOK_URL absent — demande non relayée', {
      fullName: parsed.data.fullName,
      topic: parsed.data.topic,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...parsed.data,
        source: 'site-thiam-24-carats',
        receivedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Relais indisponible.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Relais injoignable.' }, { status: 502 });
  }
}
