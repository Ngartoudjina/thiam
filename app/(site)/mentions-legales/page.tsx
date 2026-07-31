import { LegalPage, type LegalBlock } from '@/features/legal/legal-page';
import { ROUTES } from '@/constants/navigation';
import { CONTACT, LOCATION, SITE } from '@/constants/site';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Mentions légales',
  description: `Mentions légales du site de la ${SITE.name}, bijoutier joaillier à ${LOCATION.city}.`,
  path: ROUTES.legal,
});

const BLOCKS: readonly LegalBlock[] = [
  {
    heading: 'Éditeur du site',
    paragraphs: [
      `${SITE.name} — bijouterie joaillerie, ${LOCATION.cityCountry}.`,
      `Téléphone : ${CONTACT.phoneDisplay} · Courriel : ${CONTACT.email}`,
      'Numéro RCCM, IFU et forme juridique : à compléter par la maison avant mise en ligne.',
    ],
  },
  {
    heading: 'Directeur de la publication',
    paragraphs: ['M. Thiam, fondateur et gérant de la maison.'],
  },
  {
    heading: 'Hébergement',
    paragraphs: [
      'Le site est hébergé par le prestataire retenu lors du déploiement. Ses coordonnées complètes sont ajoutées ici à la mise en production.',
    ],
  },
  {
    heading: 'Propriété intellectuelle',
    paragraphs: [
      'L’ensemble des contenus de ce site — textes, photographies de pièces, logotype, identité visuelle — est la propriété exclusive de la maison ou de ses ayants droit.',
      'Toute reproduction, représentation ou adaptation, totale ou partielle, sans autorisation écrite préalable est interdite.',
    ],
  },
  {
    heading: 'Prix et disponibilité',
    paragraphs: [
      'Les pièces présentées sont celles disponibles en boutique au moment de la publication. Les poids indiqués sont réels et vérifiés à la balance certifiée.',
      'Aucun prix n’est affiché sur ce site : le tarif d’une pièce en or suit le cours du jour, communiqué en boutique et confirmé par écrit avant tout engagement.',
    ],
  },
  {
    heading: 'Responsabilité',
    paragraphs: [
      'La maison s’efforce d’assurer l’exactitude des informations publiées. Elle ne saurait toutefois être tenue responsable des erreurs, omissions ou indisponibilités temporaires du site.',
      'Les liens sortants, notamment vers WhatsApp et les services de cartographie, relèvent de la responsabilité de leurs éditeurs respectifs.',
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      titleLines={['Mentions', 'légales']}
      intro={`Les informations ci-dessous concernent le site vitrine de la ${SITE.name}. Elles complètent, sans les remplacer, les conditions de vente remises en boutique.`}
      blocks={BLOCKS}
      updatedAt="30 juillet 2026"
    />
  );
}
