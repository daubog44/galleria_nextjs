
'use server';

import { db } from '@/db';
import { paintings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
// import { updateMetadataFile } from '@/lib/metadata-utils'; removed
import { promises as fs } from 'fs';
import path from 'path';

export async function uploadImageAction(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'No file received.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(' ', '_');
    const uploadDir = path.join(process.cwd(), 'public/sitedata/paintings');

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
            url: `/sitedata/paintings/${filename}`
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: 'Error uploading file.' };
    }
}

import { generateSeoData } from '../actions/seo-ai';

// Internal function to reuse logic
async function createPaintingInternal(formData: FormData, isBulk: boolean) {
    let title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceRaw = formData.get('price') as string;
    const widthRaw = formData.get('width') as string;
    const heightRaw = formData.get('height') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const sold = formData.get('sold') === 'on';
    let seoTitle = formData.get('seoTitle') as string;
    let seoDescription = formData.get('seoDescription') as string;
    let seoAltText = formData.get('seoAltText') as string;
    const externalLink = formData.get('externalLink') as string;

    const price = priceRaw ? parseFloat(priceRaw) : null;
    const width = widthRaw ? parseFloat(widthRaw) : null;
    const height = heightRaw ? parseFloat(heightRaw) : null;

    if (price !== null && isNaN(price)) {
        throw new Error('Invalid price');
    }

    // 1. Initial Insert (to get ID)
    const result = await db.insert(paintings).values({
        title: title, // Allow empty/null
        description,
        price,
        width,
        height,
        imageUrl,
        sold,
        seoTitle,
        seoDescription,
        seoAltText,
        externalLink,
    }).returning({ id: paintings.id });

    const newId = result[0].id;
    let updates: Partial<typeof paintings.$inferInsert> = {};
    let needsUpdate = false;

    // 2. Auto-generate Title if missing -> REMOVED per user request
    // if (!title) { ... }

    // 3. Auto-generate SEO if missing (Bulk mode or just empty)
    if (!seoTitle || !seoDescription) {
        try {
            // Basic SEO context (handle missing title in prompt)
            const promptTitle = title || "Senza Titolo";
            const seoData = await generateSeoData(`Dettaglio dell'opera "${promptTitle}". Immagine: ${imageUrl}`);
            if (seoData) {
                if (!seoTitle) {
                    updates.seoTitle = seoData.title;
                    // Don't update local var seoTitle to keep it separate from DB title
                }
                if (!seoDescription) updates.seoDescription = seoData.description;
                if (!seoAltText && seoData.seoAltText) updates.seoAltText = seoData.seoAltText;
                needsUpdate = true;
            }
        } catch (e) {
            console.warn(`Failed to auto-generate SEO for painting ${newId}`, e);
        }
    }

    // Apply updates if any
    if (needsUpdate) {
        await db.update(paintings).set(updates).where(eq(paintings.id, newId));
    }

    // Revalidation
    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidateTag('paintings', 'max');
    revalidatePath('/sitemap.xml');

    return { id: newId, title };
}

export async function createPainting(formData: FormData) {
    const result = await createPaintingInternal(formData, false);
    return { success: true, ...result };
}

export async function createPaintingBulk(formData: FormData) {
    const result = await createPaintingInternal(formData, true);
    return { success: true, id: result.id, title: result.title };
}

export async function updatePainting(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceRaw = formData.get('price') as string;
    const widthRaw = formData.get('width') as string;
    const heightRaw = formData.get('height') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const sold = formData.get('sold') === 'on';
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const seoAltText = formData.get('seoAltText') as string;
    const externalLink = formData.get('externalLink') as string;

    const price = priceRaw ? parseFloat(priceRaw) : null;
    const width = widthRaw ? parseFloat(widthRaw) : null;
    const height = heightRaw ? parseFloat(heightRaw) : null;

    if (price !== null && isNaN(price)) {
        throw new Error('Invalid price');
    }

    // Check for image change to delete old file
    const existing = await db.select().from(paintings).where(eq(paintings.id, id)).limit(1);
    if (existing && existing.length > 0) {
        const oldImageUrl = existing[0].imageUrl;
        if (oldImageUrl !== imageUrl && oldImageUrl) {
            // Try to delete old file
            try {
                // Remove leading slash if present for path joining
                const relativePath = oldImageUrl.startsWith('/') ? oldImageUrl.slice(1) : oldImageUrl;
                const fullPath = path.join(process.cwd(), 'public', relativePath);
                await fs.unlink(fullPath);
            } catch {
                // Ignore error if file doesn't exist
                // console.error('Failed to delete old image');
            }
        }
    }

    await db.update(paintings)
        .set({
            title,
            description,
            price,
            width,
            height,
            imageUrl,
            sold,
            seoTitle,
            seoDescription,
            seoAltText,
            externalLink,
        })
        .where(eq(paintings.id, id));

    // await updateMetadataFile(); removed

    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidatePath(`/opera/${id}`, 'page');
    revalidateTag('paintings', 'max');
    revalidatePath('/sitemap.xml');

    return { success: true, message: 'Quadro aggiornato con successo!' };
}
export async function deleteAllPaintings() {
    // 1. Get all images to delete files
    const allPaintings = await db.select().from(paintings);

    for (const painting of allPaintings) {
        if (painting.imageUrl) {
            try {
                const relativePath = painting.imageUrl.startsWith('/') ? painting.imageUrl.slice(1) : painting.imageUrl;
                const fullPath = path.join(process.cwd(), 'public', relativePath);
                await fs.unlink(fullPath);
            } catch {
                // Ignore individual file deletion errors
            }
        }
    }

    // 2. Delete all records
    await db.delete(paintings);

    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidateTag('paintings', 'max');
    revalidatePath('/sitemap.xml');

    return { success: true };
}
export async function deletePainting(formData: FormData) {
    const id = parseInt(formData.get('id') as string);

    // Delete image file
    const existing = await db.select().from(paintings).where(eq(paintings.id, id)).limit(1);
    if (existing && existing.length > 0) {
        const imageUrl = existing[0].imageUrl;
        if (imageUrl) {
            try {
                const relativePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
                const fullPath = path.join(process.cwd(), 'public', relativePath);
                await fs.unlink(fullPath);
            } catch {
                return { error: 'Failed to delete painting' };
            }
        }
    }

    await db.delete(paintings).where(eq(paintings.id, id));

    // await updateMetadataFile(); removed

    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidatePath(`/opera/${id}`, 'page');
    revalidateTag('paintings', 'max');
    revalidatePath('/sitemap.xml');
}

export async function toggleSold(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const currentStatus = formData.get('currentStatus') === 'true';

    await db.update(paintings)
        .set({ sold: !currentStatus })
        .where(eq(paintings.id, id));

    // await updateMetadataFile(); removed

    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidatePath(`/opera/${id}`, 'page');
    revalidateTag('paintings', 'max');
    revalidatePath('/sitemap.xml');
}
