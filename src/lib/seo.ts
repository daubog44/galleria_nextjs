import { db } from '@/db';
import { seoMetadata } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export const getPageSeo = unstable_cache(
    async (pageKey: string) => {
        try {
            const res = await db.select().from(seoMetadata).where(eq(seoMetadata.pageKey, pageKey)).limit(1);
            return res[0] || null;
        } catch (e) {
            console.error(`Error fetching SEO for ${pageKey}:`, e);
            return null;
        }
    },
    ['page-seo'],
    { tags: ['seo'] }
);
