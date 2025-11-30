
'use server';

import { db } from '@/db';
import { biography, seoMetadata } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateBiography(formData: FormData) {
    const content = formData.get('content') as string;
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;

    // Check if biography exists
    const existing = await db.select().from(biography).limit(1);

    if (existing.length > 0) {
        await db.update(biography)
            .set({ content })
            .where(eq(biography.id, existing[0].id));
    } else {
        await db.insert(biography).values({ content });
    }

    // Update SEO
    const existingSeo = await db.select().from(seoMetadata).where(eq(seoMetadata.pageKey, 'biography')).limit(1);
    if (existingSeo.length > 0) {
        await db.update(seoMetadata)
            .set({ title: seoTitle, description: seoDescription })
            .where(eq(seoMetadata.pageKey, 'biography'));
    } else {
        await db.insert(seoMetadata).values({
            pageKey: 'biography',
            title: seoTitle,
            description: seoDescription,
        });
    }

    revalidateTag('biography', 'max');
    revalidatePath('/admin/biography');
    revalidatePath('/biografia');
    redirect('/admin/biography');
}
