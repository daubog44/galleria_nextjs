'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db';
import { biography } from '@/db/schema';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || '');

async function getBiographyContext() {
    try {
        const bio = await db.select().from(biography).limit(1);
        if (bio && bio.length > 0) {
            return `INFO ARITSTA (Biografia): ${bio[0].content.substring(0, 5000)}`;
        }
        return '';
    } catch (e) {
        console.warn('Failed to fetch biography for AI context', e);
        return '';
    }
}

export async function generateSeoData(context: string, imageUrl?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const bioContext = await getBiographyContext();

        const prompt = `Sei un esperto SEO. Genera titolo e meta description per questa pagina del sito di un artista.
    
    ${bioContext}

    Contesto pagina:
    ${context}
    
    Restituisci SOLO un oggetto JSON con questo formato:
    {
        "title": "Titolo ottimizzato (max 60 caratteri)",
        "description": "Meta description ottimizzata (max 160 caratteri)"
    }`;

        let result;
        if (imageUrl) {
            try {
                // Check if imageUrl is a relative path (starts with /)
                const fetchUrl = imageUrl;
                if (imageUrl.startsWith('/')) {
                    // Assuming localhost for relative paths during dev/build, but in production this might be tricky if not fully qualified.
                    // Ideally we use the full URL.
                    // If it's a relative path, we might need to construct the full URL or read from filesystem if it's a local file.
                    // But for now, let's assume it's a full URL or accessible.
                    // If it's just a filename in 'public', we can't easily fetch it via HTTP inside server action without full URL.
                    // Let's try to handle it if it's a full URL.
                    if (!imageUrl.startsWith('http')) {
                        // If it's not http, maybe skip image analysis or try to resolve it?
                        // For now, let's just use text if URL is invalid for fetch.
                        console.warn('Image URL is relative, skipping image analysis for now:', imageUrl);
                        result = await model.generateContent(prompt);
                    } else {
                        const imageResp = await fetch(fetchUrl);
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
                    }
                } else {
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
                }
            } catch (err) {
                console.warn('Failed to process image for SEO generation, falling back to text only:', err);
                result = await model.generateContent(prompt);
            }
        } else {
            result = await model.generateContent(prompt);
        }

        const response = result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error generating SEO data:', error);
        throw new Error('Failed to generate SEO data');
    }
}

export async function generatePaintingMetadata(base64Image: string, mimeType: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const bioContext = await getBiographyContext();

        const prompt = `Sei un esperto curatore d'arte e SEO. Analizza questa immagine di un'opera d'arte.
        
        ${bioContext}

        Il tuo compito è:
        1. Generare un TITOLO creativo e breve per l'opera (evita "Senza titolo", inventa un nome evocativo basato sui colori e soggetti).
        2. Generare un titolo SEO ottimizzato.
        3. Generare una meta description SEO ottimizzata.
        4. Generare un Alt Text descrittivo per l'immagine.

        Restituisci SOLO un oggetto JSON con questo formato esatto:
        {
            "title": "Titolo evocativo dell'opera",
            "seoTitle": "Titolo SEO (max 60 chars)",
            "seoDescription": "Meta description (max 160 chars)",
            "seoAltText": "Descrizione visiva dettagliata per accessibilità"
        }`;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error generating painting metadata:', error);
        throw new Error('Failed to generate painting metadata');
    }
}
