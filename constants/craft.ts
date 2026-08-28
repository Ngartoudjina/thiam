import type { CraftPillar, Milestone, TrustSignal } from '@/types';

/** Bandeau de réassurance sous le hero. */
export const TRUST_SIGNALS: readonly TrustSignal[] = [
  { icon: 'hallmark', label: 'Or poinçonné 18/24K', mobileLabel: 'Or poinçonné' },
  { icon: 'certificate', label: 'Certificat remis', mobileLabel: 'Certificat remis' },
  { icon: 'workshop', label: 'Atelier sur place', mobileLabel: 'Atelier sur place' },
] as const;

/** « Ce qui ne se voit pas sur la photo » — l'escalier de garanties. */
export const CRAFT_PILLARS: readonly CraftPillar[] = [
  {
    index: '01',
    title: 'Expertise',
    description:
      'Quatorze ans d’œil. Nous reconnaissons un titrage à la main avant de le confirmer à l’acide — et nous vous le montrons.',
    mobileTitle: 'Pesé devant vous',
    mobileDescription: 'Balance certifiée, titre testé, certificat nominatif remis.',
  },
  {
    index: '02',
    title: 'Authenticité',
    description:
      'Chaque pièce est pesée devant vous et repart avec son certificat nominatif : poids, titre, prix au gramme.',
    mobileTitle: 'Réparé sur place',
    mobileDescription: 'Fermoirs, chaînes, chatons — souvent dans la journée.',
  },
  {
    index: '03',
    title: 'Conseil franc',
    description:
      'Il nous arrive de vous dire d’attendre, ou de choisir plus simple. C’est précisément ce qui nous ramène nos clients.',
    mobileTitle: 'Gravé à la main',
    mobileDescription: 'Prénoms, dates, versets — offert sur les alliances.',
  },
  {
    index: '04',
    title: 'Garantie écrite',
    description:
      'Échange, reprise, mise à taille : douze mois couverts, sur un document que vous emportez.',
    mobileTitle: 'Suivi à vie',
    mobileDescription: 'Nettoyage et polissage gratuits, sans limite de durée.',
  },
  {
    index: '05',
    title: 'Réparation',
    description:
      'Fermoirs, chaînes rompues, chatons desserrés. Réparés à l’atelier, le plus souvent dans la journée.',
  },
  {
    index: '06',
    title: 'Gravure',
    description:
      'Prénoms, dates, versets. À la main ou à la machine — offerte sur toutes les alliances.',
  },
  {
    index: '07',
    title: 'Suivi à vie',
    description:
      'Nettoyage et polissage gratuits, sans limite de durée, sur tout bijou acheté chez nous.',
  },
] as const;

/** Nombre de piliers repris sur la version mobile de la maquette. */
export const MOBILE_PILLAR_COUNT = 4;

/** « D'un comptoir à une maison » — la chronologie. */
export const MILESTONES: readonly Milestone[] = [
  {
    year: '2012',
    title: 'Le premier comptoir',
    description:
      'Deux vitrines, une balance certifiée, et la règle qui ne changera jamais : le poids annoncé est le poids réel.',
  },
  {
    year: '2016',
    title: 'L’atelier',
    description:
      'Nous cessons d’envoyer les réparations ailleurs. Soudure, polissage et mise à taille se font désormais chez nous.',
  },
  {
    year: '2020',
    title: 'La boutique actuelle',
    description:
      'Un salon privé pour les essayages d’alliances, un coffre, et l’éclairage qui rend justice à l’or.',
  },
  {
    year: '2025',
    title: 'Le sur-mesure',
    description:
      'Dessin, cire, fonte : nous créons désormais des pièces uniques à partir d’une simple idée — ou d’un vieux bijou de famille.',
  },
] as const;

export const FOUNDER_QUOTE = {
  quote: 'Nous ne vendons pas du métal. Nous rendons un service, et l’or vient avec.',
  author: 'M. Thiam, fondateur',
} as const;

export const HOUSE_QUOTE = {
  quote: 'Un bijou n’est pas un objet. C’est une promesse que l’on porte sur soi.',
  author: 'Maison THIAM · Cotonou',
} as const;

export const SHOP_QUOTE = {
  quote: 'Entrez, même sans rien acheter. On vous montrera volontiers l’atelier.',
} as const;

/**
 * Rachat d'or — activité centrale de la maison, mise en avant sur l'accueil.
 * Le protocole est volontairement tenu en trois gestes : ce que le client
 * doit savoir avant de se déplacer, rien de plus.
 */
export const BUYBACK = {
  eyebrow: 'Rachat d’or',
  titleLine1: 'Nous rachetons',
  titleLine2: 'votre or',
  description:
    'Bijoux cassés, pièces héritées, or dentaire : nous reprenons votre or au cours du jour, pesé et testé devant vous. Paiement immédiat, sans engagement si l’estimation ne vous convient pas.',
  question: 'Comment faire ?',
  steps: [
    {
      index: '01',
      title: 'Munissez-vous de votre pièce d’identité',
      description:
        'À préparer avant votre arrivée : le rachat d’or est encadré, une pièce d’identité en cours de validité est obligatoire.',
    },
    {
      index: '02',
      title: 'Passez à la boutique',
      description:
        'Sans rendez-vous, du lundi au samedi. Apportez vos pièces telles quelles, même abîmées ou dépareillées.',
    },
    {
      index: '03',
      title: 'Pesée et vérification devant vous',
      description:
        'Balance certifiée et test du titre menés sous vos yeux. Le prix suit le cours du jour affiché en boutique.',
    },
  ],
  cta: 'Estimer mon or sur WhatsApp',
} as const;
