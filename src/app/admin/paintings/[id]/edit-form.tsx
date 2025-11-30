'use client';

import { updatePainting } from '../actions';
import { useState } from 'react';
import Image from 'next/image';

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
}

export default function EditForm({ painting }: { painting: Painting }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(painting.imageUrl);
    const [contextTitle, setContextTitle] = useState(painting.title || '');
    const [contextDescription, setContextDescription] = useState(painting.description || '');

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUploading(true);

        const formData = new FormData(event.currentTarget);
        const file = formData.get('image') as File;

        if (file && file.size > 0) {
            const uploadData = new FormData();
            uploadData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();
                formData.set('imageUrl', data.url);
            } catch (e) {
                console.error(e);
                alert('Image upload failed');
                setUploading(false);
                return;
            }
        }

        await updatePainting(formData);
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
                        required
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
                />
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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
