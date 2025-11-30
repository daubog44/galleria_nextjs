import { db } from './index';
import { paintings, biography, reviews, users, settings } from './schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { hash } from 'bcryptjs';

dotenv.config({ path: '.env' });

const PATH = path.resolve(__dirname, '../../public');
const PUBLIC_PAINTINGS_PATH = path.resolve(__dirname, '../../public/paintings');

async function main() {
    console.log('Seeding database...');

    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(paintings);
    await db.delete(biography);
    await db.delete(reviews);
    await db.delete(users);

    // Reset sequences (optional but good for clean slate)
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

    // 1. Migrate Paintings
    const metadataPath = path.join(PATH, 'paintings/metadata.json');
    if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

        // Ensure public/paintings exists
        if (!fs.existsSync(PUBLIC_PAINTINGS_PATH)) {
            fs.mkdirSync(PUBLIC_PAINTINGS_PATH, { recursive: true });
        }

        // Get all files in legacy/paintings
        if (fs.existsSync(path.join(PATH, 'paintings'))) {
            const files = fs.readdirSync(path.join(PATH, 'paintings'));

            for (const file of files) {
                if (file === 'metadata.json' || file === 'autore_foto.jpg') continue;

                // Copy image
                const src = path.join(PATH, 'paintings', file);
                const dest = path.join(PUBLIC_PAINTINGS_PATH, file);
                fs.copyFileSync(src, dest);

                // Find metadata
                let meta: { nome: string; storia: string; prezzo: number | string; venduto: boolean } | undefined = metadata.find((m: { file: string }) => m.file === file);

                if (!meta) {
                    if (file.includes('quadro_astratto_1') || file.startsWith('1')) {
                        meta = {
                            nome: "Caos Calmo",
                            storia: "Quest'opera rappresenta la tranquillità che si può trovare anche nei momenti più turbolenti della vita. I colori vibranti si fondono con linee morbide per creare un senso di movimento statico.",
                            prezzo: 800,
                            venduto: false
                        };
                    } else if (file.includes('ritratto_donna') || file.startsWith('2')) {
                        meta = {
                            nome: "Sguardo",
                            storia: "Un ritratto che cattura l'essenza di un'emozione fugace. Gli occhi del soggetto sembrano seguire l'osservatore, creando un legame silenzioso ma profondo.",
                            prezzo: 1200,
                            venduto: true
                        };
                    } else if (file.includes('paesaggio_toscano')) {
                        meta = {
                            nome: "Paesaggio Toscano",
                            storia: "Una reinterpretazione moderna delle classiche colline toscane, dove la luce gioca un ruolo fondamentale nel definire i volumi e le profondità.",
                            prezzo: 950,
                            venduto: false
                        };
                    } else {
                        meta = {
                            nome: `Opera Senza Titolo ${file.split('.')[0]}`,
                            storia: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                            prezzo: Math.floor(Math.random() * 2000) + 500,
                            venduto: Math.random() > 0.8
                        };
                    }
                }

                let priceValue: number | string | null | undefined = meta?.prezzo;
                if (typeof priceValue === 'string') {
                    const numericString = priceValue.replace(/[^0-9.]/g, '');
                    priceValue = numericString ? parseFloat(numericString) : null;
                }

                await db.insert(paintings).values({
                    title: meta?.nome || null,
                    description: meta?.storia || null,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    price: (priceValue || null) as any,
                    sold: meta?.venduto || false,
                    imageUrl: `/paintings/${file}`,
                    width: Math.floor(Math.random() * (200 - 20 + 1)) + 20,
                    height: Math.floor(Math.random() * (200 - 20 + 1)) + 20,
                });
            }
            console.log('Paintings migrated.');
        }
    }

    // Copy Author Photo
    const authorPhotoSrc = path.join(PATH, 'paintings/autore_foto.jpg');
    const authorPhotoDest = path.join(PUBLIC_PAINTINGS_PATH, 'autore_foto.jpg');
    if (fs.existsSync(authorPhotoSrc)) {
        fs.copyFileSync(authorPhotoSrc, authorPhotoDest);
    }

    // 2. Seed Biography
    console.log('Seeding biography...');
    await db.insert(biography).values({
        content: `Gianmario Ferrari (Gianmi) nasce nel 1956 nella calda pianura Lombarda a Borghetto Lodigiano dove risiede, autodidatta, interpreta molti percorsi pittorici. Frequenta interessanti rassegne d'arte, concorsi e mostre tenendosi in disparte da ogni movimento e corrente. Consapevole del proprio tempo, istintivo e tenace, ermetico come la sua pittura.`
    });
    console.log('Biography seeded.');

    // 3. Seed Reviews
    console.log("Seeding reviews...");
    await db.delete(reviews);
    await db.insert(reviews).values([
        {
            title: "Un talento emergente",
            author: "Marco Rossi",
            content: "Le opere di Gianmi Ferrari colpiscono per la loro profondità emotiva e l'uso sapiente del colore. Un artista da tenere d'occhio.",
            source: "Art Review Italy",
            date: "2023-10-15",
            type: "article"
        },
        {
            title: "La mostra 'Echi del Silenzio'",
            author: "Giulia Bianchi",
            content: "Una collezione che parla direttamente all'anima. Ogni tela è un viaggio interiore.",
            source: "Cultura Oggi",
            date: "2023-11-02",
            type: "review"
        },
        {
            title: "Semplicemente magnifico",
            author: "Luca Verdi",
            content: "Ho acquistato 'Tramonto Urbano' e ne sono innamorato. Dal vivo è ancora più bello.",
            source: "Acquirente Verificato",
            date: "2023-12-10",
            type: "review"
        }
    ]);
    console.log("Reviews seeded.");

    console.log("Seeding settings...");
    await db.delete(settings);
    await db.insert(settings).values({
        // email: "info@gianmiarte.it", // Removed as requested
        // phone: "+39 345 889 6961", // Removed as requested
        // whatsapp: "https://wa.me/393458896961", // Removed as requested
        // instagram: "https://www.instagram.com/gianmi.ferrari.arte?igsh=eDJ3dWxpN3ZxMWgw", // Removed as requested
        // facebook: "https://www.facebook.com/share/1K38TuWBUf/?mibextid=wwXIfr", // Removed as requested
    });
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
