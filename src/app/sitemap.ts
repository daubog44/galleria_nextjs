import { MetadataRoute } from 'next';
import { db } from '@/db';
import { paintings, reviews } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Fetch all paintings
    const allPaintings = await db.select({
        id: paintings.id,
        imageUrl: paintings.imageUrl,
        createdAt: paintings.createdAt,
        title: paintings.title,
    }).from(paintings).orderBy(desc(paintings.createdAt));

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/biografia`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/stile`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contatti`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // Fetch all reviews
    const allReviews = await db.select({
        slug: reviews.slug,
        date: reviews.date,
        imageUrl: reviews.imageUrl,
    }).from(reviews).orderBy(desc(reviews.id));

    const paintingRoutes: MetadataRoute.Sitemap = allPaintings.map((painting) => ({
        url: `${baseUrl}/opera/${painting.id}`,
        lastModified: painting.createdAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        images: painting.imageUrl ? [painting.imageUrl] : undefined,
    }));

    const reviewRoutes: MetadataRoute.Sitemap = allReviews
        .filter(r => r.slug)
        .map((review) => ({
            url: `${baseUrl}/stile/${review.slug}`,
            lastModified: review.date ? new Date(review.date) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
            images: review.imageUrl ? [review.imageUrl] : undefined,
        }));

    return [...staticRoutes, ...paintingRoutes, ...reviewRoutes];
}
