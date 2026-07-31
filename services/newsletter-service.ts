import type { NewsletterInput } from '@/lib/validation';
import type { SubmissionResult } from '@/services/contact-service';

export async function subscribeToNewsletter(input: NewsletterInput): Promise<SubmissionResult> {
  try {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    return response.ok
      ? { ok: true, message: 'Inscription confirmée.' }
      : { ok: false, message: 'L’inscription n’a pas abouti.' };
  } catch {
    return { ok: false, message: 'Connexion interrompue.' };
  }
}
