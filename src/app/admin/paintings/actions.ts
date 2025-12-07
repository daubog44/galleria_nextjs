
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

export async function createPainting(formData: FormData) {
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

    await db.insert(paintings).values({
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
    });

    // await updateMetadataFile(); removed

    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidateTag('paintings', 'max');
    redirect('/admin/paintings');
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

    return { success: true, message: 'Quadro aggiornato con successo!' };
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
}
