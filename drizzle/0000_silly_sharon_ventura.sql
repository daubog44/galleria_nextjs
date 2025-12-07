CREATE TABLE "biography" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL
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
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"author" text,
	"content" text NOT NULL,
	"source" text,
	"date" text,
	"type" text DEFAULT 'review'
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
