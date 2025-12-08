'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db';
import { biography } from '@/db/schema';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || '');

async function getBiographyContext() {
    try {
        const bio = await db.select().from(biography).limit(1);
        if (bio && bio.length > 0) {
            return `INFO ARITSTA (Biografa): ${bio[0].content.substring(0, 5000)}`; // Limit context size
        }
        return '';
    } catch (e) {
        console.warn('Failed to fetch biography for AI context', e);
        return '';
    }
}

export async function generatePaintingMetadata(imageUrl: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const bioContext = await getBiographyContext();

        const prompt = `Sei un esperto curatore d'arte. Analizza questa immagine di un quadro.
        ${bioContext}
        
        Compito:
        1. Genera un TITOLO evocativo e appropriato allo stile.
        2. Genera una DESCRIZIONE tecnica ed emotiva (max 300 caratteri).
        3. Stima in modo AUTENTICO e REALISTICO il PREZZO in Euro (basandoti sullo stile e complessità, o inventa un valore credibile per un artista emergente/afferamato come da bio).
        4. Stima le DIMENSIONI (Larghezza x Altezza in cm) se possibile dedurle, altrimenti ipotizza valori standard per quadri (es. 50x70, 80x100, 100x120).
        5. Genera SEO metadata.

        Restituisci SOLO un JSON:
        {
            "title": "Titolo",
            "description": "Descrizione...",
            "price": 1200, // numero puro
            "width": 80, // numero in cm
            "height": 100, // numero in cm
            "seoTitle": "Titolo SEO",
            "seoDescription": "Descrizione SEO",
            "seoAltText": "Alt text dettagliato"
        }`;

        let result;
        // Handle Image
        if (imageUrl.startsWith('data:image')) {
            const base64Data = imageUrl.split(',')[1];
            const mimeType = imageUrl.split(';')[0].split(':')[1];

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            };
            result = await model.generateContent([prompt, imagePart]);
        } else if (imageUrl.startsWith('http')) {
            const imageResp = await fetch(imageUrl);
            if (!imageResp.ok) throw new Error('Failed to fetch image');
            const imageBuffer = await imageResp.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const imagePart = {
                inlineData: {
                    data: base64Image,
                    mimeType: imageResp.headers.get('content-type') || 'image/jpeg',
                },
            };
            result = await model.generateContent([prompt, imagePart]);
        } else {
            // No image logic? Paintings need image.
            throw new Error("Image required for painting analysis");
        }

        const response = result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Error generating painting metadata:', error);
        throw new Error('Generazione fallita');
    }
}

interface ReviewData {
    title?: string;
    author?: string;
    date?: string;
    content: string;
}

export async function generateReviewSeo(data: ReviewData) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const bioContext = await getBiographyContext();

        const prompt = `Sei un esperto SEO per siti d'arte.
        ${bioContext}

        Analizza questa recensione/articolo:
        TITOLO: ${data.title || 'N/A'}
        AUTORE: ${data.author || 'N/A'}
        DATA: ${data.date || 'N/A'}
        CONTENUTO: ${data.content.substring(0, 5000)}

        Genera metadati SEO ottimizzati.
        Restituisci SOLO un JSON:
        {
            "seoTitle": "Titolo SEO (max 60 char)",
            "seoDescription": "Meta Description (max 160 char)",
            "seoAltText": "Alt text suggerito per eventuale immagine allegata (basato sul contenuto)"
        }`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Error generating review SEO:', error);
        throw new Error('Generazione SEO fallita');
    }
}
