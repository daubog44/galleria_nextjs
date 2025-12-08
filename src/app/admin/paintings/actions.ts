
'use server';

import { db } from '@/db';
import { paintings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
// import { updateMetadataFile } from '@/lib/metadata-utils'; removed
import { promises as fs } from 'fs';
import path from 'path';

// Search for uploadImageAction usage
// function uploadImageAction removed

import { generatePaintingMetadata } from '@/app/admin/actions/seo-ai';

// Helper to slugify text
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await db.select({ id: paintings.id }).from(paintings).where(eq(paintings.slug, slug)).limit(1);
        if (existing.length === 0) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

// Internal function to reuse logic
async function createPaintingInternal(formData: FormData, isBulk: boolean) {
    let title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceRaw = formData.get('price') as string;
    const widthRaw = formData.get('width') as string;
    const heightRaw = formData.get('height') as string;
    // Image handling
    const file = formData.get('image') as File; // New direct file input
    // If no direct file, check for legacy imageUrl (from bulk or manual string)
    let imageUrl = formData.get('imageUrl') as string;

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

    let slug = '';
    let finalImageUrl = imageUrl;

    // 1. Process Image & Generate Slug/AI Data
    if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';

        // Call AI
        let aiData;
        try {
            aiData = await generatePaintingMetadata(base64, mimeType);
        } catch (e) {
            console.warn('AI generation failed, falling back to basic data', e);
            aiData = { title: 'opera-' + Date.now() };
        }

        // Determine Slug Base
        // If user provided a title, use it. If not, use AI title.
        const slugBase = title ? title : (aiData.title || `opera-${Date.now()}`);
        slug = slugify(slugBase);
        slug = await ensureUniqueSlug(slug);

        // Save File with new Slug name
        const filename = `${slug}.jpg`; // Normalize to jpg or keep original extension? Let's use jpg/original
        // Actually, let's keep original extension or convert. 
        // For simplicity, let's just use the extension from original file or default to jpg
        const ext = path.extname(file.name) || '.jpg';
        const finalFilename = `${slug}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public/sitedata/paintings');
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }
        await fs.writeFile(path.join(uploadDir, finalFilename), buffer);
        finalImageUrl = `/sitedata/paintings/${finalFilename}`;

        // Populate missing SEO data from AI
        if (!seoTitle && aiData.seoTitle) seoTitle = aiData.seoTitle;
        if (!seoDescription && aiData.seoDescription) seoDescription = aiData.seoDescription;
        if (!seoAltText && aiData.seoAltText) seoAltText = aiData.seoAltText;

        // Note: We DO NOT set 'title' variable here if it was empty, 
        // because the user wants to populate the slug but possibly keep displayed title empty.
        // UNLESS the user prompt "non il titolo che deve essere vuoto" meant something else.
        // Assuming strict "keep title empty if not provided".
    } else if (imageUrl) {
        // Legacy/Direct URL case OR Bulk Upload
        // In bulk upload, the file is already uploaded, and we have the path.
        // We SHOULD try to generate AI metadata for it too if title/seo are missing.

        // Only run AI if we are missing title or SEO data (which is true for bulk)
        if (!title || !seoTitle) {
            try {
                // 1. Resolve file path
                const relativePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
                const fullPath = path.join(process.cwd(), 'public', relativePath);

                // 2. Read file
                const buffer = await fs.readFile(fullPath);
                const base64 = buffer.toString('base64');
                // Guess mime type from extension
                const ext = path.extname(fullPath).toLowerCase();
                const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

                // 3. Call AI
                let aiData;
                try {
                    aiData = await generatePaintingMetadata(base64, mimeType);
                } catch (e) {
                    console.warn('AI generation failed for existing image, falling back', e);
                    aiData = { title: 'opera-' + Date.now() };
                }

                // 4. Update data if missing
                // Notes: 
                // - We still respect the "keep title empty" rule unless we want to populate slug base.
                // - We definitely want to populate SEO fields.

                if (!seoTitle && aiData.seoTitle) seoTitle = aiData.seoTitle;
                if (!seoDescription && aiData.seoDescription) seoDescription = aiData.seoDescription;
                if (!seoAltText && aiData.seoAltText) seoAltText = aiData.seoAltText;

                // Update Slug based on AI title
                if (aiData.title) {
                    const slugBase = aiData.title;
                    slug = slugify(slugBase);
                    slug = await ensureUniqueSlug(slug);
                }

            } catch (error) {
                console.warn('Failed to process existing image for AI:', error);
            }
        }
    }

    // 2. Ensure Slug Existence (Fallback for direct URL or missing title)
    if (!slug) {
        // If title exists, use it. Otherwise use generic name with timestamp and random suffix to avoid bulk collisions
        const slugBase = title ? title : `opera-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        slug = slugify(slugBase);
        slug = await ensureUniqueSlug(slug);
    }

    // 3. Initial Insert
    const result = await db.insert(paintings).values({
        title: title || null, // Ensure empty string becomes null
        description,
        price,
        width,
        height,
        imageUrl: finalImageUrl,
        sold,
        seoTitle,
        seoDescription,
        seoAltText,
        externalLink,
        slug,
    }).returning({ id: paintings.id });

    const newId = result[0].id;

    // Revalidation
    revalidatePath('/', 'page');
    revalidatePath('/admin/paintings', 'page');
    revalidateTag('paintings', 'max');
    revalidatePath('/sitemap.xml');

    return { id: newId, title, slug };
}

export async function createPainting(formData: FormData) {
    const result = await createPaintingInternal(formData, false);
    return { success: true, ...result };
}

export async function createPaintingBulk(formData: FormData) {
    // Bulk needs to handle multiple files. 
    // Usually bulk uploads call this action once per file or pass a list.
    // If this function receives a single formData with one file, it works same as single.
    const result = await createPaintingInternal(formData, true);
    return { success: true, id: result.id, slug: result.slug };
}

export async function updatePainting(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceRaw = formData.get('price') as string;
    const widthRaw = formData.get('width') as string;
    const heightRaw = formData.get('height') as string;
    let imageUrl = formData.get('imageUrl') as string;
    const sold = formData.get('sold') === 'on';
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const seoAltText = formData.get('seoAltText') as string;
    const externalLink = formData.get('externalLink') as string;

    const file = formData.get('image') as File;

    const price = priceRaw ? parseFloat(priceRaw) : null;
    const width = widthRaw ? parseFloat(widthRaw) : null;
    const height = heightRaw ? parseFloat(heightRaw) : null;

    if (price !== null && isNaN(price)) {
        throw new Error('Invalid price');
    }

    // Check for existing painting to get current slug
    const existing = await db.select().from(paintings).where(eq(paintings.id, id)).limit(1);
    if (!existing || existing.length === 0) {
        throw new Error('Painting not found');
    }
    const currentPainting = existing[0];
    const slug = currentPainting.slug; // We generally don't change slug on update unless requested, but user wants slug-based filename.

    // Handle new file upload
    if (file && file.size > 0) {
        // 1. Process New Image
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || '.jpg';
        // Use slug for filename. If slug is missing (legacy), we should generate one, but for update let's assume slug exists or fallback.
        const safeSlug = slug || `painting-${id}`;
        const filename = `${safeSlug}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public/sitedata/paintings');

        // Ensure directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        // Delete old image if different filename (and not a pure replacement of same file)
        // If the new filename matches existing URL, `writeFile` overwrites, which is what we want.
        // If existing URL was something else (e.g. '90.jpg'), we should delete it.
        const oldImageUrl = currentPainting.imageUrl;
        if (oldImageUrl && !oldImageUrl.endsWith(filename)) {
            try {
                const relativePath = oldImageUrl.startsWith('/') ? oldImageUrl.slice(1) : oldImageUrl;
                const fullPath = path.join(process.cwd(), 'public', relativePath);
                await fs.unlink(fullPath);
            } catch {
                // Ignore error if file doesn't exist
            }
        }

        await fs.writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = `/sitedata/paintings/${filename}`;
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
