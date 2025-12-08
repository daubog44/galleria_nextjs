'use client';

import { updatePainting, uploadImageAction } from '../actions';
import { generatePaintingMetadata } from '@/app/admin/actions/generative-ai';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

import { SeoFields } from '@/components/admin/SeoFields';

interface Painting {
    id: number;
    title: string | null;
    description: string | null;
    price: number | null;
    width: number | null;
    height: number | null;
    imageUrl: string;
    sold: boolean | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoAltText: string | null;
    externalLink: string | null;
}

export default function EditForm({ painting }: { painting: Painting }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(painting.imageUrl);
    const [contextTitle, setContextTitle] = useState(painting.title || '');
    const [contextDescription, setContextDescription] = useState(painting.description || '');
    const [generating, setGenerating] = useState(false);

    const router = useRouter();

    async function handleAiAutofill() {
        if (!preview) {
            toast.error('Nessuna immagine disponibile per l\'analisi');
            return;
        }

        setGenerating(true);
        const promise = generatePaintingMetadata(preview);

        toast.promise(promise, {
            loading: 'Analisi con AI in corso (biografia + immagine)...',
            success: (data) => {
                // Populate fields
                if (data.title) (document.getElementById('title') as HTMLInputElement).value = data.title;
                if (data.description) {
                    (document.getElementById('description') as HTMLTextAreaElement).value = data.description;
                    setContextDescription(data.description);
                }
                if (data.price) (document.getElementById('price') as HTMLInputElement).value = String(data.price);
                if (data.width) (document.getElementById('width') as HTMLInputElement).value = String(data.width);
                if (data.height) (document.getElementById('height') as HTMLInputElement).value = String(data.height);

                // SEO handled by SeoFields? SeoFields is controlled by props but can be overridden?
                // Actually SeoFields takes initial props. To update it, we might need state or ref.
                // But wait, SeoFields has no exposed ref.
                // It likely needs a reset or key change to pick up new values, OR we just let the user re-generate SEO if needed.
                // BUT the user asked for SEO items too. "generate properties... title, price..."
                // The prompt returns SEO data too.
                // Let's rely on the form submission using name attributes which SeoFields might fill?
                // SeoFields renders inputs with name="seoTitle" etc.
                // So we can target them by ID if they have IDs, or name.
                // SeoFields implementation:
                // <input name="seoTitle" ... />

                const seoTitleInput = document.getElementsByName('seoTitle')[0] as HTMLInputElement;
                const seoDescInput = document.getElementsByName('seoDescription')[0] as HTMLTextAreaElement;
                const seoAltInput = document.getElementsByName('seoAltText')[0] as HTMLInputElement;

                if (seoTitleInput && data.seoTitle) seoTitleInput.value = data.seoTitle;
                if (seoDescInput && data.seoDescription) seoDescInput.value = data.seoDescription;
                if (seoAltInput && data.seoAltText) seoAltInput.value = data.seoAltText;

                return 'Campi compilati con successo!';
            },
            error: 'Errore generazone AI'
        });

        try {
            await promise;
        } catch { } finally {
            setGenerating(false);
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUploading(true);

        const formData = new FormData(event.currentTarget);
        const file = formData.get('image') as File;

        const promise = new Promise(async (resolve, reject) => {
            try {
                if (file && file.size > 0) {
                    const uploadData = new FormData();
                    uploadData.append('file', file);

                    const res = await uploadImageAction(uploadData);
                    if (!res.success || !res.url) throw new Error(res.error || 'Upload failed');
                    formData.set('imageUrl', res.url);
                }

                const result = await updatePainting(formData);
                if (result.success) {
                    resolve(result.message);
                    // Add a small delay for toast to be visible before redirect
                    setTimeout(() => router.push('/admin/paintings'), 1000);
                } else {
                    reject('Errore durante l\'aggiornamento');
                }
            } catch (e) {
                console.error(e);
                setUploading(false);
                reject('Errore durante l\'aggiornamento del quadro');
            }
        });

        toast.promise(promise, {
            loading: 'Aggiornamento in corso...',
            success: (data) => `${data}`,
            error: (err) => `${err}`,
        });
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 w-full max-w-full overflow-hidden">
            <input type="hidden" name="id" value={painting.id} />
            {/* Keep existing URL if no new file uploaded */}
            <input type="hidden" name="imageUrl" value={painting.imageUrl} />

            <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        defaultValue={painting.title || ''}
                        onChange={(e) => setContextTitle(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={painting.description || ''}
                        onChange={(e) => setContextDescription(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price (€)
                        </label>
                        <input
                            type="number"
                            name="price"
                            id="price"
                            step="0.01"
                            min="0"
                            defaultValue={painting.price || ''}
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
                            defaultValue={painting.width || ''}
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
                            defaultValue={painting.height || ''}
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
                        defaultValue={painting.externalLink || ''}
                        className="block w-full rounded-lg border-gray-300 dark:border-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:text-white py-3 px-4 transition-colors"
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sostituisci Immagine
                    </label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                            file:mr-4 file:py-2.5 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100
                            dark:file:bg-neutral-800 dark:file:text-indigo-400
                            transition-colors cursor-pointer"
                    />
                </div>

                {/* Image Preview */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Immagine Corrente
                    </label>
                    <div className="relative h-64 w-full sm:w-1/2 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800">
                        <Image
                            src={preview}
                            alt={painting.title || 'Painting'}
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
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
                                Generando...
                            </>
                        ) : (
                            <>
                                ✨ Auto-Fill con AI (Stima Prezzi & Dettagli)
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center pt-2">
                    <input
                        id="sold"
                        name="sold"
                        type="checkbox"
                        defaultChecked={painting.sold || false}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor="sold" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Segna come Venduto
                    </label>
                </div>

                <SeoFields
                    initialTitle={painting.seoTitle}
                    initialDescription={painting.seoDescription}
                    initialAltText={painting.seoAltText}
                    contextText={`${contextTitle}\n${contextDescription}`}
                    imageUrl={preview}
                    onChange={() => { }} // Form submission handles values via name attributes
                    hideSubtitle={true}
                    hideH1={true}
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
                    ) : 'Aggiorna Quadro'}
                </button>
            </div>
        </form>
    );
}
