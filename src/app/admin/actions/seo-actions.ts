'use server';

import { db } from '@/db';
import { seoMetadata } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';

// import { updateMetadataFile } from '@/lib/metadata-utils'; removed

export async function updatePageSeo(formData: FormData) {
    const pageKey = formData.get('pageKey') as string;
    const title = formData.get('seoTitle') as string;
    const h1 = formData.get('seoH1') as string;
    const subtitle = formData.get('seoSubtitle') as string;
    const description = formData.get('seoDescription') as string;
    const imageAltText = formData.get('seoAltText') as string;

    if (!pageKey) throw new Error('Page key is required');

    const existing = await db.select().from(seoMetadata).where(eq(seoMetadata.pageKey, pageKey)).limit(1);

    if (existing.length > 0) {
        await db.update(seoMetadata)
            .set({ title, h1, subtitle, description, imageAltText })
            .where(eq(seoMetadata.pageKey, pageKey));
    } else {
        await db.insert(seoMetadata).values({
            pageKey,
            title,
            h1,
            subtitle,
            description,
            imageAltText,
        });
    }

    // await updateMetadataFile(); removed

    revalidateTag('seo', "max"); // Fixed: removed invalid 'max' argument
    revalidatePath('/sitemap.xml');

    // Force revalidate specific paths just in case
    if (pageKey === 'home') revalidatePath('/', 'page');
    if (pageKey === 'biography') revalidatePath('/biografia', 'page');
    if (pageKey === 'reviews') revalidatePath('/stile', 'page');
    if (pageKey === 'contact') revalidatePath('/contatti', 'page');
}
