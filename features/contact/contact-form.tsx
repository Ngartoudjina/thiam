'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { m } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { ArrowRightIcon } from '@/components/common/icons';
import { TextAreaField, TextField, TopicChoice } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { contactSchema, type ContactInput } from '@/lib/validation';
import { submitContactRequest } from '@/services/contact-service';
import { DURATION, EASE_EDITORIAL, STAGGER, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ProjectTopic } from '@/types';

/** « Les champs du formulaire montent de 14 px en cascade. » */
const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE_EDITORIAL } },
};

interface ContactFormProps {
  readonly id: string;
  readonly topics: readonly ProjectTopic[];
  readonly topicLegend: string;
  readonly submitLabel: string;
  readonly note: string;
  readonly messageRows?: number;
}

/**
 * Formulaire de demande.
 * Validation Zod partagée avec la route API : le message d'erreur affiché est
 * exactement celui que le serveur appliquerait.
 */
export function ContactForm({
  id,
  topics,
  topicLegend,
  submitLabel,
  note,
  messageRows = 3,
}: ContactFormProps) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      phone: '+229 ',
      topic: topics[0]?.value ?? '',
      message: '',
      company: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await submitContactRequest(values);
    setFeedback(result);

    if (result.ok) {
      reset({ ...values, fullName: '', message: '', phone: '+229 ' });
    }
  });

  return (
    <m.form
      onSubmit={onSubmit}
      noValidate
      variants={staggerContainer(STAGGER.tight)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Champ leurre : invisible pour l'humain, irrésistible pour les robots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`${id}-company`}>Société</label>
        <input
          id={`${id}-company`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('company')}
        />
      </div>

      <div className="mb-8 grid gap-7 md:grid-cols-2 md:gap-x-6.5">
        <m.div variants={fieldVariants}>
          <TextField
            id={`${id}-nom`}
            label="Nom complet"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
        </m.div>

        <m.div variants={fieldVariants}>
          <TextField
            id={`${id}-tel`}
            label="Téléphone / WhatsApp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </m.div>

        <m.div variants={fieldVariants} className="md:col-span-2">
          <Controller
            name="topic"
            control={control}
            render={({ field }) => (
              <TopicChoice
                name={`${id}-sujet`}
                legend={topicLegend}
                options={topics}
                value={field.value}
                onChange={field.onChange}
                error={errors.topic?.message}
              />
            )}
          />
        </m.div>

        <m.div variants={fieldVariants} className="md:col-span-2">
          <TextAreaField
            id={`${id}-message`}
            label="Message"
            rows={messageRows}
            error={errors.message?.message}
            {...register('message')}
          />
        </m.div>
      </div>

      <m.div
        variants={fieldVariants}
        className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button type="submit" variant="ivory" size="xl" disabled={isSubmitting}>
          {isSubmitting ? 'Envoi en cours…' : submitLabel}
          <ArrowRightIcon size={17} />
        </Button>

        <p className="max-w-[15.625rem] text-caption-lg leading-[1.6] font-normal text-on-dark-faint">
          {note}
        </p>
      </m.div>

      <p
        aria-live="polite"
        className={cn(
          'mt-6 text-body-sm font-normal',
          feedback ? (feedback.ok ? 'text-open-soft' : 'text-gold-light') : 'sr-only',
        )}
      >
        {feedback?.message ?? ''}
      </p>
    </m.form>
  );
}
