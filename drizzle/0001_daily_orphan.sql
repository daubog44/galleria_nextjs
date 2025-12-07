CREATE TABLE IF NOT EXISTS "external_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"icon" text NOT NULL,
	"order" serial NOT NULL
);
