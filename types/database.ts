import type * as schema from '@/lib/db/schema';

/**
 * Types des lignes de la base, déduits du schéma Drizzle (`lib/db/schema.ts`).
 *
 * Rien n'est écrit à la main : modifier une colonne dans le schéma met ces
 * types à jour, et le compilateur signale chaque usage à reprendre.
 */

export type ContentStatus = (typeof schema.contentStatus.enumValues)[number];
export type UserRole = (typeof schema.userRole.enumValues)[number];
export type BadgeTone = (typeof schema.badgeTone.enumValues)[number];
export type RequestStatus = (typeof schema.requestStatus.enumValues)[number];

/** Profil sans l'empreinte du mot de passe : la seule forme qui quitte le serveur. */
export type UserRow = Omit<typeof schema.users.$inferSelect, 'password_hash'>;

export type CollectionRow = typeof schema.collections.$inferSelect;
export type CollectionImageRow = typeof schema.collectionImages.$inferSelect;
export type PieceRow = typeof schema.pieces.$inferSelect;
export type GalleryImageRow = typeof schema.galleryImages.$inferSelect;
export type ServiceRow = typeof schema.services.$inferSelect;
export type TestimonialRow = typeof schema.testimonials.$inferSelect;
export type FaqRow = typeof schema.faq.$inferSelect;
export type SettingRow = typeof schema.settings.$inferSelect;
export type ContactRequestRow = typeof schema.contactRequests.$inferSelect;
export type NewsletterSubscriberRow = typeof schema.newsletterSubscribers.$inferSelect;
