
'use server';

import { db } from '@/db';
import { paintings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

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
    });

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

    const price = priceRaw ? parseFloat(priceRaw) : null;
    const width = widthRaw ? parseFloat(widthRaw) : null;
    const height = heightRaw ? parseFloat(heightRaw) : null;

    if (price !== null && isNaN(price)) {
        throw new Error('Invalid price');
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
        })
        .where(eq(paintings.id, id));

    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidatePath(`/opera/${id}`, 'page');
    revalidateTag('paintings', 'max');
    redirect('/admin/paintings');
}

export async function deletePainting(formData: FormData) {
    const id = parseInt(formData.get('id') as string);

    await db.delete(paintings).where(eq(paintings.id, id));

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

    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidatePath(`/opera/${id}`, 'page');
    revalidateTag('paintings', 'max');
}
