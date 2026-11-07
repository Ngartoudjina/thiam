import { z } from 'zod';
import { FORM_TOPIC_LABELS } from '@/constants/services';

/**
 * Schémas de validation partagés entre le client et la route API.
 * Une seule définition : le formulaire, le typage et le contrôle serveur
 * ne peuvent pas diverger.
 */

/** Numéros béninois et internationaux, espaces et séparateurs tolérés. */
const PHONE_PATTERN = /^\+?[0-9\s().-]{8,20}$/;

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Indiquez votre nom, même en une ligne.')
    .max(80, 'Ce nom est un peu long — abrégez-le.'),
  phone: z
    .string()
    .trim()
    .min(8, 'Un numéro joignable nous permet de vous rappeler.')
    .max(20, 'Ce numéro comporte trop de caractères.')
    .regex(PHONE_PATTERN, 'Ce numéro ne semble pas valide.'),
  topic: z
    .string()
    .min(1, 'Choisissez un sujet.')
    .refine(
      (value) => Object.hasOwn(FORM_TOPIC_LABELS, value),
      'Choisissez un sujet dans la liste.',
    ),
  message: z
    .string()
    .trim()
    .max(1200, 'Message trop long — allez à l’essentiel, nous vous rappellerons.')
    .optional()
    .or(z.literal('')),
  /** Champ leurre : rempli uniquement par les robots. */
  company: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.email('Cette adresse e-mail ne semble pas valide.').max(200, 'Adresse trop longue.'),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
