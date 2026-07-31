import { NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Inscription à la lettre de la maison.
 * Renseigner `NEWSLETTER_WEBHOOK_URL` pour relayer vers l'outil d'emailing.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Adresse invalide.' }, { status: 422 });
  }

  const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[newsletter] NEWSLETTER_WEBHOOK_URL absent — inscription non relayée');
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: parsed.data.email, source: 'site-thiam-24-carats' }),
    });

    return response.ok
      ? NextResponse.json({ ok: true }, { status: 200 })
      : NextResponse.json({ error: 'Relais indisponible.' }, { status: 502 });
  } catch {
    return NextResponse.json({ error: 'Relais injoignable.' }, { status: 502 });
  }
}
