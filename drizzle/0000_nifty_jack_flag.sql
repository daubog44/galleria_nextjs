CREATE TABLE "biography" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "external_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"icon" text NOT NULL,
	"order" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paintings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"price" real,
	"width" real,
	"height" real,
	"sold" boolean DEFAULT false,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"seo_title" text,
	"seo_description" text,
	"seo_alt_text" text,
	"external_link" text
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"author" text,
	"content" text NOT NULL,
	"source" text,
	"date" text,
	"type" text DEFAULT 'review',
	"image_url" text,
	"file_path" text,
	"slug" text,
	CONSTRAINT "reviews_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "seo_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_key" text NOT NULL,
	"title" text,
	"description" text,
	"image_alt_text" text,
	CONSTRAINT "seo_metadata_page_key_unique" UNIQUE("page_key")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"instagram" text,
	"facebook" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
