import 'server-only';

export type RelayOutcome = 'sent' | 'failed' | 'not-configured';

/**
 * Relaie un envoi de formulaire vers un outil tiers (Make, Zapier, CRM…).
 * Délai de huit secondes : un relais lent ne doit pas retenir le visiteur.
 */
export async function relayToWebhook(
  url: string | undefined,
  payload: Record<string, unknown>,
): Promise<RelayOutcome> {
  const target = url?.trim();
  if (!target) return 'not-configured';

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, source: 'site-thiam-24-carats' }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) console.error('[relais] réponse en erreur', response.status);
    return response.ok ? 'sent' : 'failed';
  } catch (error) {
    console.error('[relais] injoignable', error);
    return 'failed';
  }
}
