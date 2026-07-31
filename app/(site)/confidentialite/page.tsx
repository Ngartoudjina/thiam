import { LegalPage, type LegalBlock } from '@/features/legal/legal-page';
import { ROUTES } from '@/constants/navigation';
import { CONTACT, SITE } from '@/constants/site';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Confidentialité',
  description: `Comment la ${SITE.name} traite les informations que vous lui confiez.`,
  path: ROUTES.privacy,
});

const BLOCKS: readonly LegalBlock[] = [
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
      'Les demandes sans suite sont effacées au bout de douze mois. Les données liées à une commande, une réparation ou une garantie sont conservées le temps de la garantie, puis archivées conformément aux obligations comptables.',
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
      `Il suffit de nous écrire à ${CONTACT.email} ou de nous appeler au ${CONTACT.phoneDisplay}. Nous traitons la demande sous huit jours.`,
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

export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Vos données"
      titleLines={['Ce que nous', 'faisons de vos données']}
      intro="Nous demandons le strict nécessaire pour vous répondre, et nous nous y tenons. Cette page explique quoi, pourquoi, et pour combien de temps."
      blocks={BLOCKS}
      updatedAt="30 juillet 2026"
    />
  );
}
