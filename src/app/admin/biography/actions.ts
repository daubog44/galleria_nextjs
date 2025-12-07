
'use server';


import { db } from '@/db';
import { biography, seoMetadata } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
// import { updateMetadataFile } from '@/lib/metadata-utils'; removed
import { promises as fs } from 'fs';
import path from 'path';
import { saveBiographyContent } from '@/lib/sitedata';

export async function uploadBiographyImageAction(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'No file received.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(' ', '_');
    const uploadDir = path.join(process.cwd(), 'public/sitedata/biography');

    // Ensure directory exists
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }

    try {
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        return {
            success: true,
            url: `/sitedata/biography/${filename}`
        };
    } catch {
        return { success: false, error: 'Errore generico durante l\'aggiornamento' };
    }
}

export async function updateBiography(formData: FormData) {
    const content = formData.get('content') as string;
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Save content to file (primary source)
    await saveBiographyContent(content);

    // Check if biography exists
    const existing = await db.select().from(biography).limit(1);

    if (existing.length > 0) {
        // Handle image deletion if changed
        if (existing[0].imageUrl && imageUrl && existing[0].imageUrl !== imageUrl) {
            try {
                // Remove leading slash if present for path joining
                const relativePath = existing[0].imageUrl.startsWith('/') ? existing[0].imageUrl.slice(1) : existing[0].imageUrl;
                const fullPath = path.join(process.cwd(), 'public', relativePath);
                await fs.unlink(fullPath);
            } catch {
                // console.error('Failed to delete old image');
            }
        }

        await db.update(biography)
            .set({ content, imageUrl }) // Update DB too for now as cache/backup, or can set content to ''
            .where(eq(biography.id, existing[0].id));
    } else {
        await db.insert(biography).values({ content, imageUrl });
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

    // await updateMetadataFile(); removed

    revalidateTag('biography', "max");
    revalidatePath('/admin/biography');
    revalidatePath('/biografia');
    revalidatePath('/sitemap.xml');

    return { success: true, message: 'Biografia aggiornata con successo!' };
}

