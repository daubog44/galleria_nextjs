'use client';

import { createPainting, uploadImageAction } from '../actions';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { generatePaintingMetadata } from '@/app/admin/actions/generative-ai';
import { SeoFields } from '@/components/admin/SeoFields';
import { useRouter } from 'next/navigation';

export default function NewPaintingPage() {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [contextDescription, setContextDescription] = useState('');

    // Refs to programmatically set values
    const titleRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const priceRef = useRef<HTMLInputElement>(null);
    const widthRef = useRef<HTMLInputElement>(null);
    const heightRef = useRef<HTMLInputElement>(null);
    const seoTitleRef = useRef<HTMLInputElement>(null); // Though SeoFields might not expose ref directly, we can target by name or controlled state. 
    // SeoFields manages its own state usually or controlled. Let's see how I implemented it in EditForm.
    // In EditForm I used document.getElementsByName because SeoFields is a controlled component wrapper.
    // Here, I will try to use the same approach or better yet, treat it as uncontrolled for initial fill? 
    // SeoFields accepts `initialTitle` etc. but those are props.
    // To update them dynamically, I might need to lift state for SeoFields.
    // OR just stick to DOM manipulation for the inputs rendered by SeoFields if they have standard names.
    // Let's stick to DOM manipulation for consistency with EditForm until a refactor.

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        } else {
            setPreview(null);
        }
    }

    async function handleAiAutofill() {
        const fileInput = document.getElementById('image') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file && !preview) {
            toast.error("Seleziona prima un'immagine!");
            return;
        }

        setGenerating(true);

        let imageToAnalyze = preview;

        // If we have a file, convert to base64 for the server action
        if (file) {
            try {
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                imageToAnalyze = base64;
            } catch (e) {
                console.error("Error reading file", e);
                toast.error("Errore nella lettura del file");
                setGenerating(false);
                return;
            }
        }

        if (!imageToAnalyze) {
            setGenerating(false);
            return;
        }

        const promise = generatePaintingMetadata(imageToAnalyze);

        toast.promise(promise, {
            loading: 'Analisi immagine e biografia...',
            success: (data) => {
                if (titleRef.current) titleRef.current.value = data.title || '';
                if (descRef.current) {
                    descRef.current.value = data.description || '';
                    setContextDescription(data.description || '');
                }
                if (priceRef.current && data.price) priceRef.current.value = String(data.price);
                if (widthRef.current && data.width) widthRef.current.value = String(data.width);
                if (heightRef.current && data.height) heightRef.current.value = String(data.height);

                // SEO Fields
                const seoTitleInput = document.getElementsByName('seoTitle')[0] as HTMLInputElement;
                const seoDescInput = document.getElementsByName('seoDescription')[0] as HTMLTextAreaElement;
                const seoAltInput = document.getElementsByName('seoAltText')[0] as HTMLInputElement;

                if (seoTitleInput && data.seoTitle) seoTitleInput.value = data.seoTitle;
                if (seoDescInput && data.seoDescription) seoDescInput.value = data.seoDescription;
                if (seoAltInput && data.seoAltText) seoAltInput.value = data.seoAltText;

                return 'Dati generati con successo!';
            },
            error: 'Errore generazione AI'
        });

        try { await promise } catch { } finally { setGenerating(false); }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUploading(true);

        const formData = new FormData(event.currentTarget);

        // No need to upload separately anymore, createPainting handles logic
        const promise = new Promise(async (resolve, reject) => {
            try {
                // If AI was used and filled fields, they are already in the inputs
                // formData captures them automatically

                await createPainting(formData);
                router.push('/admin/paintings');
                router.refresh();
                resolve('Quadro creato con successo!');
            } catch (e) {
                console.error(e);
                setUploading(false);
                reject('Errore durante la creazione del quadro');
            }
        });

        toast.promise(promise, {
            loading: 'Creazione e analisi AI in corso...',
            success: (data) => `${data}`,
            error: (err) => `${err}`,
        });
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800">
                <div className="px-6 py-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Aggiungi Nuovo Quadro</h1>
                    <form onSubmit={onSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Titolo
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    ref={titleRef}
                                    onChange={(e) => {
                                        // Update context description context title if needed? Not used for create context description is the description
                                    }}
                                    className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                                    placeholder="Inserisci il titolo del quadro"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descrizione
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    ref={descRef}
                                    onChange={(e) => setContextDescription(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                                    placeholder="Inserisci la descrizione del quadro"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Prezzo (€)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        id="price"
                                        step="0.01"
                                        min="0"
                                        ref={priceRef}
                                        className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="width" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Larghezza (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="width"
                                        id="width"
                                        step="0.1"
                                        min="0"
                                        ref={widthRef}
                                        className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                                        placeholder="0.0"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Altezza (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="height"
                                        id="height"
                                        step="0.1"
                                        min="0"
                                        ref={heightRef}
                                        className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="externalLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Link Esterno (es. Etsy)
                                </label>
                                <input
                                    type="url"
                                    name="externalLink"
                                    id="externalLink"
                                    className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Immagine
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    id="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-lg file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100
                                            dark:file:bg-neutral-800 dark:file:text-indigo-400
                                            transition-colors cursor-pointer"
                                />

                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleAiAutofill}
                                        disabled={generating || !preview}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                    >
                                        {generating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Generando...</span>
                                            </>
                                        ) : '✨ Auto-Fill Dati (AI)'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <input
                                    id="sold"
                                    name="sold"
                                    type="checkbox"
                                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                                />
                                <label htmlFor="sold" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Segna come Venduto
                                </label>
                            </div>

                            <SeoFields
                                contextText={contextDescription} // Pass updated description
                                imageUrl={preview || undefined}
                                onChange={() => { }}
                                hideSubtitle={true}
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                {uploading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Caricamento...
                                    </span>
                                ) : 'Crea Quadro'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
