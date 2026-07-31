'use server';

import { COLLECTIONS } from '@/constants/collections';
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_HOURS,
  DEFAULT_STATS,
} from '@/constants/defaults';
import { FAQ_ENTRIES } from '@/constants/faq';
import { GALLERY_TILES } from '@/constants/gallery';
import { SERVICES } from '@/constants/services';
import { FEATURED_TESTIMONIAL, HERO_TESTIMONIAL, TESTIMONIALS } from '@/constants/testimonials';
import { CACHE_TAGS } from '@/lib/cache';
import { SETTING_KEYS } from '@/lib/schemas/content';
import { requireAdmin } from '@/lib/auth';
import {
  failure,
  publishChanges,
  runAction,
  success,
  type ActionResult,
} from '@/services/admin/action-result';
import { adminClient } from '@/services/admin/repository';

/**
 * Amorçage du contenu.
 *
 * Recopie en base le contenu livré avec la maquette, pour que le tableau de
 * bord démarre plein plutôt que vide. Les photographies ne sont pas
 * téléversées : elles sont référencées par leur chemin public, si bien que la
 * vitrine reste strictement identique après l'import.
 *
 * Réservé aux administrateurs, et refusé si des collections existent déjà —
 * on n'écrase jamais un contenu réel par erreur.
 */
export async function seedContentAction(): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    const supabase = await adminClient();

    const { count } = await supabase
      .from('collections')
      .select('id', { count: 'exact', head: true });

    if ((count ?? 0) > 0) {
      return failure('La base contient déjà des collections : l’import a été annulé.');
    }

    const collections = COLLECTIONS.map((collection, index) => ({
      slug: collection.slug,
      name: collection.name,
      tagline: collection.tagline,
      description: collection.description ?? null,
      category: 'bijoux',
      status: 'visible' as const,
      position: index,
    }));

    const services = SERVICES.map((service, index) => ({
      icon: service.icon,
      title: service.title,
      description: service.description,
      price: service.price,
      status: 'visible' as const,
      position: index,
    }));

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
      status: 'visible' as const,
      position: index,
    }));

    const faq = FAQ_ENTRIES.map((entry, index) => ({
      question: entry.question,
      answer: entry.answer,
      status: 'visible' as const,
      position: index,
    }));

    const settings = [
      { key: SETTING_KEYS.hero, value: DEFAULT_HERO },
      { key: SETTING_KEYS.about, value: DEFAULT_ABOUT },
      { key: SETTING_KEYS.contact, value: DEFAULT_CONTACT },
      { key: SETTING_KEYS.hours, value: DEFAULT_HOURS },
      { key: SETTING_KEYS.stats, value: DEFAULT_STATS },
    ];

    // Les collections d'abord : leurs identifiants servent à rattacher les photos.
    const { data: insertedCollections, error: collectionsError } = await supabase
      .from('collections')
      .insert(collections)
      .select('id, slug');

    if (collectionsError || !insertedCollections) {
      console.error('[admin] amorçage en échec', collectionsError);
      return failure('L’import a échoué. Vérifiez que les migrations SQL ont bien été exécutées.');
    }

    /**
     * Photos livrées avec la maquette.
     *
     * On enregistre le chemin public tel quel (`/images/…`) : le site les sert
     * depuis `public/`, et la vitrine reste donc identique après l'import. Dès
     * qu'une vraie photo est déposée, elle prend la place et l'ancien chemin,
     * n'étant pas un objet du compartiment, n'est pas supprimé.
     */
    const idBySlug = new Map(insertedCollections.map((row) => [row.slug, row.id]));

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
              status: 'visible' as const,
              position: index,
            },
          ]
        : [],
    );

    const results = await Promise.all([
      supabase.from('collection_images').insert(collectionImages),
      supabase.from('gallery_images').insert(galleryImages),
      supabase.from('services').insert(services),
      supabase.from('testimonials').insert(testimonials),
      supabase.from('faq').insert(faq),
      supabase.from('settings').upsert(settings, { onConflict: 'key' }),
    ]);

    const firstError = results.find((result) => result.error)?.error;
    if (firstError) {
      console.error('[admin] amorçage partiel en échec', firstError);
      return failure('L’import a échoué en cours de route. Consultez les journaux du serveur.');
    }

    publishChanges(
      CACHE_TAGS.collections,
      CACHE_TAGS.gallery,
      CACHE_TAGS.services,
      CACHE_TAGS.testimonials,
      CACHE_TAGS.faq,
      CACHE_TAGS.settings,
    );

    return success('Contenu de la maquette importé. Vous pouvez maintenant le modifier.');
  });
}
