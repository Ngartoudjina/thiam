# Bijouterie THIAM 24 Carats

Site vitrine de la maison THIAM 24 Carats — bijoutier joaillier à Cotonou, Bénin.

Développé à partir de la planche de direction artistique « Maquette THIAM 24 Carats »
(10 écrans : accueil, collections et contact, en desktop 1440 px et mobile 390 px,
plus la spécification de mouvement).

Le projet comprend deux parties : le **site vitrine**, fidèle à la maquette, et un
**tableau de bord** (`/admin`) depuis lequel la maison modifie son contenu sans
toucher au code. Voir la section « Tableau de bord » plus bas.

---

## Démarrer

```bash
npm install
npm run dev
```

Le site est servi sur <http://localhost:3000>. Aucune variable d'environnement
n'est nécessaire pour démarrer : toutes ont une valeur de repli, y compris
Supabase — sans lui, le site affiche le contenu livré avec la maquette et
`/admin` explique la marche à suivre.

| Commande            | Effet                                    |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Serveur de développement                 |
| `npm run build`     | Build de production                      |
| `npm run start`     | Sert le build de production              |
| `npm run typecheck` | TypeScript en mode strict, sans émission |
| `npm run lint`      | ESLint (Next + TypeScript + Prettier)    |
| `npm run format`    | Formate le dépôt avec Prettier           |
| `npm run verify`    | typecheck + lint + build, dans cet ordre |

---

## Stack

| Domaine     | Choix                                                      |
| ----------- | ---------------------------------------------------------- |
| Framework   | Next.js 15.5 — App Router, composants serveur par défaut   |
| Vue         | React 19.2                                                 |
| Langage     | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess`      |
| Styles      | Tailwind CSS v4 — configuration CSS-first dans `@theme`    |
| Mouvement   | Framer Motion 12 via `LazyMotion` (`domAnimation`)         |
| Défilement  | Lenis 1.3                                                  |
| Carrousel   | Embla 8.6 (témoignages en mobile)                          |
| Primitives  | Radix UI (dialogue, accordéon, slot) — socle shadcn/ui     |
| Icônes      | Lucide pour le mobilier d'interface, tracés maison sinon   |
| Formulaires | React Hook Form 7 + Zod 4, schéma partagé client / serveur |

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
constants/            Contenu éditorial et coordonnées de la maison
features/
  home/               Les onze sections de l'accueil
  collections/        Catalogue, filtres, coffret de dot
  contact/            Canaux, horaires, plan, formulaire
  legal/              Gabarit des pages légales
hooks/                Media queries, état de défilement, état d'ouverture
lib/                  Utilitaires purs : motion, SEO, schema.org, validation
services/             Accès réseau, isolés de l'interface
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

Tout le contenu éditorial vit dans `constants/`. Modifier un tarif, un horaire ou
un témoignage ne demande d'ouvrir aucun composant.

- `site.ts` — identité, téléphone, WhatsApp, horaires, intentions de message
- `collections.ts` — les six univers et les pièces en vitrine
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

Protection anti-robots sans captcha : un champ leurre invisible et une limitation
à cinq envois par adresse IP et par quart d'heure.

Pour recevoir les demandes, renseigner `CONTACT_WEBHOOK_URL` (CRM, Make, Zapier,
e-mail transactionnel, feuille de calcul…). Sans cette variable, la demande est
acceptée et tracée dans les journaux du serveur — aucune n'est perdue silencieusement.

---

## SEO

- Métadonnées par page via `lib/seo.ts` : titre, description, canonique, Open Graph,
  Twitter Card
- Image de partage générée au build (`app/opengraph-image.tsx`), portant le
  logotype réel de la maison
- `sitemap.xml` et `robots.txt` générés, incluant chaque univers de collection
- Données structurées : `JewelryStore`, `WebSite`, `FAQPage`, `BreadcrumbList`,
  `CollectionPage`
- Hiérarchie de titres vérifiée : un seul `h1` par page, aucun niveau sauté

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
| `/`            | ~227 kB            |
| `/collections` | ~142 kB            |
| `/contact`     | ~174 kB            |
| Pages légales  | ~137 kB            |

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

Le projet est un build Next.js standard, sans adhérence à un hébergeur.

1. Renseigner les variables listées dans `.env.example` — au minimum
   `NEXT_PUBLIC_SITE_URL`, qui conditionne canoniques, sitemap et Open Graph.
2. `npm run verify` doit passer.
3. `npm run build` puis `npm run start`, ou déploiement sur la plateforme de votre
   choix.

Avant la mise en ligne, deux points relèvent de la maison : compléter l'adresse
exacte de la boutique (`NEXT_PUBLIC_STREET_ADDRESS`) et les mentions légales
(RCCM, IFU, hébergeur), signalés comme « à compléter » dans les pages concernées.

---

## Tableau de bord

`/admin` — espace privé depuis lequel la maison met à jour le site sans toucher
au code. Chaque enregistrement est publié immédiatement : le cache de la page
concernée est invalidé par étiquette, sans redéploiement.

### Installation

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com). Dans
   _Settings → API_, relever l'URL du projet, la clé `anon` et la clé
   `service_role`.
2. **Renseigner l'environnement** : copier `.env.example` en `.env.local`, y
   placer les trois valeurs, puis relancer le serveur.
3. **Créer les tables** : ouvrir l'éditeur SQL du projet et exécuter, dans
   l'ordre, `supabase/migrations/0001_schema.sql` puis
   `supabase/migrations/0002_storage.sql`. Le second crée le compartiment
   `media` et ses règles d'accès.
4. **Créer le compte de la maison** : _Authentication → Users → Add user_. Un
   déclencheur crée automatiquement le profil applicatif ; **le premier compte
   créé reçoit le rôle administrateur**, les suivants le rôle éditeur.
5. **Se connecter** sur `/admin`, puis cliquer sur « Importer le contenu » :
   collections, photos, galerie, services, témoignages, questions et textes de
   la maquette sont recopiés en base. Les photographies sont référencées par
   leur chemin public — la vitrine reste donc strictement identique après
   l'import, et vos propres visuels les remplaceront un à un.

### Ce que l'on peut modifier

| Rubrique        | Contenu piloté                                                         |
| --------------- | ---------------------------------------------------------------------- |
| **Collections** | Univers : nom, accroche, description, catégorie, statut, ordre, photos |
| **Galerie**     | Mosaïque de la vitrine : photos, légendes, empreinte des tuiles, ordre |
| **Services**    | Prestations après-vente, tarifs, pictogrammes, ordre                   |
| **Témoignages** | Avis, notes, avis mis en avant, ordre                                  |
| **Questions**   | Questions fréquentes — alimentent aussi le balisage `FAQPage`          |
| **Accueil**     | Bandeau principal (titres, texte, boutons, image) et chiffres clés     |
| **Histoire**    | Récit, portrait, chronologie, citation du fondateur                    |
| **Coordonnées** | Téléphone, WhatsApp, e-mail, adresse, plan, réseaux sociaux, horaires  |

Chaque élément porte un statut **Visible / Masqué** et se réordonne par
glisser-déposer — à la souris comme au clavier (Espace pour saisir, flèches pour
déplacer, Espace pour déposer).

### Base de données

Huit tables dans le schéma `public` :

| Table               | Rôle                                                                    |
| ------------------- | ----------------------------------------------------------------------- |
| `users`             | Profils habilités, adossés à `auth.users` (rôle admin / éditeur)        |
| `collections`       | Univers de la vitrine                                                   |
| `collection_images` | Photos d'une collection, dont l'image principale                        |
| `gallery_images`    | Mosaïque de la vitrine                                                  |
| `services`          | Prestations après-vente                                                 |
| `testimonials`      | Avis clients                                                            |
| `faq`               | Questions fréquentes                                                    |
| `settings`          | Blocs singuliers en JSON : `hero`, `about`, `contact`, `hours`, `stats` |

`gallery_images` s'ajoute à la liste demandée : la galerie a son propre ordre et
sa propre empreinte de tuiles, la loger dans `settings` aurait produit un JSON
ingérable.

**Row Level Security** est active sur toutes les tables. Lecture publique
limitée aux lignes `visible` ; écriture réservée aux porteurs d'un profil dans
`public.users`, via les fonctions `is_staff()` et `is_admin()`. Un compte
authentifié sans profil ne peut donc rien lire de masqué ni rien écrire.

### Stockage des images

Un compartiment `media`, public en lecture, organisé par dossiers :

```
media/collections/<univers>/…   photos des collections
media/gallery/vitrine/…         mosaïque
media/content/hero|histoire/…   bandeau, portrait
```

Le fichier ne transite jamais par le serveur Next : le navigateur le compresse
(2 000 px sur le grand côté, WebP, qualité 0,86), demande une **URL signée à
usage unique**, puis l'envoie directement à Supabase en XHR — ce qui donne une
barre de progression réelle. À chaque remplacement ou suppression, l'ancien
objet est retiré du compartiment ; le stockage n'accumule pas d'orphelins.

### Sécurité

- **Sessions** par cookies `httpOnly`, rafraîchies dans le middleware.
- **Middleware** : aucune page `/admin` n'est produite sans session valide. Le
  contrôle utilise `getUser()`, qui valide le jeton auprès de Supabase, et non
  `getSession()` qui se contente de lire le cookie.
- **Double contrôle** : chaque action serveur revérifie les droits de son côté.
  Une action forgée hors interface est rejetée même si le middleware est
  contourné.
- **Validation Zod** partagée entre le formulaire et l'action : un envoi hors
  navigateur subit exactement les mêmes règles.
- **Protection XSS** : React échappe tout contenu par défaut, et aucun contenu
  éditorial n'est injecté en `dangerouslySetInnerHTML`. Le seul usage de cette
  API concerne le JSON-LD, dont les chevrons sont échappés.
- **Protection CSRF** : les Server Actions de Next.js vérifient l'origine de la
  requête et n'acceptent que des identifiants d'action non devinables ; aucun
  point d'entrée mutant n'est exposé en `GET`.
- **En-têtes** de sécurité appliqués à toutes les routes (voir `next.config.ts`),
  et `/admin` marqué `noindex`.

### Comment le site public lit ce contenu

`services/content/` interroge Supabase et **retombe sur `constants/` en cas
d'absence** : Supabase non configuré, requête en échec, ou table vide. Le site
reste donc complet en toutes circonstances, y compris pendant l'installation.

Les lectures sont mémorisées sous des étiquettes de cache
(`lib/cache.ts`) ; les actions du tableau de bord invalident l'étiquette
correspondante puis les pages concernées. Les pages publiques restent donc
statiques et rapides, tout en reflétant les modifications sans délai.

---

## Notes de reprise

- **Navigation par ancres corrigée.** « Savoir-faire », « Services » et
  « Histoire » pointent vers des sections de l'accueil, pas vers des pages.
  Elles semblaient inertes : Lenis, qui pilote le défilement, écrasait le saut
  natif du navigateur. Les liens d'ancrage lui sont désormais confiés
  (`components/providers/hash-scroll.tsx`), avec un décalage égal à la hauteur
  de la barre fixe.
- **Les pièces de la page Collections restent codées** dans
  `constants/collections.ts`. Un module « pièces » ne figurait pas dans les
  tables demandées, et le faire piloter par les collections aurait changé
  l'affichage (poids et cours du jour disparaissent) — ce que la consigne
  « ne pas modifier le design public » interdit. Les filtres de cette page, eux,
  suivent bien les univers du tableau de bord.
