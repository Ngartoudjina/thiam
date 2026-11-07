# Bijouterie THIAM 24 Carats

Site vitrine de la maison THIAM 24 Carats — bijoutier joaillier à Cotonou, Bénin.

Développé à partir de la planche de direction artistique « Maquette THIAM 24 Carats »
(10 écrans : accueil, collections et contact, en desktop 1440 px et mobile 390 px,
plus la spécification de mouvement).

Le projet comprend deux parties : le **site vitrine**, fidèle à la maquette, et un
**tableau de bord** (`/admin`) depuis lequel la maison modifie son contenu, reçoit
les demandes de contact et gère ses pièces en vitrine, sans toucher au code. Voir
la section « Tableau de bord » plus bas.

Le contenu vit dans une base **Neon** (Postgres serverless) et les photos dans
**Vercel Blob**. Neon met en veille une base inactive et la réveille en quelques
centaines de millisecondes à la requête suivante : contrairement à l'offre
gratuite de Supabase, une période sans visite ne coûte ni la base ni ses données.

---

## Démarrer

```bash
npm install
npm run dev
```

Le site est servi sur <http://localhost:3000>. Aucune variable d'environnement
n'est nécessaire pour démarrer : toutes ont une valeur de repli, y compris la
base — sans elle, le site affiche le contenu livré avec la maquette et `/admin`
explique la marche à suivre.

| Commande                  | Effet                                                        |
| ------------------------- | ------------------------------------------------------------ |
| `npm run dev`             | Serveur de développement                                     |
| `npm run build`           | Build de production                                          |
| `npm run start`           | Sert le build de production                                  |
| `npm run typecheck`       | TypeScript en mode strict, sans émission                     |
| `npm run lint`            | ESLint (Next + TypeScript + Prettier)                        |
| `npm test`                | Tests (Vitest, base Postgres embarquée — sans réseau)        |
| `npm run format`          | Formate le dépôt avec Prettier                               |
| `npm run verify`          | typecheck + lint + tests + build, dans cet ordre             |
| `npm run db:migrate`      | Applique les migrations de `drizzle/` à la base              |
| `npm run db:generate`     | Écrit une migration après une modification du schéma         |
| `npm run db:seed`         | Importe le contenu de la maquette dans une base vide         |
| `npm run db:studio`       | Explore la base dans le navigateur (Drizzle Studio)          |
| `npm run admin:create`    | Crée un compte du tableau de bord                            |
| `npm run import:supabase` | Reprend le contenu et les photos de l'ancien projet Supabase |

---

## Stack

| Domaine     | Choix                                                       |
| ----------- | ----------------------------------------------------------- |
| Framework   | Next.js 15.5 — App Router, composants serveur par défaut    |
| Base        | Neon (Postgres serverless), pilote HTTP + Drizzle ORM       |
| Comptes     | Sessions en base, mots de passe scrypt — sans service tiers |
| Images      | Vercel Blob (production), disque local (développement)      |
| Tests       | Vitest + PGlite (Postgres embarqué)                         |
| Vue         | React 19.2                                                  |
| Langage     | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess`       |
| Styles      | Tailwind CSS v4 — configuration CSS-first dans `@theme`     |
| Mouvement   | Framer Motion 12 via `LazyMotion` (`domAnimation`)          |
| Défilement  | Lenis 1.3                                                   |
| Carrousel   | Embla 8.6 (témoignages en mobile)                           |
| Primitives  | Radix UI (dialogue, accordéon, slot) — socle shadcn/ui      |
| Icônes      | Lucide pour le mobilier d'interface, tracés maison sinon    |
| Formulaires | React Hook Form 7 + Zod 4, schéma partagé client / serveur  |

### Deux écarts assumés par rapport au brief

- **GSAP** n'est pas embarqué. Toute la spécification de mouvement de la maquette
  (§ « Direction du mouvement ») est couverte par Framer Motion et par CSS. Ajouter
  GSAP aurait alourdi le bundle d'environ 70 kB sans rien apporter, ce qui va contre
  l'objectif Lighthouse. Si une animation de timeline complexe est ajoutée plus tard,
  la dépendance se réintroduit sans refonte.
- **Motion One** est redondant avec Framer Motion, dont il partage le moteur. Il n'est
  donc pas installé.

---

## Architecture

```
app/                  Routes App Router, métadonnées, sitemap, robots, image OG
  api/                Routes de réception (contact, lettre de la maison)
components/
  common/             Briques transverses : section, sur-titre, cadre photo, icônes…
  layout/             Barre de navigation, menu plein écran, pieds de page
  motion/             Grammaire de mouvement : révélations, masques, compteurs
  providers/          Lenis, MotionConfig, LazyMotion
  ui/                 Primitives : bouton, champs, accordéon
constants/            Contenu de repli (maquette) et coordonnées de la maison
drizzle/              Migrations SQL, générées depuis lib/db/schema.ts
features/
  home/               Les onze sections de l'accueil
  collections/        Catalogue, filtres, coffret de dot
  contact/            Canaux, horaires, plan, formulaire
  legal/              Gabarit des pages légales
hooks/                Media queries, état de défilement, état d'ouverture
lib/                  Utilitaires : motion, SEO, schema.org, validation
  db/                 Schéma Drizzle, connexion Neon, amorçage
  auth/               Mots de passe, sessions, cookie
  storage/            Stockage des images (Vercel Blob ou disque)
services/
  content/            Lectures publiques, mises en cache par étiquette
  admin/              Actions serveur et lectures du tableau de bord
scripts/              Migrations, amorçage, comptes, import Supabase
tests/                Tests Vitest (base Postgres embarquée)
styles/               Tokens de design et utilitaires Tailwind
types/                Contrats de données
public/               Photographies et logotype
```

**Règle de séparation** : `features/` compose, `components/` fournit, `constants/`
porte le contenu, `lib/` ne dépend de rien. Aucun composant n'appelle `next/image`
directement — tout passe par `components/common/media-frame.tsx`.

---

## Design system

Tous les tokens sont déclarés dans `styles/globals.css`, relevés au pixel sur la
maquette. Aucune valeur de couleur, de graisse ou d'espacement n'est écrite en dur
dans un composant.

- **Typographies** : Cormorant Garamond (titres, citations) et Jost (textes, libellés),
  auto-hébergées par `next/font` — aucun appel à Google Fonts au runtime.
- **Échelle typographique fluide** : chaque taille est un `clamp()` calibré entre
  390 px (mobile) et 1440 px (canvas desktop). `text-hero` passe ainsi de 54 à 106 px
  sans palier visible.
- **Palette** : obsidienne `#0B0B0C`, ivoire `#F7F4EF`, or `#C08A62` et ses variantes,
  toutes issues du logotype.
- **Mouvement** : durées et courbes reprises de la planche — apparition 700 ms,
  survol 240 ms, zoom 1 100 ms, transition 480 ms, courbe `cubic-bezier(.16,1,.3,1)`,
  décalage maximal de 80 ms, amplitude de 16 à 24 px. `prefers-reduced-motion`
  ramène tout à un fondu, via `MotionConfig reducedMotion="user"`.

### Trois écarts de couleur, pour l'accessibilité

La maquette emploie quelques gris qui ne franchissent pas le seuil AA de WCAG 2.2
sur du petit texte. Ils ont été rapprochés du contraste requis, sans quitter la
palette d'origine :

| Usage                       | Maquette              | Retenu    | Contraste |
| --------------------------- | --------------------- | --------- | --------- |
| Petits gris sur ivoire      | `#8B827A` / `#A29890` | `#6B635C` | 5,24:1    |
| Sur-titres or sur ivoire    | `#A9805F`             | `#8E5C3D` | 4,97:1    |
| Ivoire translucide sur noir | opacités < .55        | ≥ .55     | ≥ 5,1:1   |

Le `#8E5C3D` est déjà présent dans la maquette (liens sur fond clair) : la
correction reste dans la direction artistique.

---

## Visuels

Dix photographies et le logotype ont été extraits de la maquette et placés dans
`public/`. Les dimensions réelles sont déclarées dans `constants/media.ts`, ce qui
permet à `next/image` de réserver l'espace et d'éviter tout décalage de mise en page.

### Photos restant à fournir par la maison

La planche prévoit des emplacements que seule la boutique peut remplir. Deux
traitements coexistent, selon le risque d'induire en erreur :

**Emplacement tenu par une pièce du catalogue** — la galerie ne présente aucun cadre
vide. Remplacer la valeur `media` dans `constants/gallery.ts` suffit :

| Emplacement                       | Tient la place actuellement |
| --------------------------------- | --------------------------- |
| Vitrine de la boutique            | `bouclesPerle`              |
| Geste d'atelier (mains, gravure)  | `bagueRubis`                |
| Façade / enseigne                 | `alliances`                 |
| Bandeau « promesse de la maison » | `presentationParures`       |
| Bandeau « Passez la porte »       | `ecrinParure`               |

**Emplacement laissé en attente** — y placer une autre photo tromperait le visiteur.
Un cadre sobre aux couleurs de la maison est affiché à la place :

| Emplacement                  | Pourquoi l'attente              |
| ---------------------------- | ------------------------------- |
| Collection **Argent**        | Aucune photo de pièce en argent |
| Collection **Montres**       | Aucune photo de montre          |
| Portrait du fondateur        | Photographie de personne réelle |
| Portrait cliente en boutique | Photographie de personne réelle |

Pour brancher un visuel : ajouter le fichier dans `public/images/`, déclarer son
entrée dans `constants/media.ts` (chemin, dimensions, texte alternatif), puis
référencer son identifiant à l'endroit voulu.

---

## Contenu et coordonnées

Une fois la base branchée, tout le contenu se modifie depuis le tableau de bord.
`constants/` garde le contenu de la maquette, qui sert à trois choses : l'affichage
tant que la base est absente ou vide, le repli si elle est injoignable, et
l'amorçage (`npm run db:seed` ou bouton « Importer le contenu »).

- `site.ts` — identité, téléphone, WhatsApp, horaires, intentions de message
- `collections.ts` — les six univers, les pièces en vitrine et leur nombre en boutique
- `craft.ts` — garanties, chronologie, citations
- `services.ts` — prestations après-vente et sujets de formulaire
- `testimonials.ts` — chiffres clés et avis
- `faq.ts` — questions fréquentes (alimente aussi le balisage `FAQPage`)
- `gallery.ts` — mosaïque de la vitrine

Les horaires sont modélisés en données : ils pilotent à la fois le tableau affiché,
la pastille « Ouvert maintenant » — calculée à l'heure de Cotonou, pas à celle du
visiteur — et le `openingHoursSpecification` de schema.org.

---

## Formulaires

`lib/validation.ts` définit les schémas Zod. Le formulaire et la route API partagent
la même définition : un envoi forgé hors navigateur subit exactement les mêmes règles.

Chaque demande de contact est **enregistrée en base** et apparaît dans la rubrique
Demandes du tableau de bord (avec rappel et WhatsApp en un geste) : aucune ne se
perd. Les inscriptions à la lettre rejoignent la rubrique Abonnés, exportable en
CSV. `CONTACT_WEBHOOK_URL` et `NEWSLETTER_WEBHOOK_URL` relaient en plus vers un
outil de la maison (Make, Zapier, CRM…), si on le souhaite.

Protection anti-robots sans captcha : un champ leurre invisible (le robot reçoit
une réponse normale, rien n'est enregistré) et une limitation à cinq envois par
visiteur et par quart d'heure. La limitation est tenue **en base** : sur un
hébergement serverless, un compteur en mémoire ne limiterait rien, chaque instance
ayant la sienne. Les adresses IP ne sont jamais conservées, seule une empreinte
irréversible sert de clé.

Les demandes sont effacées automatiquement au bout de douze mois, comme l'annonce
la page Confidentialité.

---

## SEO

Domaine de référence : **https://www.thiam24carats.com**. Il est écrit en dur
comme valeur de repli dans `constants/site.ts` et surchargeable par
`NEXT_PUBLIC_SITE_URL` ; canoniques, sitemap, Open Graph et données
structurées en découlent tous.

### Ce qui est en place

- **Métadonnées par page** via `lib/seo.ts` : titre, description, canonique
  absolue, Open Graph, Twitter Card, repères géographiques. Titres tenus sous
  65 caractères et descriptions entre 120 et 160, mesurés sur le rendu.
- **Canoniques systématiques.** Une page partagée avec `?utm_source=whatsapp`
  ou `?fbclid=` renvoie vers son adresse propre ; les filtres
  `/collections?univers=…` renvoient vers `/collections`.
- **Vignettes de partage** générées au build, 1200 × 630, aux couleurs de la
  maison : `/opengraph-image` pour le site, `/og/rachat-or` et
  `/og/alliances-mariage` pour les deux pages de destination. Adresses stables,
  volontairement hors de la convention `opengraph-image.tsx` de Next qui
  suffixe les routes imbriquées d'un identifiant régénéré à chaque build.
- **Données structurées** : `JewelryStore` (nœud central, avec horaires, zone
  desservie, moyens de paiement, langues, lien vers la fiche Google),
  `WebSite`, `WebPage` + `BreadcrumbList` par page, `CollectionPage`,
  `FAQPage` et deux nœuds `Service` pour le rachat d'or et le mariage.
- **Deux pages de destination** — `/rachat-or` et `/alliances-mariage` — avec
  un contenu qui ne reprend pas l'accueil et ses propres questions fréquentes.
  Une section d'accueil ne se positionne pas sur « rachat d'or Cotonou » : il
  faut une adresse, un titre et un contenu propres.
- **Le logotype de la maison partout où un moteur le lit** : propriété `logo`
  des données structurées (celle que Google reprend dans son encadré de
  connaissance), favicon, icône d'application iOS et Android, et vignettes de
  partage. Les deux fichiers livrés étant des carrés dont le dessin n'occupe
  que 26 % et 41 %, `npm run brand` en dérive des versions détourées : sans
  cela, tout ce qui met le logo à l'échelle réduit surtout du vide.
- `sitemap.xml` avec le visuel principal de chaque page, `robots.txt` fermant
  `/admin` et `/api`.

### Deux partis pris

**Aucun `aggregateRating` n'est déclaré.** Google ignore les notes qu'une
entreprise s'attribue sur son propre site pour les types `LocalBusiness` et
`Organization`, et un balisage d'avis sans avis réellement collectés expose à
une action manuelle. Les étoiles des résultats viennent de la fiche Google, à
laquelle `hasMap` et `sameAs` rattachent le site.

**L'accueil porte deux `h1` identiques**, un par variante responsive du hero,
dont une seule est visible à la fois. Google documente explicitement que
plusieurs `h1` ne posent pas de problème ; fusionner les deux imposerait de
refondre la mise en page du hero pour un gain nul. Les autres pages n'en ont
qu'un, et aucun niveau de titre n'est sauté.

---

## Accessibilité

Cible : WCAG 2.2 niveau AA.

- Lien d'évitement en première tabulation
- Anneau de focus or, jamais supprimé, sur tout élément interactif
- Menu plein écran et visionneuse bâtis sur Radix : piégeage du focus, `Échap`,
  restitution du focus à la fermeture
- Sélecteur de sujet rendu en pastilles mais implémenté en boutons radio —
  navigable aux flèches
- Compteurs animés : la valeur finale est dans le DOM dès le rendu serveur, les
  lecteurs d'écran ne lisent jamais un zéro transitoire
- Cibles tactiles de 44 px minimum sur pointeur grossier
- Retours de formulaire annoncés via `aria-live`

---

## Responsive

Six paliers déclarés dans `@theme` : 375, 480, 768, 1024, 1280, 1440 px (plus 1728).

La version mobile n'est pas une réduction : elle reprend les écrans mobiles de la
maquette. Le hero passe en photo pleine largeur avec titre incrusté, les collections
en pile puis tuiles jumelles, le savoir-faire en quatre promesses reformulées, la
galerie en rail à accroche, les témoignages en carrousel, et une barre d'action
WhatsApp apparaît après 40 % de défilement.

---

## Performances

Build de production, JavaScript de premier chargement :

| Route          | Premier chargement |
| -------------- | ------------------ |
| `/`            | ~240 kB            |
| `/collections` | ~145 kB            |
| `/contact`     | ~188 kB            |
| Pages légales  | ~112 kB            |

Les pages qui portent un formulaire ont pris ~9 kB en novembre 2026 : c'est la
mise à jour de sécurité de Zod (4.6.7, correctif d'une vulnérabilité « high »),
dont le module client a grossi de 7,6 kB compressés. La sécurité l'emporte.

### Ce qui a été fait après une mesure au navigateur

Le premier rendu utile arrivait à 1 196 ms alors que le DOM était prêt à
194 ms : le hero, animé depuis React à partir de `opacity: 0`, restait blanc
jusqu'à l'hydratation. Quatre corrections, mesurées à chaque étape :

| Correction                                                                                    | Effet                                    |
| --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Entrée du hero décrite en CSS, composant serveur                                              | premier rendu utile ~1 196 → ~600 ms     |
| Photo du hero dédoublée (mobile + desktop) → `sizes` et qualité communs                       | un téléchargement au lieu de deux        |
| Logotype sans `sizes`, servi en 640 px pour 34 px, et déclaré comme icône du manifeste        | −68 ko au premier chargement             |
| Révélations au défilement : une centaine de frontières client → une seule (observateur + CSS) | moins de charge RSC, moins d'hydratation |

Le middleware ne s'applique plus qu'à `/admin` : le site vitrine étant
statique, le faire transiter par lui ajoutait un traitement à chaque
navigation et à chaque préchargement.

Leviers en place : composants serveur par défaut, `LazyMotion` (le moteur de
projection de mise en page reste hors du bundle), `optimizePackageImports` sur
Lucide et Framer Motion, images AVIF/WebP avec `sizes` explicites et dominante de
chargement, polices auto-hébergées et préchargées, en-têtes de sécurité et cache
d'images d'un an.

---

## Déploiement

Le projet est un build Next.js standard. Il est pensé pour Vercel + Neon, mais
tourne aussi sur un serveur classique (Postgres compatible Neon, et
`STORAGE_DRIVER=local` pour garder les images sur disque).

1. **Base Neon.** Avec la CLI Neon, dans le dossier du projet :

   ```bash
   npx neon@latest init -y --org-id <org> --project-id <projet> --branch production --services postgres
   npx neon@latest deploy   # provisionne et écrit DATABASE_URL dans .env.local
   ```

   Ou, plus simplement sur Vercel : Storage › Neon (intégration officielle),
   qui pose `DATABASE_URL` dans les variables du projet. Les déploiements de
   prévisualisation reçoivent alors chacun leur propre branche de base.

2. **Images.** Vercel › Storage › Create › Blob, puis « Connect to project » :
   `BLOB_READ_WRITE_TOKEN` est ajouté automatiquement.
3. **Variables.** Reporter les autres variables de `.env.example` — au minimum
   `NEXT_PUBLIC_SITE_URL`, qui conditionne canoniques, sitemap et Open Graph.
4. **Déployer.** Sur Vercel, le script `vercel-build` applique les migrations
   (`drizzle/`) avant le build : le schéma de la base suit toujours le code.
   Chaque migration s'exécute dans une transaction.
5. **Premier compte**, une seule fois, depuis un poste qui a `DATABASE_URL` :
   `npm run admin:create -- --email=vous@exemple.com --name="Prénom Nom"`.
   Le mot de passe généré s'affiche une fois ; il se change dans « Mon compte ».
6. **Contenu** : soit l'import de l'ancien projet Supabase (voir « Migrer depuis
   Supabase »), soit le bouton « Importer le contenu » du tableau de bord.

`npm run verify` doit passer avant chaque mise en ligne ; la CI GitHub
(`.github/workflows/ci.yml`) le vérifie à chaque envoi.

Avant la mise en ligne, deux points relèvent de la maison : compléter l'adresse
exacte de la boutique (rubrique Coordonnées) et les mentions légales (RCCM, IFU,
hébergeur), signalés comme « à compléter » dans les pages concernées.

### Mise en service du référencement

Le code est prêt ; ces cinq gestes se font une fois, en dehors du dépôt, et
conditionnent la vitesse à laquelle Google prendra le site en compte.

1. **Variables sur Vercel.** Reporter dans les réglages du projet toutes les
   variables de `.env.example`. `NEXT_PUBLIC_SITE_URL` doit valoir exactement
   `https://www.thiam24carats.com` — sans barre oblique finale, avec le
   `www`, en HTTPS. Une divergence ici fausse toutes les canoniques.
2. **Une seule adresse canonique.** Dans Vercel › Settings › Domains, faire de
   `www.thiam24carats.com` le domaine principal et rediriger
   `thiam24carats.com` vers lui. Sans cette redirection, le site existe à deux
   adresses et Google partage la notoriété entre les deux.
3. **Search Console.** Ajouter la propriété, relever le jeton de vérification
   HTML, le poser dans `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` puis redéployer :
   la balise apparaît alors seule dans le `<head>`. Soumettre ensuite
   `https://www.thiam24carats.com/sitemap.xml`.
4. **Fiche Google de l'établissement.** C'est elle qui porte les avis, les
   photos et la position dans le encadré local — souvent plus déterminante que
   le site lui-même pour un commerce de quartier. Y inscrire le site,
   l'adresse et des horaires strictement identiques à ceux du site : toute
   divergence de nom, d'adresse ou de téléphone affaiblit le rattachement.
5. **Réseaux sociaux.** Renseigner `NEXT_PUBLIC_INSTAGRAM_URL` et
   `NEXT_PUBLIC_FACEBOOK_URL` : ils alimentent le `sameAs` des données
   structurées, qui confirme à Google qu'il s'agit bien de la même maison.

### Ce qui manque encore, côté maison

- **L'adresse postale exacte.** `NEXT_PUBLIC_STREET_ADDRESS` est vide, donc
  `streetAddress` est absent du balisage. C'est le manque le plus coûteux pour
  le référencement local : une bijouterie se cherche par son quartier.
- **Une photographie d'argent** pour l'univers du même nom.

---

## Tableau de bord

`/admin` — espace privé depuis lequel la maison met à jour le site sans toucher
au code. Chaque enregistrement est publié immédiatement : le cache de la page
concernée est invalidé par étiquette, sans redéploiement.

### Installation locale

1. `cp .env.example .env.local`, puis y renseigner `DATABASE_URL` — une branche
   Neon de développement est gratuite et se crée en un clic depuis la console.
2. `npm run db:migrate` — crée les tables.
3. `npm run admin:create -- --email=vous@exemple.com` — le premier compte est
   administrateur ; le mot de passe généré s'affiche une seule fois.
4. `npm run dev`, se connecter sur `/admin`, puis « Importer le contenu » : les
   textes et photos de la maquette sont recopiés en base, référencés par leur
   chemin public — la vitrine reste identique, vos visuels les remplacent un à un.

Depuis une connexion lointaine des serveurs (Cotonou ↔ us-east-2), Node abandonne
par défaut chaque tentative de connexion au bout de 250 ms. Le client de base
élargit ce délai de lui-même ; si un build local échoue sur le téléchargement des
polices Google (`ETIMEDOUT`), le relancer ainsi :
`NODE_OPTIONS=--network-family-autoselection-attempt-timeout=2000 npm run build`.

Sans `BLOB_READ_WRITE_TOKEN`, les images téléversées en développement sont
écrites dans `.data/media` (ignoré par git) et servies par `/media/…`.

### Ce que l'on peut modifier

| Rubrique        | Contenu piloté                                                           |
| --------------- | ------------------------------------------------------------------------ |
| **Demandes**    | Messages du formulaire : rappel, WhatsApp, statut « traitée »            |
| **Abonnés**     | Inscrits à la lettre, export CSV                                         |
| **Collections** | Univers : nom, accroche, description, catégorie, statut, ordre, photos   |
| **Pièces**      | Grille de la page Collections : photo, matière, poids, univers, pastille |
| **Galerie**     | Mosaïque de la vitrine : photos, légendes, empreinte des tuiles, ordre   |
| **Visuels**     | Hero, bandeaux, portraits — chaque grande photo de composition           |
| **Services**    | Prestations après-vente, tarifs, pictogrammes, ordre                     |
| **Témoignages** | Avis, notes, avis mis en avant, ordre                                    |
| **Questions**   | Questions fréquentes — alimentent aussi le balisage `FAQPage`            |
| **Accueil**     | Bandeau principal (titres, texte, boutons) et chiffres clés              |
| **Histoire**    | Récit, portrait, chronologie, citation du fondateur                      |
| **Coordonnées** | Téléphone, WhatsApp, e-mail, adresse, plan, réseaux sociaux, horaires    |
| **Comptes**     | Personnes autorisées, rôles, réinitialisation (administrateurs)          |
| **Mon compte**  | Nom, mot de passe, fermeture des autres sessions                         |

Chaque élément porte un statut **Visible / Masqué** et se réordonne par
glisser-déposer — à la souris comme au clavier (Espace pour saisir, flèches pour
déplacer, Espace pour déposer).

Les boutons du bandeau acceptent deux mots-clés, `whatsapp` et `telephone`,
résolus à l'affichage avec les numéros des Coordonnées : changer de numéro met à
jour tous les boutons d'un coup.

Après une modification faite hors du tableau de bord (import en ligne de
commande, console Neon), le bouton **Actualiser le site** republie toutes les
pages immédiatement ; sans lui, elles se mettent à jour dans l'heure.

### Base de données

Le schéma est décrit une seule fois, en TypeScript, dans `lib/db/schema.ts`. Les
types des lignes en sont déduits (`types/database.ts`) et les migrations SQL de
`drizzle/` en sont générées (`npm run db:generate`).

| Table                    | Rôle                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `users`                  | Comptes du tableau de bord (rôle admin / éditeur, empreinte scrypt)                    |
| `sessions`               | Sessions ouvertes — seule l'empreinte SHA-256 du jeton est gardée                      |
| `rate_limits`            | Compteurs de limitation (connexion, formulaires)                                       |
| `collections`            | Univers de la vitrine                                                                  |
| `collection_images`      | Photos d'une collection, dont l'image principale (unique)                              |
| `pieces`                 | Pièces en vitrine de la page Collections                                               |
| `gallery_images`         | Mosaïque de la vitrine                                                                 |
| `services`               | Prestations après-vente                                                                |
| `testimonials`           | Avis clients                                                                           |
| `faq`                    | Questions fréquentes                                                                   |
| `settings`               | Blocs singuliers en JSON validé : hero, about, contact, hours, stats, visuals, catalog |
| `contact_requests`       | Demandes du formulaire de contact (effacées après 12 mois)                             |
| `newsletter_subscribers` | Inscrits à la lettre                                                                   |

Le site lit la base par le **pilote HTTP de Neon** : une requête, un aller-retour
HTTPS, sans connexion persistante — le mode adapté aux fonctions serverless. Un
délai de huit secondes et un coupe-circuit évitent qu'une base injoignable fige
les rendus.

### Stockage des images

Le navigateur compresse chaque photo (2 000 px sur le grand côté, WebP, qualité
abaissée par paliers si besoin), puis l'envoie à `/api/admin/upload` avec une
vraie barre de progression. La route vérifie la session, l'origine, la taille,
puis la **nature réelle du fichier** (signature binaire : un SVG ou un HTML
déguisé en image est refusé) avant de le confier à Vercel Blob.

Les adresses enregistrées sont filtrées à l'écriture comme à la lecture : seuls
les visuels du site, du stockage local et de Vercel Blob sont admis, si bien
qu'une adresse inconnue en base donne le cadre d'attente au lieu de faire tomber
la page. À chaque remplacement ou suppression, l'ancien fichier est retiré du
stockage — d'après la base, jamais d'après une liste envoyée par le navigateur.

### Sécurité

- **Mots de passe** : scrypt (paramètres OWASP : N = 2¹⁷, r = 8, p = 1), sel
  unique, comparaison en temps constant ; une adresse inconnue coûte le même
  calcul qu'une adresse existante, ce qui empêche d'énumérer les comptes.
- **Sessions** en base, révocables : déconnexion, changement de mot de passe
  (les autres sessions sont fermées), suppression du compte. Le navigateur ne
  reçoit qu'un jeton aléatoire de 256 bits, la base n'en garde que l'empreinte.
- **Cookie** `__Host-thiam-session` : `HttpOnly`, `Secure`, `SameSite=Lax`,
  prolongé à chaque visite (30 jours d'inactivité au plus).
- **Force brute** : six essais par compte et trente par adresse IP, par quart
  d'heure, compteurs en base.
- **Double contrôle** : le middleware n'autorise l'accès aux pages qu'avec un
  cookie, puis chaque page, action serveur et route revérifie la session en base
  — une action forgée hors interface est rejetée.
- **Rôles** : un éditeur gère le contenu ; seul un administrateur gère les comptes
  et importe le contenu. Il reste toujours au moins un administrateur.
- **Validation Zod** partagée entre le formulaire et l'action.
- **XSS** : React échappe tout contenu ; seul le JSON-LD passe par
  `dangerouslySetInnerHTML`, chevrons échappés.
- **CSRF** : les actions serveur de Next vérifient l'origine ; la route d'envoi
  d'images la vérifie aussi, et le cookie `SameSite=Lax` n'accompagne aucun
  envoi venu d'un autre site.
- **Export CSV** neutralisé contre l'injection de formules.

Pas de page d'inscription ni de « mot de passe oublié » par e-mail : un
administrateur réinitialise le mot de passe d'un compte depuis la rubrique
Comptes (le nouveau s'affiche une seule fois).

### Comment le site public lit ce contenu

`services/content/` interroge la base et **retombe sur `constants/`** quand elle
n'est pas configurée, quand une table est vide, ou quand la requête échoue. Dans
ce dernier cas, la réponse de repli n'est **pas** mise en cache : la lecture
suivante réessaie, et la page se reconstruit d'elle-même dans l'heure.

Les lectures sont mémorisées sous des étiquettes de cache (`lib/cache.ts`) ; les
actions du tableau de bord invalident l'étiquette correspondante, puis toutes
les pages. Les pages publiques restent statiques — la base, elle, reste en veille
l'essentiel du temps.

---

## Migrer depuis Supabase

`npm run import:supabase` reprend le contenu de l'ancien projet : collections et
leurs photos, galerie, services, témoignages, questions et réglages, avec leurs
identifiants, positions et dates. Les photos du compartiment `media` sont
téléchargées puis déposées dans Vercel Blob, et chaque chemin est réécrit — y
compris dans les réglages (bandeau, portrait, visuels).

1. Si le projet Supabase est en pause, le réactiver depuis son tableau de bord
   (« Restore project ») : les données restent récupérables quatre-vingt-dix
   jours.
2. Dans `.env.local` : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Settings ›
   API), `DATABASE_URL` (Neon) et `BLOB_READ_WRITE_TOKEN`.
3. `npm run db:migrate`, puis `npm run import:supabase -- --dry-run` pour voir
   ce qui sera repris, puis `npm run import:supabase`.
4. Recréer les comptes avec `npm run admin:create` : Supabase ne livre pas les
   empreintes de mot de passe par son API.
5. Cliquer sur « Actualiser le site » dans le tableau de bord, puis retirer les
   deux variables Supabase.

L'import se fait en une transaction : la base est reprise en entier ou pas du
tout. Il refuse de s'exécuter sur une base qui contient déjà des collections,
sauf avec `--replace` (qui conserve comptes, demandes et abonnés).

---

## Tests

`npm test` lance la suite Vitest. Les tests qui touchent la base utilisent
**PGlite**, un vrai Postgres compilé en WebAssembly, avec les migrations du
dépôt : contraintes, index uniques et valeurs par défaut sont éprouvés pour de
bon, sans réseau ni Docker. Ils couvrent les mots de passe, les sessions, la
limitation de débit (y compris sous requêtes simultanées), la conservation des
demandes, le réordonnancement, l'amorçage, la lecture publique et ses replis,
la validation, le stockage des images et l'import Supabase.

---

## Notes de reprise

- **Navigation par ancres corrigée.** « Savoir-faire », « Services » et
  « Histoire » pointent vers des sections de l'accueil, pas vers des pages.
  Elles semblaient inertes : Lenis, qui pilote le défilement, écrasait le saut
  natif du navigateur. Les liens d'ancrage lui sont désormais confiés
  (`components/providers/hash-scroll.tsx`), avec un décalage égal à la hauteur
  de la barre fixe.
- **Les pièces de la page Collections se gèrent désormais en base** (rubrique
  Pièces), avec le même affichage qu'avant : photo, matière, poids réel, univers
  et pastille. Le nombre de pièces annoncé en boutique se règle au même endroit.
- **La grande photo du bandeau** se change dans Visuels. Le champ image de la
  rubrique Accueil n'était jamais affiché ; une photo déposée là est reprise
  automatiquement dans l'emplacement du hero.
- **Les coordonnées suivent le tableau de bord partout** : cartes de pièces,
  services, questions, coffret de dot, pages Rachat d'or et Alliances, 404, pages
  légales et données structurées lisaient encore les valeurs figées de la
  maquette.
