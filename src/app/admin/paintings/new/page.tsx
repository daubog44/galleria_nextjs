'use client';

import { createPainting, uploadImageAction } from '../actions';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewPaintingPage() {
    const [uploading, setUploading] = useState(false);

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

                await createPainting(formData);
                resolve('Quadro creato con successo!');
            } catch (e) {
                console.error(e);
                setUploading(false);
                reject('Errore durante la creazione del quadro');
            }
        });

        toast.promise(promise, {
            loading: 'Creazione in corso...',
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
                                    required
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
                                    required
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
