import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Schéma de la base Neon.
 *
 * C'est la source unique : les types TypeScript en sont déduits
 * (`types/database.ts`) et les migrations SQL de `drizzle/` sont générées à
 * partir de lui par `npm run db:generate`. Modifier une table, c'est modifier
 * ce fichier puis générer une migration — jamais écrire le SQL à la main.
 *
 * Les noms de colonnes restent en snake_case côté TypeScript : ils
 * correspondent exactement aux colonnes, et donc aux données importées de
 * l'ancienne base Supabase.
 */

/* -------------------------------------------------------------------------- */
/*  Types énumérés                                                             */
/* -------------------------------------------------------------------------- */

export const contentStatus = pgEnum('content_status', ['visible', 'hidden']);
export const userRole = pgEnum('user_role', ['admin', 'editor']);
export const badgeTone = pgEnum('badge_tone', ['gold', 'dark']);
export const requestStatus = pgEnum('request_status', ['new', 'handled']);

/* -------------------------------------------------------------------------- */
/*  Colonnes communes                                                          */
/* -------------------------------------------------------------------------- */

const stamp = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

const createdAt = () => stamp('created_at').notNull().defaultNow();

/** Mis à jour par Drizzle à chaque `update`, sans déclencheur en base. */
const updatedAt = () =>
  stamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

const position = () => integer('position').notNull().default(0);
const status = () => contentStatus('status').notNull().default('visible');

/* -------------------------------------------------------------------------- */
/*  Comptes et sessions                                                        */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Toujours enregistrée en minuscules : une adresse, un compte. */
    email: text('email').notNull().unique(),
    full_name: text('full_name').notNull().default(''),
    role: userRole('role').notNull().default('editor'),
    /** Empreinte scrypt, paramètres inclus — jamais le mot de passe. */
    password_hash: text('password_hash').notNull(),
    last_login_at: stamp('last_login_at'),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [check('users_email_lowercase', sql`${table.email} = lower(${table.email})`)],
);

/**
 * Sessions du tableau de bord.
 *
 * L'identifiant est l'empreinte SHA-256 du jeton remis au navigateur : une
 * fuite de la table ne permet pas d'ouvrir une session.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires_at: stamp('expires_at').notNull(),
    user_agent: text('user_agent').notNull().default(''),
    created_at: createdAt(),
  },
  (table) => [
    index('sessions_user_idx').on(table.user_id),
    index('sessions_expires_idx').on(table.expires_at),
  ],
);

/**
 * Compteurs de limitation (connexion, formulaires publics).
 *
 * En base plutôt qu'en mémoire : sur un hébergement serverless, chaque
 * instance a sa propre mémoire, et une limite tenue en mémoire ne limite rien.
 */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  reset_at: stamp('reset_at').notNull(),
});

/* -------------------------------------------------------------------------- */
/*  Vitrine                                                                    */
/* -------------------------------------------------------------------------- */

export const collections = pgTable(
  'collections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    tagline: text('tagline').notNull().default(''),
    description: text('description'),
    category: text('category').notNull().default('bijoux'),
    status: status(),
    position: position(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    index('collections_position_idx').on(table.position),
    check('collections_name_not_blank', sql`length(btrim(${table.name})) > 0`),
  ],
);

export const collectionImages = pgTable(
  'collection_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    collection_id: uuid('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    /** URL publique du fichier, ou chemin `/images/…` d'un visuel livré avec le site. */
    storage_path: text('storage_path').notNull(),
    alt: text('alt').notNull().default(''),
    width: integer('width').notNull().default(0),
    height: integer('height').notNull().default(0),
    position: position(),
    is_primary: boolean('is_primary').notNull().default(false),
    created_at: createdAt(),
  },
  (table) => [
    index('collection_images_collection_idx').on(table.collection_id, table.position),
    // Une seule image principale par collection.
    uniqueIndex('collection_images_single_primary_idx')
      .on(table.collection_id)
      .where(sql`${table.is_primary}`),
  ],
);

/** Pièces en vitrine — la grille de la page Collections. */
export const pieces = pgTable(
  'pieces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    /** Matière et pierres, version longue (grand écran). */
    detail: text('detail').notNull().default(''),
    /** Version courte, pour la grille mobile. */
    detail_short: text('detail_short').notNull().default(''),
    /** Poids réel en grammes ; vide quand il n'a pas de sens (montre…). */
    weight_grams: doublePrecision('weight_grams'),
    collection_id: uuid('collection_id').references(() => collections.id, {
      onDelete: 'set null',
    }),
    storage_path: text('storage_path'),
    image_alt: text('image_alt').notNull().default(''),
    image_width: integer('image_width').notNull().default(0),
    image_height: integer('image_height').notNull().default(0),
    badge_label: text('badge_label'),
    badge_tone: badgeTone('badge_tone'),
    status: status(),
    position: position(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    index('pieces_position_idx').on(table.position),
    index('pieces_collection_idx').on(table.collection_id),
    check('pieces_name_not_blank', sql`length(btrim(${table.name})) > 0`),
    check(
      'pieces_weight_positive',
      sql`${table.weight_grams} is null or ${table.weight_grams} > 0`,
    ),
  ],
);

export const galleryImages = pgTable(
  'gallery_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    storage_path: text('storage_path').notNull(),
    alt: text('alt').notNull().default(''),
    caption: text('caption'),
    width: integer('width').notNull().default(0),
    height: integer('height').notNull().default(0),
    col_span: smallint('col_span').$type<1 | 2>().notNull().default(1),
    row_span: smallint('row_span').$type<2 | 3>().notNull().default(2),
    status: status(),
    position: position(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    index('gallery_images_position_idx').on(table.position),
    check('gallery_images_col_span', sql`${table.col_span} between 1 and 2`),
    check('gallery_images_row_span', sql`${table.row_span} between 2 and 3`),
  ],
);

export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    icon: text('icon').notNull().default('repair'),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    price: text('price').notNull().default(''),
    status: status(),
    position: position(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    index('services_position_idx').on(table.position),
    check('services_title_not_blank', sql`length(btrim(${table.title})) > 0`),
  ],
);

export const testimonials = pgTable(
  'testimonials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quote: text('quote').notNull(),
    author: text('author').notNull(),
    context: text('context').notNull().default(''),
    rating: smallint('rating').notNull().default(5),
    is_featured: boolean('is_featured').notNull().default(false),
    status: status(),
    position: position(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    index('testimonials_position_idx').on(table.position),
    check('testimonials_rating_range', sql`${table.rating} between 1 and 5`),
    check('testimonials_quote_not_blank', sql`length(btrim(${table.quote})) > 0`),
  ],
);

export const faq = pgTable(
  'faq',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    status: status(),
    position: position(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (table) => [
    index('faq_position_idx').on(table.position),
    check('faq_question_not_blank', sql`length(btrim(${table.question})) > 0`),
  ],
);

/**
 * Blocs singuliers, en JSON validé côté application par `lib/schemas/content.ts`.
 * Clés : hero, about, contact, hours, stats, visuals, catalog.
 */
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<unknown>().notNull(),
  updated_at: updatedAt(),
});

/* -------------------------------------------------------------------------- */
/*  Relation client                                                            */
/* -------------------------------------------------------------------------- */

/** Demandes envoyées par le formulaire de contact : plus aucune ne se perd. */
export const contactRequests = pgTable(
  'contact_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    full_name: text('full_name').notNull(),
    phone: text('phone').notNull(),
    topic: text('topic').notNull(),
    message: text('message').notNull().default(''),
    status: requestStatus('status').notNull().default('new'),
    handled_at: stamp('handled_at'),
    created_at: createdAt(),
  },
  (table) => [index('contact_requests_inbox_idx').on(table.status, table.created_at)],
);

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  created_at: createdAt(),
});
