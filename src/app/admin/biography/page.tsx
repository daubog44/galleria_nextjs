import { db } from '@/db';
import { biography } from '@/db/schema';
import BiographyForm from './BiographyForm';

import { getBiographyContent } from '@/lib/sitedata';

export const dynamic = 'force-dynamic';

export default async function BiographyPage() {
    let currentContent = '';
    let currentImageUrl = '';

    try {
        const bio = await db.select().from(biography).limit(1);
        let content = await getBiographyContent();

        if (bio.length > 0) {
            currentImageUrl = bio[0].imageUrl || '';
            if (!content) content = bio[0].content; // Fallback
        }
        currentContent = content;


    } catch (e) {
        console.warn("Database error in Admin Biography:", e);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Modifica Biografia</h1>
            <BiographyForm
                initialContent={currentContent}
                initialImageUrl={currentImageUrl}
            />
        </div>
    );
}
