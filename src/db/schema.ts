import { pgTable, serial, text, real, boolean, timestamp } from 'drizzle-orm/pg-core';

export const paintings = pgTable('paintings', {
    id: serial('id').primaryKey(),
    title: text('title'),
    description: text('description'),
    price: real('price'),
    width: real('width'),
    height: real('height'),
    sold: boolean('sold').default(false),
    imageUrl: text('image_url').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoAltText: text('seo_alt_text'),
    externalLink: text('external_link'),
    slug: text('slug').unique(),
});

export const biography = pgTable('biography', {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
});

export const reviews = pgTable('reviews', {
    id: serial('id').primaryKey(),
    title: text('title'),
    author: text('author'),
    content: text('content').notNull(), // This might store the summary or full content if small, but we'll use filePath for MD
    source: text('source'),
    date: text('date'),
    type: text('type').default('review'), // 'review' or 'article'
    imageUrl: text('image_url'),
    filePath: text('file_path'),
    slug: text('slug').unique(),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoAltText: text('seo_alt_text'),
});

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
});

export const settings = pgTable('settings', {
    id: serial('id').primaryKey(),
    navbarTitle: text('navbar_title').default('Galleria Ermetica'),
    email: text('email'),
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    instagram: text('instagram'),
    facebook: text('facebook'),
});

export const externalLinks = pgTable('external_links', {
    id: serial('id').primaryKey(),
    label: text('label').notNull(),
    url: text('url').notNull(),
    icon: text('icon').notNull(), // 'instagram', 'facebook', 'whatsapp', 'twitter', 'linkedin', 'youtube', 'globe', 'mail', 'phone'
    order: serial('order').notNull(),
});

export const seoMetadata = pgTable('seo_metadata', {
    id: serial('id').primaryKey(),
    pageKey: text('page_key').notNull().unique(), // 'home', 'biography', 'reviews', 'contact'
    title: text('title'), // Provides valid <title> tag
    h1: text('h1'), // Provides visible <h1> tag
    subtitle: text('subtitle'),
    description: text('description'),
    imageAltText: text('image_alt_text'),
});
