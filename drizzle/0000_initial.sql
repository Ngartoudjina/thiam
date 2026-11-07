CREATE TYPE "public"."badge_tone" AS ENUM('gold', 'dark');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('visible', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('new', 'handled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TABLE "collection_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"width" integer DEFAULT 0 NOT NULL,
	"height" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"description" text,
	"category" text DEFAULT 'bijoux' NOT NULL,
	"status" "content_status" DEFAULT 'visible' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug"),
	CONSTRAINT "collections_name_not_blank" CHECK (length(btrim("collections"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "contact_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"topic" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"status" "content_status" DEFAULT 'visible' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "faq_question_not_blank" CHECK (length(btrim("faq"."question")) > 0)
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_path" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"width" integer DEFAULT 0 NOT NULL,
	"height" integer DEFAULT 0 NOT NULL,
	"col_span" smallint DEFAULT 1 NOT NULL,
	"row_span" smallint DEFAULT 2 NOT NULL,
	"status" "content_status" DEFAULT 'visible' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_images_col_span" CHECK ("gallery_images"."col_span" between 1 and 2),
	CONSTRAINT "gallery_images_row_span" CHECK ("gallery_images"."row_span" between 2 and 3)
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pieces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"detail_short" text DEFAULT '' NOT NULL,
	"weight_grams" double precision,
	"collection_id" uuid,
	"storage_path" text,
	"image_alt" text DEFAULT '' NOT NULL,
	"image_width" integer DEFAULT 0 NOT NULL,
	"image_height" integer DEFAULT 0 NOT NULL,
	"badge_label" text,
	"badge_tone" "badge_tone",
	"status" "content_status" DEFAULT 'visible' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pieces_name_not_blank" CHECK (length(btrim("pieces"."name")) > 0),
	CONSTRAINT "pieces_weight_positive" CHECK ("pieces"."weight_grams" is null or "pieces"."weight_grams" > 0)
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"icon" text DEFAULT 'repair' NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" text DEFAULT '' NOT NULL,
	"status" "content_status" DEFAULT 'visible' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_title_not_blank" CHECK (length(btrim("services"."title")) > 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote" text NOT NULL,
	"author" text NOT NULL,
	"context" text DEFAULT '' NOT NULL,
	"rating" smallint DEFAULT 5 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'visible' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "testimonials_rating_range" CHECK ("testimonials"."rating" between 1 and 5),
	CONSTRAINT "testimonials_quote_not_blank" CHECK (length(btrim("testimonials"."quote")) > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"role" "user_role" DEFAULT 'editor' NOT NULL,
	"password_hash" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_email_lowercase" CHECK ("users"."email" = lower("users"."email"))
);
--> statement-breakpoint
ALTER TABLE "collection_images" ADD CONSTRAINT "collection_images_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_images_collection_idx" ON "collection_images" USING btree ("collection_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_images_single_primary_idx" ON "collection_images" USING btree ("collection_id") WHERE "collection_images"."is_primary";--> statement-breakpoint
CREATE INDEX "collections_position_idx" ON "collections" USING btree ("position");--> statement-breakpoint
CREATE INDEX "contact_requests_inbox_idx" ON "contact_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "faq_position_idx" ON "faq" USING btree ("position");--> statement-breakpoint
CREATE INDEX "gallery_images_position_idx" ON "gallery_images" USING btree ("position");--> statement-breakpoint
CREATE INDEX "pieces_position_idx" ON "pieces" USING btree ("position");--> statement-breakpoint
CREATE INDEX "pieces_collection_idx" ON "pieces" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "services_position_idx" ON "services" USING btree ("position");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "testimonials_position_idx" ON "testimonials" USING btree ("position");