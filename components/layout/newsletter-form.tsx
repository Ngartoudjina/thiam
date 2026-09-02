'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { ArrowRightIcon } from '@/components/common/icons';
import { newsletterSchema, type NewsletterInput } from '@/lib/validation';
import { subscribeToNewsletter } from '@/services/newsletter-service';
import { cn } from '@/lib/utils';

/**
 * Inscription à la lettre de la maison — rythme des nouvelles pièces et des
 * arrivages. Traitement discret, accordé au pied de page nocturne.
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await subscribeToNewsletter(values);
    setStatus(result.ok ? 'success' : 'error');
    if (result.ok) reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-sm">
      <label
        htmlFor="newsletter-email"
        className="mb-4 block text-micro tracking-(--tracking-address) text-gold-dim uppercase"
      >
        La lettre de la maison
      </label>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="votre@email.com"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'newsletter-email-error' : 'newsletter-hint'}
            className={cn(
              'w-full border-b bg-transparent pb-2.5 text-body-sm font-normal text-ink',
              'placeholder:text-[rgb(22_18_15/0.3)] focus:outline-none',
              'transition-colors duration-(--duration-state) ease-out focus:border-gold',
              errors.email ? 'border-gold-light' : 'border-[rgb(22_18_15/0.2)]',
            )}
            {...register('email')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex size-11 shrink-0 items-center justify-center border border-[rgb(22_18_15/0.2)] text-ink transition-colors duration-(--duration-state) ease-out hover:border-gold hover:text-gold-light disabled:opacity-55"
        >
          <span className="sr-only">S’inscrire à la lettre</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>

      <p
        id={errors.email ? 'newsletter-email-error' : 'newsletter-hint'}
        role={errors.email ? 'alert' : undefined}
        aria-live="polite"
        className={cn(
          'mt-3 text-caption font-normal',
          errors.email ? 'text-gold-light' : 'text-on-dark-faint',
        )}
      >
        {errors.email?.message ??
          (status === 'success'
            ? 'Merci — vous recevrez nos prochaines pièces.'
            : status === 'error'
              ? 'L’inscription n’a pas abouti. Réessayez dans un instant.'
              : 'Quelques nouvelles par an, jamais plus.')}
      </p>
    </form>
  );
}
