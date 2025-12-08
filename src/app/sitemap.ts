import { MetadataRoute } from 'next';
import { db } from '@/db';
import { paintings, reviews } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { getSiteUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl();

    // Fetch all paintings
    const allPaintings = await db.select({
        id: paintings.id,
        imageUrl: paintings.imageUrl,
        createdAt: paintings.createdAt,
        title: paintings.title,
        slug: paintings.slug,
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

    const paintingRoutes: MetadataRoute.Sitemap = allPaintings.map((painting) => {
        let imageUrl = painting.imageUrl;
        // Make image URL absolute if relative
        if (imageUrl && imageUrl.startsWith('/')) {
            // Replace /sitedata/paintings with /paintings for customized URL structure
            // (Requires rewrite in next.config.ts)
            let cleanUrl = imageUrl;
            if (imageUrl.startsWith('/sitedata/paintings')) {
                cleanUrl = imageUrl.replace('/sitedata/paintings', '/paintings');
            }
            imageUrl = `${baseUrl}${cleanUrl}`;
        }

        return {
            url: `${baseUrl}/opera/${painting.slug || painting.id}`,
            lastModified: painting.createdAt || new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
            images: imageUrl ? [imageUrl] : undefined,
        };
    });

    const reviewRoutes: MetadataRoute.Sitemap = allReviews
        .filter(r => r.slug)
        .map((review) => {
            let imageUrl = review.imageUrl;
            // Make image URL absolute if relative
            if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = `${baseUrl}${imageUrl}`;
            }

            return {
                url: `${baseUrl}/stile/${review.slug}`,
                lastModified: review.date ? new Date(review.date) : new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
                images: imageUrl ? [imageUrl] : undefined,
            };
        });

    return [...staticRoutes, ...paintingRoutes, ...reviewRoutes];
}
