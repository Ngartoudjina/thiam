import { MEDIA } from '@/constants/media';
import type { FaqEntry } from '@/types';

/**
 * Contenu des deux pages de destination.
 *
 * Elles existent pour le référencement, mais elles ne répètent pas l'accueil :
 * une page qui reformule sa page d'origine se fait absorber par elle. Chacune
 * apporte ce que l'accueil n'a pas la place de dire — les objets repris, la
 * formation du prix, les papiers à prévoir, les délais d'atelier — et ses
 * propres questions fréquentes, distinctes de celles de l'accueil.
 */

interface LandingBlock {
  readonly title: string;
  readonly body: string;
}

/* ------------------------------------------------------------------------ */
/* Rachat d'or                                                              */
/* ------------------------------------------------------------------------ */

export const BUYBACK_PAGE = {
  title: 'Rachat d’or à Cotonou',
  titleLines: ['Rachat d’or', 'à Cotonou'],
  eyebrow: 'Rachat d’or',
  lead: 'La maison reprend votre or au cours du jour, pesé et testé devant vous, dans sa boutique de Cotonou. L’estimation est gratuite et sans engagement : vous repartez avec vos pièces si le prix ne vous convient pas.',
  hero: MEDIA.rachatPesee,

  /** Ce que la maison reprend — la première question de tout vendeur. */
  accepted: {
    title: 'Ce que nous reprenons',
    items: [
      {
        title: 'Bijoux cassés ou dépareillés',
        body: 'Chaînes rompues, boucles esseulées, bagues déformées : l’état n’entre pas dans le calcul, seul le poids d’or fin compte.',
      },
      {
        title: 'Bijoux hérités',
        body: 'Parures de famille, bijoux de dot, pièces anciennes. Nous vous dirons aussi si une pièce vaut mieux que son poids d’or.',
      },
      {
        title: 'Or dentaire',
        body: 'Couronnes et bridges, avec ou sans résidus. Le titre est mesuré avant toute proposition.',
      },
      {
        title: 'Or 14, 18, 21 et 24 carats',
        body: 'Tous les titres courants au Bénin, poinçonnés ou non. Le test du titre lève le doute en boutique.',
      },
    ],
  },

  /** Comment se forme le prix : la seconde question, celle de la confiance. */
  pricing: {
    title: 'Comment le prix est fixé',
    blocks: [
      {
        title: 'Le cours du jour',
        body: 'Le prix du gramme suit le cours international de l’or, affiché en boutique le jour de votre passage. Il varie d’un jour à l’autre : une estimation faite la semaine passée n’engage pas celle d’aujourd’hui.',
      },
      {
        title: 'Le titre, mesuré',
        body: 'Un bijou marqué 18K ne contient pas toujours 18 carats. Le titre réel est mesuré devant vous avant tout chiffre — c’est ce qui sépare une estimation d’une devinette.',
      },
      {
        title: 'Le poids, à la balance certifiée',
        body: 'La pesée se fait sur une balance certifiée, écran tourné vers vous. Les pierres et parties non métalliques sont déduites, jamais comptées comme de l’or.',
      },
    ] satisfies readonly LandingBlock[],
  },

  /** Ce qu'il faut prévoir avant de se déplacer. */
  papers: {
    title: 'Ce qu’il faut apporter',
    body: 'Le rachat d’or est une activité encadrée. Une pièce d’identité en cours de validité est obligatoire, sans exception : carte d’identité, passeport ou permis de conduire. Sans elle, la transaction ne peut pas être conclue, même si l’estimation vous convient.',
  },

  faq: [
    {
      question: 'Reprenez-vous les bijoux cassés ou abîmés ?',
      answer:
        'Oui. L’état d’un bijou n’entre pas dans le calcul du rachat : seuls le titre de l’or et le poids d’or fin comptent. Chaînes rompues, montures tordues, boucles dépareillées sont reprises comme le reste.',
    },
    {
      question: 'Comment le prix du gramme est-il déterminé ?',
      answer:
        'Il suit le cours international de l’or du jour, affiché en boutique. Le titre de votre pièce est mesuré et son poids relevé à la balance certifiée, devant vous ; le prix découle de ces trois éléments.',
    },
    {
      question: 'Quels papiers dois-je apporter ?',
      answer:
        'Une pièce d’identité en cours de validité — carte d’identité, passeport ou permis de conduire. Le rachat d’or est encadré : sans pièce d’identité, la transaction ne peut pas être conclue.',
    },
    {
      question: 'Suis-je obligé de vendre après l’estimation ?',
      answer:
        'Non. L’estimation est gratuite et sans engagement. Si le prix ne vous convient pas, vous repartez avec vos pièces, sans frais ni discussion.',
    },
    {
      question: 'Faut-il prendre rendez-vous pour un rachat ?',
      answer:
        'Non, le rachat se fait sans rendez-vous aux heures d’ouverture. Pour un volume important ou une succession, un appel préalable permet de vous recevoir au calme.',
    },
    {
      question: 'Le paiement est-il immédiat ?',
      answer:
        'Oui, dès l’accord sur le prix, en espèces ou par Mobile Money selon le montant. Aucun délai, aucun versement différé.',
    },
  ] satisfies readonly FaqEntry[],
} as const;

/* ------------------------------------------------------------------------ */
/* Alliances et mariage                                                     */
/* ------------------------------------------------------------------------ */

export const WEDDING_PAGE = {
  title: 'Alliances et bijoux de mariage à Cotonou',
  titleLines: ['Alliances', 'et mariage'],
  eyebrow: 'Mariage',
  lead: 'Alliances gravées à la main, bagues de fiançailles serties et parures de dot, façonnées dans notre atelier de Cotonou. Vous voyez la pièce naître, vous la reprenez si la taille bouge.',
  hero: MEDIA.alliances,

  offer: {
    title: 'Ce que nous façonnons',
    items: [
      {
        title: 'Alliances',
        body: 'En or 14, 18, 21 ou 24 carats, lisses ou travaillées, unies ou serties. La gravure intérieure — prénoms, date, quelques mots — est offerte.',
      },
      {
        title: 'Bagues de fiançailles',
        body: 'Solitaires et montures serties de diamants, choisis pierre par pierre. Chaque diamant est présenté avant sertissage, avec son poids et son origine.',
      },
      {
        title: 'Parures de dot',
        body: 'Ensembles complets pour la cérémonie : collier, boucles, bracelet et bague, accordés entre eux et présentés en coffret.',
      },
      {
        title: 'Bijoux de témoins',
        body: 'Petites pièces assorties à la parure principale, réalisées dans le même or et dans le même geste.',
      },
    ],
  },

  steps: {
    title: 'Comment cela se passe',
    blocks: [
      {
        title: 'L’essayage, d’abord',
        body: 'On mesure les deux doigts en boutique, à froid et en fin de journée si possible : un doigt gonfle, et une alliance juste le matin serre le soir.',
      },
      {
        title: 'Le dessin, sous 48 heures',
        body: 'Pour une création, le dessin et le devis vous parviennent en deux jours. Rien n’est engagé tant que vous n’avez pas validé la forme et le budget.',
      },
      {
        title: 'La gravure, à la main',
        body: 'Elle se fait à l’atelier, à la main, sur la pièce terminée. Prévoyez de la commander avec le reste : elle s’ajoute au délai de fabrication.',
      },
      {
        title: 'L’ajustement, après',
        body: 'La taille bouge avec les années. La remise à la taille des alliances achetées chez nous se fait à l’atelier, sur simple passage.',
      },
    ] satisfies readonly LandingBlock[],
  },

  faq: [
    {
      question: 'Quel carat choisir pour une alliance ?',
      answer:
        'L’or 18 carats est le meilleur compromis pour une pièce portée tous les jours : assez riche en or pour tenir sa couleur, assez allié pour résister aux chocs. Le 21 et le 24 carats sont plus jaunes et plus tendres, souvent retenus pour la dot et les pièces de cérémonie.',
    },
    {
      question: 'La gravure des alliances est-elle comprise ?',
      answer:
        'Oui, la gravure intérieure est offerte sur les alliances achetées à la boutique : prénoms, date, ou quelques mots. Elle se fait à la main, à l’atelier, sur la pièce terminée.',
    },
    {
      question: 'Peut-on faire ajuster la taille plus tard ?',
      answer:
        'Oui. Les alliances achetées chez nous sont remises à la taille à l’atelier, sur simple passage. C’est la raison pour laquelle nous mesurons les doigts en boutique plutôt que sur indication.',
    },
    {
      question: 'Combien de temps avant le mariage faut-il commander ?',
      answer:
        'Comptez le délai de création — le devis vous parvient sous 48 heures — plus la gravure. Passer un mois avant la cérémonie laisse de la marge pour un essayage et un ajustement sans précipitation.',
    },
    {
      question: 'Faites-vous les parures de dot complètes ?',
      answer:
        'Oui : collier, boucles, bracelet et bague accordés, présentés en coffret. L’ensemble peut être assorti aux bijoux des témoins, réalisés dans le même or.',
    },
    {
      question: 'Peut-on échanger un ancien bijou contre des alliances ?',
      answer:
        'Oui. L’or que vous apportez est pesé et testé devant vous, puis déduit du prix des alliances. Le protocole est le même que pour un rachat, pièce d’identité comprise.',
    },
  ] satisfies readonly FaqEntry[],
} as const;
