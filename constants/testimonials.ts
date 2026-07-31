import type { Stat, Testimonial } from '@/types';

/** Bandeau de preuve sociale sous le hero. */
export const STATS: readonly Stat[] = [
  {
    value: 14,
    label: 'Années au service\ndes familles de Cotonou',
    mobileLabel: 'Années à Cotonou',
  },
  {
    value: 6200,
    label: 'Clients accompagnés\net fidèles',
    mobileLabel: 'Clients fidèles',
  },
  {
    value: 4.9,
    decimals: 1,
    suffix: '/5',
    label: 'Note moyenne\nsur 340 avis',
    mobileLabel: '340 avis',
  },
  {
    value: 100,
    suffix: '%',
    label: 'Or contrôlé, pesé\net garanti par écrit',
    mobileLabel: 'Or garanti',
    mobileDisplay: '24K',
  },
] as const;

export const RATING = { value: 4.9, count: 340, best: 5 } as const;

/** Avis mis en avant dans le hero. */
export const HERO_TESTIMONIAL: Testimonial = {
  quote:
    'J’ai fait graver nos alliances ici. L’accueil, la patience, la finition : rien à voir avec ce que j’avais connu ailleurs.',
  author: 'Aïcha D.',
  context: 'Mariée en 2025 · Cotonou',
  rating: 5,
} as const;

/** Témoignage principal de la section « Ce que l'on dit de nous, en ville ». */
export const FEATURED_TESTIMONIAL: Testimonial = {
  quote:
    'Ma mère achetait déjà ici. J’y suis venue pour mes alliances, et on m’a expliqué chaque gramme, chaque soudure. On ne m’a rien vendu — on m’a conseillée.',
  author: 'Fatou A.',
  context: 'Cliente depuis 2018 · Cotonou',
  rating: 5,
} as const;

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: 'Chaîne cassée le matin, réparée le soir même. Invisible. Je ne vais plus ailleurs.',
    author: 'Ibrahim S.',
    context: 'Réparation · 2025',
    rating: 5,
  },
  {
    quote:
      'J’ai fait transformer les bijoux de ma grand-mère en un collier pour ma fille. Le résultat m’a fait pleurer.',
    author: 'Grâce H.',
    context: 'Sur mesure · 2024',
    rating: 5,
  },
  {
    quote: 'Ils m’ont dit d’attendre le bon modèle plutôt que de me vendre celui en vitrine. Rare.',
    author: 'Serge K.',
    context: 'Conseil · 2025',
    rating: 5,
  },
] as const;
