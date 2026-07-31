import type { ProjectTopic, Service } from '@/types';

/** « Tout ce que l'on fait après la vente ». */
export const SERVICES: readonly Service[] = [
  {
    icon: 'repair',
    title: 'Réparation',
    description: 'Chaînes, fermoirs, anneaux, chatons desserrés — soudure à l’atelier.',
    price: 'Dès 5 000 F',
  },
  {
    icon: 'polish',
    title: 'Nettoyage & polissage',
    description: 'Bain ultrasons et lustrage. L’or retrouve sa lumière du premier jour.',
    price: 'Offert à nos clients',
  },
  {
    icon: 'engrave',
    title: 'Gravure',
    description: 'Prénoms, dates, versets. À la main pour les pièces délicates.',
    price: 'Dès 2 500 F',
  },
  {
    icon: 'bespoke',
    title: 'Création sur mesure',
    description: 'Du croquis à la pièce finie. Vos anciens bijoux peuvent servir de matière.',
    price: 'Devis en 48 h',
  },
  {
    icon: 'appraise',
    title: 'Expertise & pesée',
    description: 'Titre, poids et valeur estimée, établis devant vous, sans engagement.',
    price: 'Gratuit',
  },
  {
    icon: 'buyback',
    title: 'Rachat d’or',
    description: 'Paiement immédiat, au cours du jour affiché en boutique.',
    price: 'Cours du jour',
  },
  {
    icon: 'advice',
    title: 'Conseil privé',
    description: 'Un rendez-vous, un salon fermé, le temps qu’il faut pour choisir.',
    price: 'Sur rendez-vous',
  },
] as const;

/** Sujets proposés dans le formulaire de la page d'accueil. */
export const HOME_FORM_TOPICS: readonly ProjectTopic[] = [
  { value: 'alliances', label: 'Alliances' },
  { value: 'diamant', label: 'Diamant' },
  { value: 'sur-mesure', label: 'Sur mesure' },
  { value: 'reparation', label: 'Réparation' },
  { value: 'estimation', label: 'Estimation' },
  { value: 'autre', label: 'Autre' },
] as const;

/** Sujets proposés sur la page Contact. */
export const CONTACT_FORM_TOPICS: readonly ProjectTopic[] = [
  { value: 'rendez-vous', label: 'Rendez-vous' },
  { value: 'devis-sur-mesure', label: 'Devis sur mesure' },
  { value: 'reparation', label: 'Réparation' },
  { value: 'estimation', label: 'Estimation' },
] as const;
