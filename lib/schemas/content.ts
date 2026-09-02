import { z } from 'zod';

/**
 * Contrats de contenu.
 *
 * Une seule définition sert au formulaire du tableau de bord, à l'action
 * serveur qui écrit en base, et à la lecture du JSON stocké dans `settings`.
 * Un contenu mal formé en base est donc rattrapé à la lecture, jamais rendu.
 */

const trimmed = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max, `Ce champ dépasse ${max} caractères.`);

export const statusSchema = z.enum(['visible', 'hidden']);
export type ContentStatusInput = z.infer<typeof statusSchema>;

/** Identifiant d'URL : minuscules, chiffres et tirets. */
export const slugSchema = z
  .string()
  .trim()
  .min(2, 'Deux caractères minimum.')
  .max(60, 'Soixante caractères maximum.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Minuscules, chiffres et tirets uniquement.');

/* -------------------------------------------------------------------------- */
/*  Collections                                                                */
/* -------------------------------------------------------------------------- */

export const collectionSchema = z.object({
  name: trimmed(2, 60, 'Le nom est obligatoire.'),
  slug: slugSchema,
  tagline: z.string().trim().max(80, 'Quatre-vingts caractères maximum.').default(''),
  description: z
    .string()
    .trim()
    .max(600, 'Six cents caractères maximum.')
    .optional()
    .or(z.literal('')),
  category: trimmed(2, 40, 'La catégorie est obligatoire.'),
  status: statusSchema,
});

export type CollectionInput = z.infer<typeof collectionSchema>;

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

export const serviceIconSchema = z.enum([
  'repair',
  'polish',
  'engrave',
  'bespoke',
  'appraise',
  'buyback',
  'advice',
]);

export const serviceSchema = z.object({
  title: trimmed(2, 80, 'Le titre est obligatoire.'),
  description: z.string().trim().max(300, 'Trois cents caractères maximum.').default(''),
  price: z.string().trim().max(60, 'Soixante caractères maximum.').default(''),
  icon: serviceIconSchema,
  status: statusSchema,
});

export type ServiceInput = z.infer<typeof serviceSchema>;

/* -------------------------------------------------------------------------- */
/*  Témoignages                                                                */
/* -------------------------------------------------------------------------- */

export const testimonialSchema = z.object({
  quote: trimmed(10, 600, 'Le témoignage est obligatoire.'),
  author: trimmed(2, 60, 'Le nom du client est obligatoire.'),
  context: z.string().trim().max(80, 'Quatre-vingts caractères maximum.').default(''),
  rating: z.coerce.number().int().min(1, 'Note entre 1 et 5.').max(5, 'Note entre 1 et 5.'),
  isFeatured: z.boolean().default(false),
  status: statusSchema,
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

/* -------------------------------------------------------------------------- */
/*  Questions fréquentes                                                       */
/* -------------------------------------------------------------------------- */

export const faqSchema = z.object({
  question: trimmed(5, 200, 'La question est obligatoire.'),
  answer: trimmed(10, 1500, 'La réponse est obligatoire.'),
  status: statusSchema,
});

export type FaqInput = z.infer<typeof faqSchema>;

/* -------------------------------------------------------------------------- */
/*  Galerie                                                                    */
/* -------------------------------------------------------------------------- */

export const galleryImageSchema = z.object({
  alt: trimmed(3, 160, 'Le texte alternatif est obligatoire — il est lu par les lecteurs d’écran.'),
  caption: z
    .string()
    .trim()
    .max(80, 'Quatre-vingts caractères maximum.')
    .optional()
    .or(z.literal('')),
  colSpan: z.coerce.number().int().min(1).max(2),
  rowSpan: z.coerce.number().int().min(2).max(3),
  status: statusSchema,
});

export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

/* -------------------------------------------------------------------------- */
/*  Blocs singuliers stockés dans `settings`                                   */
/* -------------------------------------------------------------------------- */

const ctaSchema = z.object({
  label: trimmed(2, 40, 'Le libellé est obligatoire.'),
  href: trimmed(1, 300, 'La destination est obligatoire.'),
});

export const heroSchema = z.object({
  eyebrow: trimmed(2, 60, 'Le sur-titre est obligatoire.'),
  titleLine1: trimmed(1, 60, 'La première ligne est obligatoire.'),
  titleLine2: trimmed(1, 60, 'La seconde ligne est obligatoire.'),
  description: trimmed(10, 400, 'Le paragraphe est obligatoire.'),
  descriptionMobile: z.string().trim().max(240).default(''),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  imagePath: z.string().trim().max(400).default(''),
  imageAlt: z.string().trim().max(160).default(''),
});

export type HeroContent = z.infer<typeof heroSchema>;

export const milestoneSchema = z.object({
  year: trimmed(2, 10, 'L’année est obligatoire.'),
  title: trimmed(2, 80, 'Le titre est obligatoire.'),
  description: trimmed(5, 400, 'La description est obligatoire.'),
});

export const aboutSchema = z.object({
  eyebrow: trimmed(2, 60, 'Le sur-titre est obligatoire.'),
  titleLine1: trimmed(1, 60, 'La première ligne est obligatoire.'),
  titleLine2: trimmed(1, 60, 'La seconde ligne est obligatoire.'),
  description: trimmed(10, 600, 'Le paragraphe est obligatoire.'),
  quote: trimmed(5, 400, 'La citation est obligatoire.'),
  quoteAuthor: trimmed(2, 80, 'L’auteur de la citation est obligatoire.'),
  portraitPath: z.string().trim().max(400).default(''),
  portraitAlt: z.string().trim().max(160).default(''),
  milestones: z.array(milestoneSchema).max(12, 'Douze jalons maximum.'),
});

export type AboutContent = z.infer<typeof aboutSchema>;

const PHONE_PATTERN = /^\+?[0-9\s().-]{8,20}$/;

export const contactSettingsSchema = z.object({
  phoneDisplay: trimmed(8, 30, 'Le numéro affiché est obligatoire.').regex(
    PHONE_PATTERN,
    'Ce numéro ne semble pas valide.',
  ),
  phoneE164: trimmed(8, 20, 'Le numéro international est obligatoire.').regex(
    /^\+[0-9]{8,18}$/,
    'Format international attendu, par exemple +2290197844022.',
  ),
  whatsappNumber: trimmed(8, 20, 'Le numéro WhatsApp est obligatoire.').regex(
    /^[0-9]{8,18}$/,
    'Chiffres uniquement, sans le signe plus.',
  ),
  email: z.email('Cette adresse e-mail ne semble pas valide.'),
  streetAddress: z.string().trim().max(200).default(''),
  city: trimmed(2, 80, 'La ville est obligatoire.'),
  country: trimmed(2, 80, 'Le pays est obligatoire.'),
  mapsQuery: z.string().trim().max(300).default(''),
  mapsEmbedSrc: z.string().trim().max(600).default(''),
  instagram: z.string().trim().max(300).default(''),
  facebook: z.string().trim().max(300).default(''),
});

export type ContactSettings = z.infer<typeof contactSettingsSchema>;

const openingRangeSchema = z.object({
  opensAt: z.string().regex(/^\d{2}:\d{2}$/, 'Format attendu : 09:00.'),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/, 'Format attendu : 21:00.'),
});

export const openingDaySchema = z.object({
  label: trimmed(2, 40, 'Le libellé est obligatoire.'),
  display: trimmed(2, 60, 'L’horaire affiché est obligatoire.'),
  weekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1, 'Au moins un jour.'),
  ranges: z.array(openingRangeSchema),
  byAppointmentOnly: z.boolean().default(false),
});

export const hoursSchema = z.object({
  summary: trimmed(2, 80, 'Le résumé est obligatoire.'),
  days: z.array(openingDaySchema).min(1, 'Au moins une ligne d’horaire.'),
});

export type HoursContent = z.infer<typeof hoursSchema>;

export const statSchema = z.object({
  value: z.coerce.number(),
  decimals: z.coerce.number().int().min(0).max(2).default(0),
  suffix: z.string().trim().max(6).default(''),
  label: trimmed(2, 120, 'Le libellé est obligatoire.'),
  mobileLabel: trimmed(2, 60, 'Le libellé mobile est obligatoire.'),
  mobileDisplay: z.string().trim().max(12).default(''),
});

export const statsSchema = z.object({
  items: z.array(statSchema).min(1).max(6),
});

export type StatsContent = z.infer<typeof statsSchema>;

/** Clés autorisées dans la table `settings`. */
export const SETTING_KEYS = {
  hero: 'hero',
  about: 'about',
  contact: 'contact',
  hours: 'hours',
  stats: 'stats',
  visuals: 'visuals',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/* -------------------------------------------------------------------------- */
/*  Visuels fixes du site                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Emplacements photographiques qui ne relèvent ni d'une collection ni de la
 * galerie : les grandes images de composition. Chacun est remplaçable depuis
 * le tableau de bord ; tant qu'aucune photo n'est fournie, la maquette sert de
 * repli.
 */
const visualSchema = z.object({
  /** Chemin dans le compartiment de stockage. Vide = visuel de la maquette. */
  path: z.string().trim().max(400).default(''),
  alt: z.string().trim().max(200).default(''),
});

export const visualsSchema = z.object({
  heroMain: visualSchema,
  heroCard: visualSchema,
  buyback: visualSchema,
  quoteBand: visualSchema,
  visitBand: visualSchema,
  testimonialPortrait: visualSchema,
  dowry: visualSchema,
  contactPhoto: visualSchema,
});

export type VisualsContent = z.infer<typeof visualsSchema>;
export type VisualSlotId = keyof VisualsContent;

interface VisualSlotDefinition {
  readonly id: VisualSlotId;
  readonly page: string;
  readonly label: string;
  readonly hint: string;
  /** Proportion attendue, pour guider le cadrage lors du téléversement. */
  readonly aspect: 'portrait' | 'paysage' | 'carre';
}

/** Décrit chaque emplacement pour le tableau de bord. */
export const VISUAL_SLOTS: readonly VisualSlotDefinition[] = [
  {
    id: 'heroMain',
    page: 'Accueil',
    label: 'Grande photo du hero',
    hint: 'La première image du site, à droite du titre. Format vertical.',
    aspect: 'portrait',
  },
  {
    id: 'heroCard',
    page: 'Accueil',
    label: 'Carte flottante du hero',
    hint: 'Le petit cadre posé sur la grande photo. Format vertical.',
    aspect: 'portrait',
  },
  {
    id: 'buyback',
    page: 'Accueil',
    label: 'Rachat d’or',
    hint: 'Illustre le protocole de rachat. Format vertical.',
    aspect: 'portrait',
  },
  {
    id: 'quoteBand',
    page: 'Accueil',
    label: 'Bandeau de citation',
    hint: 'Photo large derrière « Un bijou n’est pas un objet ».',
    aspect: 'paysage',
  },
  {
    id: 'visitBand',
    page: 'Accueil',
    label: 'Bandeau « Passez la porte »',
    hint: 'Photo large en tête du bloc de visite. Idéalement la devanture.',
    aspect: 'paysage',
  },
  {
    id: 'testimonialPortrait',
    page: 'Accueil',
    label: 'Portrait de cliente',
    hint: 'À côté du grand témoignage. Format vertical.',
    aspect: 'portrait',
  },
  {
    id: 'dowry',
    page: 'Collections',
    label: 'Coffret de dot',
    hint: 'Accompagne la parure complète de cérémonie.',
    aspect: 'portrait',
  },
  {
    id: 'contactPhoto',
    page: 'Contact',
    label: 'Photo de la page Contact',
    hint: 'Colonne de droite, pleine hauteur. Format vertical.',
    aspect: 'portrait',
  },
] as const;
