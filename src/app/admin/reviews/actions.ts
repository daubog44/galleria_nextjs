
'use server';

import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createReview(formData: FormData) {
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const content = formData.get('content') as string;
    const source = formData.get('source') as string;
    const date = formData.get('date') as string;
    const type = formData.get('type') as string;

    await db.insert(reviews).values({
        title,
        author,
        content,
        source,
        date,
        type,
    });

    revalidateTag('style', 'max');
    revalidatePath('/admin/reviews');
    redirect('/admin/reviews');
}

export async function updateReview(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const content = formData.get('content') as string;
    const source = formData.get('source') as string;
    const date = formData.get('date') as string;
    const type = formData.get('type') as string;

    await db.update(reviews)
        .set({
            title,
            author,
            content,
            source,
            date,
            type,
        })
        .where(eq(reviews.id, id));

    revalidateTag('style', 'max');
    revalidatePath('/admin/reviews');
    redirect('/admin/reviews');
}

export async function deleteReview(formData: FormData) {
    const id = parseInt(formData.get('id') as string);

    await db.delete(reviews).where(eq(reviews.id, id));

    revalidateTag('style', 'max');
    revalidatePath('/admin/reviews');
}
