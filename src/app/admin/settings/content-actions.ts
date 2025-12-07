'use server';

import { db } from '@/db';
import { paintings, biography, reviews, externalLinks, seoMetadata, settings } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import AdmZip from 'adm-zip';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { getBiographyContent, saveBiographyContent } from '@/lib/sitedata';

const SITEDATA_PATH = path.join(process.cwd(), 'public', 'sitedata');

/**
 * Export all website content (Database + Assets) as a ZIP file.
 */
export async function exportContent() {
    try {
        console.log('Starting content export...');
        const zip = new AdmZip();

        // 1. Fetch Data from Tuple
        const allPaintings = await db.select().from(paintings);
        const allBiography = await db.select().from(biography);
        const allReviews = await db.select().from(reviews);
        const allLinks = await db.select().from(externalLinks);
        const allSeo = await db.select().from(seoMetadata);
        const allSettings = await db.select().from(settings);

        // Construct Content JSON
        const content = {
            paintings: allPaintings,
            biography: allBiography,
            reviews: allReviews,
            externalLinks: allLinks,
            seoMetadata: allSeo,
            settings: allSettings,
            version: 1,
            exportedAt: new Date().toISOString(),
        };

        // Add JSON to Zip
        zip.addFile('content.json', Buffer.from(JSON.stringify(content, null, 2)));

        // 2. Add Assets (public/sitedata)
        // Check if directory exists before adding
        try {
            await fs.access(SITEDATA_PATH);
            zip.addLocalFolder(SITEDATA_PATH, 'assets');
        } catch (e) {
            console.warn('Sitedata directory not found, skipping assets export.', e);
        }

        // Generate Zip Buffer
        const buffer = zip.toBuffer();
        const base64 = buffer.toString('base64');
        const filename = `backup_galleria_${new Date().toISOString().slice(0, 10)}.zip`;

        return { success: true, data: base64, filename };
    } catch (error) {
        console.error('Export failed:', error);
        return { success: false, message: 'Errore durante l\'esportazione del contenuto.' };
    }
}

/**
 * Import content from a ZIP file, Overwriting existing data.
 */
export async function importContent(formData: FormData) {
    try {
        console.log('Starting content import...');
        const file = formData.get('file') as File;

        if (!file || !file.name.endsWith('.zip')) {
            return { success: false, message: 'Formato file non valido. Richiesto .zip' };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const zip = new AdmZip(buffer);

        // 1. Validate Zip Content
        const contentEntry = zip.getEntry('content.json');
        if (!contentEntry) {
            return { success: false, message: 'File di backup non valido: content.json mancante.' };
        }

        // 2. Parse Data
        const contentJson = zip.readAsText(contentEntry);
        const data = JSON.parse(contentJson);

        // Basic validation of data structure
        if (!data.paintings || !data.biography) {
            return { success: false, message: 'Dati del backup corrotti o incompleti.' };
        }

        // 3. Restore Database (Transaction)
        await db.transaction(async (tx) => {
            // Delete all existing data
            await tx.delete(paintings);
            await tx.delete(biography);
            await tx.delete(reviews);
            await tx.delete(externalLinks);
            await tx.delete(seoMetadata);
            await tx.delete(settings);

            // Insert Data
            if (data.paintings?.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formattedPaintings = data.paintings.map((p: any) => ({
                    ...p,
                    createdAt: p.createdAt ? new Date(p.createdAt) : undefined, // Let defaultNow handle undefined if missing, or specific Date
                }));
                await tx.insert(paintings).values(formattedPaintings);
            }
            if (data.biography?.length > 0) await tx.insert(biography).values(data.biography);
            if (data.reviews?.length > 0) await tx.insert(reviews).values(data.reviews);
            if (data.settings?.length > 0) await tx.insert(settings).values(data.settings);
            if (data.externalLinks?.length > 0) await tx.insert(externalLinks).values(data.externalLinks);
            if (data.seoMetadata?.length > 0) await tx.insert(seoMetadata).values(data.seoMetadata);

            // Reset Sequences
            await tx.execute(sql`SELECT setval(pg_get_serial_sequence('paintings', 'id'), coalesce(max(id), 1), true) FROM paintings`);
            await tx.execute(sql`SELECT setval(pg_get_serial_sequence('biography', 'id'), coalesce(max(id), 1), true) FROM biography`);
            await tx.execute(sql`SELECT setval(pg_get_serial_sequence('reviews', 'id'), coalesce(max(id), 1), true) FROM reviews`);
            await tx.execute(sql`SELECT setval(pg_get_serial_sequence('settings', 'id'), coalesce(max(id), 1), true) FROM settings`);
            await tx.execute(sql`SELECT setval(pg_get_serial_sequence('external_links', 'id'), coalesce(max(id), 1), true) FROM external_links`);
            await tx.execute(sql`SELECT setval(pg_get_serial_sequence('seo_metadata', 'id'), coalesce(max(id), 1), true) FROM seo_metadata`);
        });

        // 4. Restore Assets (Only if DB restoration succeeded)
        const entries = zip.getEntries();

        // Wipe existing assets carefully
        try {
            // Can't remove the root dir if it's a volume, so remove contents
            try {
                const files = await fs.readdir(SITEDATA_PATH);
                for (const file of files) {
                    await fs.rm(path.join(SITEDATA_PATH, file), { recursive: true, force: true });
                }
            } catch (e: unknown) {
                if ((e as { code?: string }).code === 'ENOENT') {
                    await fs.mkdir(SITEDATA_PATH, { recursive: true });
                } else {
                    throw e;
                }
            }
        } catch (e) {
            console.warn('Failed to wipe sitedata, proceeding anyway:', e);
        }
        // Ensure dir exists (redundant if mkdir above worked, but safe)
        try { await fs.mkdir(SITEDATA_PATH, { recursive: true }); } catch { }

        for (const entry of entries) {
            if (entry.entryName.startsWith('assets/') && !entry.isDirectory) {
                // Remove 'assets/' prefix
                const relativePath = entry.entryName.substring('assets/'.length);
                if (!relativePath) continue;

                const fullPath = path.join(SITEDATA_PATH, relativePath);
                const dir = path.dirname(fullPath);

                await fs.mkdir(dir, { recursive: true });
                await fs.writeFile(fullPath, entry.getData());
            }
        }

        revalidatePath('/', 'layout');
        return { success: true, message: 'Ripristino completato con successo.' };

    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, message: 'Errore critico durante l\'importazione.' };
    }
}

/**
 * Scan filesystem and populate DB for missing entries.
 */
export async function syncFromFiles() {
    try {
        console.log('Starting sync from files...');

        // 1. Paintings
        const paintingsDir = path.join(SITEDATA_PATH, 'paintings');
        try {
            const files = await fs.readdir(paintingsDir);
            for (const file of files) {
                if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

                const imageUrl = `/sitedata/paintings/${file}`;

                // Check redundancy
                const existing = await db.select().from(paintings).where(eq(paintings.imageUrl, imageUrl)).limit(1);

                if (existing.length === 0) {
                    await db.insert(paintings).values({
                        title: file.split('.')[0].replace(/[-_]/g, ' '),
                        imageUrl: imageUrl,
                        width: 0,
                        height: 0,
                        // year: new Date().getFullYear(), // Removed as not in schema
                        // technique: 'Mista', // Removed as not in schema
                        sold: false,
                        description: '',
                    });
                }
            }
        } catch (e) {
            console.warn('Paintings directory scan failed:', e);
        }

        // 2. Reviews (Markdown)
        const reviewsDir = path.join(SITEDATA_PATH, 'reviews');
        try {
            const files = await fs.readdir(reviewsDir);
            for (const file of files) {
                if (!/\.md$/i.test(file)) continue;

                const filePath = path.join(reviewsDir, file);
                const textContent = await fs.readFile(filePath, 'utf-8');

                const authorName = file.split('.')[0];
                const existing = await db.select().from(reviews).where(eq(reviews.author, authorName)).limit(1);

                if (existing.length === 0) {
                    await db.insert(reviews).values({
                        author: authorName,
                        content: textContent,
                        // stars: 5, // Not in schema
                        date: new Date().toISOString(),
                        source: 'File Import',
                        title: authorName,
                        type: 'review'
                    });
                }
            }
        } catch (e) {
            console.warn('Reviews directory scan failed:', e);
        }

        // 3. Biography
        const bioContent = await getBiographyContent();
        if (!bioContent) {
            const dbBio = await db.select().from(biography).limit(1);
            if (dbBio.length > 0 && dbBio[0].content) {
                await saveBiographyContent(dbBio[0].content);
            } else {
                await saveBiographyContent("# Biografia\n\nScrivi qui la tua storia...");
            }
        }

        revalidatePath('/', 'layout');
        return { success: true, message: 'Sincronizzazione completata.' };
    } catch (error) {
        console.error('Sync failed:', error);
        return { success: false, message: 'Errore durante la sincronizzazione.' };
    }
}
