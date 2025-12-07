CREATE TABLE IF NOT EXISTS "seo_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_key" text NOT NULL,
	"title" text,
	"description" text,
	"image_alt_text" text,
	CONSTRAINT "seo_metadata_page_key_unique" UNIQUE("page_key")
);
--> statement-breakpoint
ALTER TABLE "paintings" ADD COLUMN IF NOT EXISTS "seo_title" text;--> statement-breakpoint
ALTER TABLE "paintings" ADD COLUMN IF NOT EXISTS "seo_description" text;--> statement-breakpoint
ALTER TABLE "paintings" ADD COLUMN IF NOT EXISTS "seo_alt_text" text;--> statement-breakpoint
ALTER TABLE "paintings" ADD COLUMN IF NOT EXISTS "external_link" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "image_url" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "file_path" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_slug_unique" UNIQUE("slug");