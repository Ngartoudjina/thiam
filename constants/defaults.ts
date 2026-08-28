import { FOUNDER_QUOTE, MILESTONES } from '@/constants/craft';
import { MEDIA } from '@/constants/media';
import { ROUTES } from '@/constants/navigation';
import { CONTACT, LOCATION, OPENING_HOURS, OPENING_SUMMARY, SOCIAL } from '@/constants/site';
import { STATS } from '@/constants/testimonials';
import type {
  AboutContent,
  ContactSettings,
  HeroContent,
  HoursContent,
  StatsContent,
} from '@/lib/schemas/content';

/**
 * Valeurs de repli des blocs singuliers.
 *
 * Elles reprennent mot pour mot la maquette et alimentent deux usages :
 * l'affichage tant que Supabase n'a rien à dire, et l'amorçage de la base
 * (`npm run db:seed`) pour que le tableau de bord démarre plein.
 */

export const DEFAULT_HERO: HeroContent = {
  eyebrow: `${LOCATION.city} · ${LOCATION.country}`,
  titleLine1: 'Une référence',
  titleLine2: 'de qualité',
  description:
    'Or, argent et diamant. Alliances gravées à la main et parures de dot, façonnées dans notre atelier de Cotonou — et rachat d’or au cours du jour.',
  descriptionMobile: 'Or, argent et diamant. Alliances, parures de dot et rachat d’or.',
  primaryCta: { label: 'Prendre rendez-vous', href: CONTACT.whatsappHref },
  secondaryCta: { label: 'Découvrir les collections', href: ROUTES.collections },
  imagePath: '',
  imageAlt: MEDIA.heroParure.alt,
};

export const DEFAULT_ABOUT: AboutContent = {
  eyebrow: 'Notre histoire',
  titleLine1: 'D’un comptoir',
  titleLine2: 'à une maison',
  description:
    'Tout a commencé par une balance, une loupe et une réputation qui circulait de bouche à oreille dans les marchés de Cotonou. Le reste s’est construit client après client.',
  quote: FOUNDER_QUOTE.quote,
  quoteAuthor: FOUNDER_QUOTE.author,
  portraitPath: '',
  portraitAlt: 'Portrait du fondateur de la maison',
  milestones: MILESTONES.map((milestone) => ({
    year: milestone.year,
    title: milestone.title,
    description: milestone.description,
  })),
};

export const DEFAULT_CONTACT: ContactSettings = {
  phoneDisplay: CONTACT.phoneDisplay,
  phoneE164: CONTACT.phoneE164,
  whatsappNumber: CONTACT.phoneE164.replace('+', ''),
  email: CONTACT.email,
  streetAddress: LOCATION.streetAddress,
  city: LOCATION.city,
  country: LOCATION.country,
  mapsQuery: LOCATION.mapsQuery,
  mapsEmbedSrc: process.env.NEXT_PUBLIC_MAPS_EMBED_SRC ?? '',
  instagram: SOCIAL.instagram,
  facebook: SOCIAL.facebook,
};

export const DEFAULT_HOURS: HoursContent = {
  summary: OPENING_SUMMARY,
  days: OPENING_HOURS.map((day) => ({
    label: day.label,
    display: day.display,
    weekdays: [...day.weekdays],
    ranges: day.ranges.map((range) => ({ ...range })),
    byAppointmentOnly: day.byAppointmentOnly ?? false,
  })),
};

export const DEFAULT_STATS: StatsContent = {
  items: STATS.map((stat) => ({
    value: stat.value,
    decimals: stat.decimals ?? 0,
    suffix: stat.suffix ?? '',
    label: stat.label,
    mobileLabel: stat.mobileLabel,
    mobileDisplay: stat.mobileDisplay ?? '',
  })),
};
