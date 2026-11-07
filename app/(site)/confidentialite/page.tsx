import { LegalPage, type LegalBlock } from '@/features/legal/legal-page';
import { ROUTES } from '@/constants/navigation';
import { SITE } from '@/constants/site';
import { getSiteSettings } from '@/services/content';
import type { ContactSettings } from '@/lib/schemas/content';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Confidentialité',
  description: `Comment la ${SITE.name} recueille, utilise et conserve les informations que vous lui confiez par formulaire, par téléphone ou sur WhatsApp.`,
  path: ROUTES.privacy,
});

const blocks = (contact: ContactSettings): readonly LegalBlock[] => [
  {
    heading: 'Ce que nous collectons',
    paragraphs: [
      'Uniquement ce que vous nous écrivez : votre nom, votre numéro de téléphone ou WhatsApp, le sujet de votre demande et, si vous en rédigez un, votre message.',
      'Aucune donnée n’est collectée à votre insu. Le site ne dépose pas de cookie publicitaire et n’utilise aucun traceur tiers.',
    ],
  },
  {
    heading: 'Pourquoi nous les conservons',
    paragraphs: [
      'Pour vous rappeler, préparer votre rendez-vous, établir un devis ou suivre une réparation. Rien d’autre.',
      'Vos informations ne sont ni vendues, ni louées, ni transmises à un tiers à des fins commerciales.',
    ],
  },
  {
    heading: 'Combien de temps',
    paragraphs: [
      'Les demandes envoyées par le formulaire sont effacées automatiquement au bout de douze mois. Les données liées à une commande, une réparation ou une garantie sont conservées le temps de la garantie, puis archivées conformément aux obligations comptables.',
    ],
  },
  {
    heading: 'Où elles sont conservées',
    paragraphs: [
      'Les demandes et les inscriptions à la lettre sont enregistrées dans la base de données du site, hébergée par Neon. Seule l’équipe de la maison y accède, depuis un espace protégé par mot de passe.',
      'Les adresses IP ne sont jamais conservées : seule une empreinte irréversible sert, quelques minutes, à freiner les envois automatisés.',
    ],
  },
  {
    heading: 'La lettre de la maison',
    paragraphs: [
      'L’inscription est volontaire et se limite à votre adresse e-mail. Chaque envoi comporte un lien de désinscription, et une simple demande par téléphone suffit également.',
    ],
  },
  {
    heading: 'Vos droits',
    paragraphs: [
      'Vous pouvez demander à consulter, corriger ou supprimer les informations vous concernant, à tout moment et sans justification.',
      `Il suffit de nous écrire à ${contact.email} ou de nous appeler au ${contact.phoneDisplay}. Nous traitons la demande sous huit jours.`,
    ],
  },
  {
    heading: 'Services extérieurs',
    paragraphs: [
      'Si vous choisissez de nous écrire sur WhatsApp, votre conversation est soumise à la politique de confidentialité de ce service.',
      'Le plan d’accès n’est chargé que lorsqu’il est affiché, et jamais avant.',
    ],
  },
];

export default async function ConfidentialitePage() {
  const { contact } = await getSiteSettings();

  return (
    <LegalPage
      eyebrow="Vos données"
      titleLines={['Ce que nous', 'faisons de vos données']}
      intro="Nous demandons le strict nécessaire pour vous répondre, et nous nous y tenons. Cette page explique quoi, pourquoi, et pour combien de temps."
      blocks={blocks(contact)}
      updatedAt="7 novembre 2026"
    />
  );
}
