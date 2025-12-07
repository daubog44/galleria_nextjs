import { promises as fs } from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SITEDATA_DIR = path.join(PUBLIC_DIR, 'sitedata');
const BIOGRAPHY_PATH = path.join(SITEDATA_DIR, 'biography.md');

export async function getBiographyContent(): Promise<string> {
    try {
        await fs.access(BIOGRAPHY_PATH);
        return await fs.readFile(BIOGRAPHY_PATH, 'utf-8');
    } catch {
        return '';
    }
}

export async function saveBiographyContent(content: string): Promise<void> {
    try {
        await fs.mkdir(SITEDATA_DIR, { recursive: true });
        await fs.writeFile(BIOGRAPHY_PATH, content, 'utf-8');
    } catch (error) {
        console.error('Error saving biography:', error);
        throw new Error('Failed to save biography file');
    }
}

export async function listPaintingFiles(): Promise<string[]> {
    const dir = path.join(SITEDATA_DIR, 'paintings');
    try {
        await fs.access(dir);
        const files = await fs.readdir(dir);
        return files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).map(f => `/sitedata/paintings/${f}`);
    } catch {
        return [];
    }
}

export async function listReviewFiles(): Promise<string[]> {
    const dir = path.join(SITEDATA_DIR, 'reviews');
    try {
        await fs.access(dir);
        const files = await fs.readdir(dir);
        return files.filter(f => /\.md$/i.test(f)).map(f => `/sitedata/reviews/${f}`);
    } catch {
        return [];
    }
}
