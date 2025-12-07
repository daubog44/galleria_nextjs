'use server';

import { db } from '@/db';
import { seoMetadata } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';

// import { updateMetadataFile } from '@/lib/metadata-utils'; removed

export async function updatePageSeo(formData: FormData) {
    const pageKey = formData.get('pageKey') as string;
    const title = formData.get('seoTitle') as string;
    const subtitle = formData.get('seoSubtitle') as string;
    const description = formData.get('seoDescription') as string;
    const imageAltText = formData.get('seoAltText') as string;

    if (!pageKey) throw new Error('Page key is required');

    const existing = await db.select().from(seoMetadata).where(eq(seoMetadata.pageKey, pageKey)).limit(1);

    if (existing.length > 0) {
        await db.update(seoMetadata)
            .set({ title, subtitle, description, imageAltText })
            .where(eq(seoMetadata.pageKey, pageKey));
    } else {
        await db.insert(seoMetadata).values({
            pageKey,
            title,
            subtitle,
            description,
            imageAltText,
        });
    }

    // await updateMetadataFile(); removed

    revalidateTag('seo', 'max');
    revalidatePath('/sitemap.xml');

    if (pageKey === 'home') revalidatePath('/');
    if (pageKey === 'biography') revalidatePath('/biografia');
    if (pageKey === 'reviews') revalidatePath('/stile');
    if (pageKey === 'contact') revalidatePath('/contatti');
}
