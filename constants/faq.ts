import type { FaqEntry } from '@/types';

/** « Ce que l'on nous demande souvent » — alimente aussi le JSON-LD FAQPage. */
export const FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    question: 'Comment garantissez-vous le titrage de l’or ?',
    answer:
      'Chaque pièce est poinçonnée et testée à l’acide devant vous si vous le souhaitez. Vous repartez avec un certificat nominatif mentionnant le titre (18K, 21K ou 24K), le poids exact et le prix au gramme appliqué le jour de l’achat.',
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      'Espèces, Mobile Money et virement. Pour les pièces importantes et le sur-mesure, un règlement en deux ou trois fois est possible : la pièce est réservée à votre nom jusqu’au solde.',
  },
  {
    question: 'Combien de temps pour une création sur mesure ?',
    answer:
      'Le dessin vous est proposé sous 48 heures. Comptez ensuite deux à trois semaines selon la complexité de la pièce et la disponibilité des pierres. Vous validez chaque étape avant la suivante.',
  },
  {
    question: 'Puis-je faire estimer un bijou de famille ?',
    answer:
      'Oui, l’expertise est gratuite et sans engagement. Nous pesons, testons et vous donnons une valeur d’estimation écrite. Vous êtes libre de repartir avec votre bijou.',
  },
  {
    question: 'Faut-il un rendez-vous pour venir ?',
    answer:
      'Non, la boutique est ouverte du lundi au samedi. Le rendez-vous est conseillé pour les essayages d’alliances et les projets sur mesure : nous vous réservons le salon privé et le temps nécessaire.',
  },
  {
    question: 'Livrez-vous en dehors de Cotonou ?',
    answer:
      'Oui, partout au Bénin par transporteur assuré, et à l’international sur devis. La commande est photographiée et scellée devant vous ou filmée avant expédition.',
  },
] as const;
