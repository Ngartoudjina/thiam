import type { ContactInput } from '@/lib/validation';

export interface SubmissionResult {
  readonly ok: boolean;
  readonly message: string;
}

/**
 * Envoi d'une demande de rendez-vous.
 * Le composant de formulaire ne connaît que ce contrat : brancher un CRM, un
 * webhook ou un service d'e-mail ne touchera aucun fichier d'interface.
 */
export async function submitContactRequest(input: ContactInput): Promise<SubmissionResult> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: 'Votre demande n’a pas pu être transmise. Écrivez-nous sur WhatsApp.',
      };
    }

    return {
      ok: true,
      message: 'Demande reçue. Nous vous répondons en général dans l’heure.',
    };
  } catch {
    return {
      ok: false,
      message: 'Connexion interrompue. Réessayez, ou écrivez-nous sur WhatsApp.',
    };
  }
}
