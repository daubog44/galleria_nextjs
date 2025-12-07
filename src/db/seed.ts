import { db } from './index';
import { paintings, biography, reviews, users, settings, externalLinks, seoMetadata } from './schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { hash } from 'bcryptjs';

dotenv.config({ path: '.env' });

const PUBLIC_PATH = path.resolve(__dirname, '../../public');
// METADATA_PATH removed

async function main() {
    console.log('Seeding database...');

    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(paintings);
    await db.delete(biography);
    await db.delete(reviews);
    await db.delete(users);
    await db.delete(settings);
    await db.delete(externalLinks);
    await db.delete(seoMetadata);

    // Reset sequences
    await db.execute(sql`ALTER SEQUENCE paintings_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE biography_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE reviews_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);

    console.log('Data cleared and IDs reset.');

    // Seed Admin User
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await hash(adminPassword, 10);

    await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
    }).onConflictDoNothing();
    console.log('Admin user seeded');

    // 1. Seed Paintings
    const initialPaintings = [
        {
            title: "Tramonto Urbano",
            description: "Un'esplosione di colori che cattura l'essenza della città al crepuscolo.",
            price: 1200,
            sold: false,
            imageUrl: "/sitedata/paintings/tramonto_urbano.jpg",
            width: 80,
            height: 60,
            externalLink: null
        },
        {
            title: "Riflessi d'Autunno",
            description: "La quiete del lago specchia i colori caldi dell'ottobre.",
            price: 950,
            sold: true,
            imageUrl: "/sitedata/paintings/riflessi_autunno.jpg",
            width: 70,
            height: 50,
            externalLink: null
        }
    ];

    for (const p of initialPaintings) {
        await db.insert(paintings).values({
            title: p.title,
            description: p.description,
            price: p.price,
            sold: p.sold,
            imageUrl: p.imageUrl,
            width: p.width,
            height: p.height,
            externalLink: p.externalLink,
        });
    }
    console.log('Paintings seeded.');

    // 2. Seed Biography
    await db.insert(biography).values({
        content: `Gianmario Ferrari (Gianmi) nasce nel 1956 nella calda pianura Lombarda a Borghetto Lodigiano dove risiede, autodidatta, interpreta molti percorsi pittorici. Frequenta interessanti rassegne d'arte, concorsi e mostre tenendosi in disparte da ogni movimento e corrente. Consapevole del proprio tempo, istintivo e tenace, ermetico come la sua pittura.`,
        imageUrl: '/sitedata/autore_foto.jpg',
    });
    console.log('Biography seeded.');

    // 3. Seed Reviews (Posts)
    const fallbackReviews = [
        {
            title: "Un talento emergente",
            author: "Marco Rossi",
            content: "Le opere di Gianmi Ferrari colpiscono per la loro profondità emotiva e l'uso sapiente del colore. Un artista da tenere d'occhio.",
            source: "Art Review Italy",
            date: "2023-10-15",
            type: "article",
            slug: "un-talento-emergente"
        },
        {
            title: "La mostra 'Echi del Silenzio'",
            author: "Giulia Bianchi",
            content: "Una collezione che parla direttamente all'anima. Ogni tela è un viaggio interiore.",
            source: "Cultura Oggi",
            date: "2023-11-02",
            type: "review",
            slug: "la-mostra-echi-del-silenzio"
        },
        {
            title: "Semplicemente magnifico",
            author: "Luca Verdi",
            content: "Ho acquistato 'Tramonto Urbano' e ne sono innamorato. Dal vivo è ancora più bello.",
            source: "Acquirente Verificato",
            date: "2023-12-10",
            type: "review",
            slug: "semplicemente-magnifico"
        }
    ];

    for (const r of fallbackReviews) {
        const fileName = `${r.slug}.md`;
        const filePath = `/sitedata/reviews/${fileName}`;
        const fullPath = path.join(PUBLIC_PATH, 'sitedata/reviews', fileName);

        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, r.content, 'utf-8');

        await db.insert(reviews).values({
            ...r,
            filePath,
            imageUrl: null
        });
    }
    console.log("Reviews seeded.");

    // 4. Seed SEO Metadata
    // Default SEO data
    console.log("SEO metadata skipped (configured in admin).");

    // Seed Settings
    await db.insert(settings).values({});
    console.log("Settings seeded.");

    console.log("Seeding complete.");
    process.exit(0);
}

const MAX_RETRIES = 10;
const RETRY_DELAY = 3000;

async function run() {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await main();
            return;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`Attempt ${i + 1}/${MAX_RETRIES} failed:`, errorMessage);
            if (err instanceof Error && 'cause' in err) console.error('Cause:', (err as { cause: unknown }).cause);

            if (i === MAX_RETRIES - 1) {
                console.error('Max retries reached. Exiting.');
                throw err;
            }

            console.log(`Retrying in ${RETRY_DELAY / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
