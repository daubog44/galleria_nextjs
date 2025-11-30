'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || '');

export async function generateSeoData(context: string, imageUrl?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        let prompt = `Genera metadati SEO per una pagina web di un sito di un artista (pittura o biografia).
    Contesto: ${context}
    Restituisci un oggetto JSON con le seguenti chiavi:
    - title: Un titolo SEO accattivante (max 60 caratteri).
    - description: Una meta descrizione concisa (max 160 caratteri).
    - altText: Un testo alternativo descrittivo per l'immagine (se applicabile).
    
    Assicurati che il tono sia professionale, artistico e coinvolgente.
    RESTITUISCI SOLO JSON.`;

        let result;
        if (imageUrl) {
            try {
                // Check if imageUrl is a relative path (starts with /)
                let fetchUrl = imageUrl;
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
