
'use server';

import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';
// import { getSitedataPath } from '@/lib/metadata-utils'; removed

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function getSitedataPath(subpath: string = '') {
    return path.join(process.cwd(), 'public', 'sitedata', subpath);
}

export async function createReview(formData: FormData) {
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const content = formData.get('content') as string;
    const source = formData.get('source') as string;
    const date = formData.get('date') as string;
    const type = formData.get('type') as string;
    const imageUrl = formData.get('imageUrl') as string;

    const slug = slugify(title);
    const fileName = `${slug}.md`;
    const filePath = `/sitedata/reviews/${fileName}`;
    const fullPath = getSitedataPath(`reviews/${fileName}`);

    // Ensure reviews directory exists
    const reviewsDir = getSitedataPath('reviews');
    try {
        await fs.access(reviewsDir);
    } catch {
        await fs.mkdir(reviewsDir, { recursive: true });
    }

    // Write Markdown File
    await fs.writeFile(fullPath, content, 'utf-8');

    await db.insert(reviews).values({
        title,
        author,
        content, // We still keep content in DB for search/easy access, or could just keep snippet
        source,
        date,
        type,
        imageUrl,
        filePath,
        slug,
        seoTitle: formData.get('seoTitle') as string,
        seoDescription: formData.get('seoDescription') as string,
        seoAltText: formData.get('seoAltText') as string,
    });

    // await updateMetadataFile(); removed

    revalidateTag('style', "max");
    revalidatePath('/admin/reviews');
    revalidatePath('/stile');
    revalidatePath('/sitemap.xml');

    return { success: true, message: 'Recensione creata con successo' };
}

export async function updateReview(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const content = formData.get('content') as string;
    const source = formData.get('source') as string;
    const date = formData.get('date') as string;
    const type = formData.get('type') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Get existing review to find old file
    const existing = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    if (!existing || existing.length === 0) {
        throw new Error('Review not found');
    }

    const oldSlug = existing[0].slug;
    const newSlug = slugify(title);

    let filePath = existing[0].filePath;

    // If title changed, we might want to rename file, but for simplicity let's keep old filename OR rename it.
    // Let's rename for consistency if slug changes.
    if (oldSlug !== newSlug && oldSlug) {
        const oldPath = getSitedataPath(`reviews/${oldSlug}.md`);
        const newPath = getSitedataPath(`reviews/${newSlug}.md`);
        try {
            await fs.rename(oldPath, newPath);
        } catch {
            // If rename fails (e.g. old file missing), just ignore
        }
        filePath = `/sitedata/reviews/${newSlug}.md`;
    } else if (!filePath) {
        // If no file existed before
        filePath = `/sitedata/reviews/${newSlug}.md`;
    }

    const fullPath = path.join(process.cwd(), 'public', filePath);

    // Ensure directory exists (just in case)
    const dir = path.dirname(fullPath);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(fullPath, content, 'utf-8');

    await db.update(reviews)
        .set({
            title,
            author,
            content,
            source,
            date,
            type,
            imageUrl,
            filePath,
            slug: newSlug,
            seoTitle: formData.get('seoTitle') as string,
            seoDescription: formData.get('seoDescription') as string,
            seoAltText: formData.get('seoAltText') as string,
        })
        .where(eq(reviews.id, id));

    // await updateMetadataFile(); removed

    revalidateTag('style', "max");
    revalidatePath('/admin/reviews');
    revalidatePath('/stile');
    revalidatePath('/sitemap.xml');

    return { success: true, message: 'Recensione aggiornata con successo' };
}

export async function deleteReview(formData: FormData) {
    const id = parseInt(formData.get('id') as string);

    const existing = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    if (existing && existing.length > 0 && existing[0].filePath) {
        const fullPath = path.join(process.cwd(), 'public', existing[0].filePath);
        try {
            await fs.unlink(fullPath);
        } catch {
            return { error: 'Errore durante l\'eliminazione della recensione' };
        }
    }

    await db.delete(reviews).where(eq(reviews.id, id));
    // await updateMetadataFile(); removed

    revalidateTag('style', "max");
    revalidatePath('/admin/reviews');
    revalidatePath('/stile');
    revalidatePath('/sitemap.xml');
}
