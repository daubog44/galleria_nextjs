

import { db } from '@/db';
import { biography, seoMetadata } from '@/db/schema';
import { eq } from 'drizzle-orm';
import BiographyForm from './BiographyForm';

export const dynamic = 'force-dynamic';

export default async function BiographyPage() {
    let currentContent = '';
    let seoData = {};

    try {
        const bio = await db.select().from(biography).limit(1);
        currentContent = bio[0]?.content || '';

        const seo = await db.select().from(seoMetadata).where(eq(seoMetadata.pageKey, 'biography')).limit(1);
        seoData = seo[0] || {};
    } catch (error) {
        console.warn("Database connection failed in Admin Biography page (expected during build):", error);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Modifica Biografia</h1>
            <BiographyForm
                initialContent={currentContent}
                initialSeo={seoData}
            />
        </div>
    );
}
