/**
 * Amorçage du contenu, hors application.
 *
 * Même contenu que le bouton « Importer le contenu de la maquette » du tableau
 * de bord, mais exécutable en ligne de commande — utile juste après avoir
 * lancé les migrations, quand le tableau de bord est encore vide et qu'on veut
 * vérifier le site avant de se connecter.
 *
 *   node scripts/seed.mjs
 *
 * La clé de service ne quitte jamais la machine : elle est lue dans
 * `.env.local`, qui n'est pas versionné.
 */
import { readFileSync } from 'node:fs';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url, { alias: { '@': process.cwd() } });

const { COLLECTIONS } = await jiti.import('@/constants/collections.ts');
const { SERVICES } = await jiti.import('@/constants/services.ts');
const { FAQ_ENTRIES } = await jiti.import('@/constants/faq.ts');
const { GALLERY_TILES } = await jiti.import('@/constants/gallery.ts');
const { FEATURED_TESTIMONIAL, HERO_TESTIMONIAL, TESTIMONIALS } = await jiti.import(
  '@/constants/testimonials.ts',
);
const { DEFAULT_ABOUT, DEFAULT_CONTACT, DEFAULT_HERO, DEFAULT_HOURS, DEFAULT_STATS } =
  await jiti.import('@/constants/defaults.ts');
const { SETTING_KEYS } = await jiti.import('@/lib/schemas/content.ts');

/* --- Identifiants -------------------------------------------------------- */

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const cut = line.indexOf('=');
      return [line.slice(0, cut).trim(), line.slice(cut + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manque dans .env.local.');
  process.exit(1);
}

const rest = async (path, { method = 'GET', body, prefer } = {}) => {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20_000),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`${path} → ${response.status} ${text}`);
  return text ? JSON.parse(text) : [];
};

/* --- Garde-fou ----------------------------------------------------------- */

const existing = await rest('collections?select=id&limit=1');
if (existing.length > 0) {
  console.log('La base contient déjà des collections : rien n’a été modifié.');
  process.exit(0);
}

/* --- Insertion ----------------------------------------------------------- */

const inserted = await rest('collections', {
  method: 'POST',
  prefer: 'return=representation',
  body: COLLECTIONS.map((collection, index) => ({
    slug: collection.slug,
    name: collection.name,
    tagline: collection.tagline,
    description: collection.description ?? null,
    category: 'bijoux',
    status: 'visible',
    position: index,
  })),
});

const idBySlug = new Map(inserted.map((row) => [row.slug, row.id]));

// Les photos de la maquette sont référencées par leur chemin public : la
// vitrine reste strictement identique après l'import.
const collectionImages = COLLECTIONS.flatMap((collection) => {
  const id = idBySlug.get(collection.slug);
  if (!id || !collection.image) return [];
  return [
    {
      collection_id: id,
      storage_path: collection.image.src,
      alt: collection.image.alt,
      width: collection.image.width,
      height: collection.image.height,
      position: 0,
      is_primary: true,
    },
  ];
});

const galleryImages = GALLERY_TILES.flatMap((tile, index) =>
  tile.image
    ? [
        {
          storage_path: tile.image.src,
          alt: tile.image.alt,
          caption: tile.caption ?? null,
          width: tile.image.width,
          height: tile.image.height,
          col_span: tile.span.cols,
          row_span: tile.span.rows,
          status: 'visible',
          position: index,
        },
      ]
    : [],
);

const testimonials = [
  { ...FEATURED_TESTIMONIAL, is_featured: true },
  { ...HERO_TESTIMONIAL, is_featured: false },
  ...TESTIMONIALS.map((testimonial) => ({ ...testimonial, is_featured: false })),
].map((testimonial, index) => ({
  quote: testimonial.quote,
  author: testimonial.author,
  context: testimonial.context,
  rating: testimonial.rating,
  is_featured: testimonial.is_featured,
  status: 'visible',
  position: index,
}));

await rest('collection_images', { method: 'POST', body: collectionImages });
await rest('gallery_images', { method: 'POST', body: galleryImages });
await rest('services', {
  method: 'POST',
  body: SERVICES.map((service, index) => ({
    icon: service.icon,
    title: service.title,
    description: service.description,
    price: service.price,
    status: 'visible',
    position: index,
  })),
});
await rest('testimonials', { method: 'POST', body: testimonials });
await rest('faq', {
  method: 'POST',
  body: FAQ_ENTRIES.map((entry, index) => ({
    question: entry.question,
    answer: entry.answer,
    status: 'visible',
    position: index,
  })),
});
await rest('settings?on_conflict=key', {
  method: 'POST',
  prefer: 'resolution=merge-duplicates',
  body: [
    { key: SETTING_KEYS.hero, value: DEFAULT_HERO },
    { key: SETTING_KEYS.about, value: DEFAULT_ABOUT },
    { key: SETTING_KEYS.contact, value: DEFAULT_CONTACT },
    { key: SETTING_KEYS.hours, value: DEFAULT_HOURS },
    { key: SETTING_KEYS.stats, value: DEFAULT_STATS },
  ],
});

console.log(
  `Importé : ${COLLECTIONS.length} collections, ${collectionImages.length} photos de collection, ` +
    `${galleryImages.length} photos de galerie, ${SERVICES.length} services, ` +
    `${testimonials.length} témoignages, ${FAQ_ENTRIES.length} questions, 5 réglages.`,
);
