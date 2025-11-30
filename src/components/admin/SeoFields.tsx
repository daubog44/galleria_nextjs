'use client';

import { useState, useEffect } from 'react';
import { generateSeoData } from '@/app/admin/actions/seo-ai';
import { Loader2, Sparkles } from 'lucide-react';

interface SeoFieldsProps {
    initialTitle?: string | null;
    initialDescription?: string | null;
    initialAltText?: string | null;
    contextText: string;
    imageUrl?: string;
    onChange: (data: { title: string; description: string; altText: string }) => void;
}

export function SeoFields({ initialTitle, initialDescription, initialAltText, contextText, imageUrl, onChange }: SeoFieldsProps) {
    const [title, setTitle] = useState(initialTitle || '');
    const [description, setDescription] = useState(initialDescription || '');
    const [altText, setAltText] = useState(initialAltText || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Update local state if props change (e.g. initial load)
    useEffect(() => {
        if (initialTitle !== undefined) setTitle(initialTitle || '');
        if (initialDescription !== undefined) setDescription(initialDescription || '');
        if (initialAltText !== undefined) setAltText(initialAltText || '');
    }, [initialTitle, initialDescription, initialAltText]);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await generateSeoData(contextText, imageUrl);
            if (data) {
                const newTitle = data.title || title;
                const newDescription = data.description || description;
                const newAltText = data.altText || altText;

                setTitle(newTitle);
                setDescription(newDescription);
                setAltText(newAltText);

                onChange({
                    title: newTitle,
                    description: newDescription,
                    altText: newAltText
                });
            }
        } catch (e) {
            console.error(e);
            setError('Impossibile generare dati SEO. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    const update = (key: 'title' | 'description' | 'altText', value: string) => {
        if (key === 'title') setTitle(value);
        if (key === 'description') setDescription(value);
        if (key === 'altText') setAltText(value);

        // We call onChange with the *new* state, but since setState is async, we construct the object manually
        onChange({
            title: key === 'title' ? value : title,
            description: key === 'description' ? value : description,
            altText: key === 'altText' ? value : altText
        });
    };

    return (
        <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 mt-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Impostazioni SEO</h3>
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Genera con AI
                </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Titolo</label>
                    <input
                        type="text"
                        name="seoTitle"
                        value={title}
                        onChange={(e) => update('title', e.target.value)}
                        maxLength={60}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Titolo della pagina"
                    />
                    <div className="flex justify-end mt-1">
                        <span className={`text-xs ${title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                            {title.length}/60
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Descrizione</label>
                    <textarea
                        name="seoDescription"
                        value={description}
                        onChange={(e) => update('description', e.target.value)}
                        maxLength={160}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Descrizione della pagina"
                    />
                    <div className="flex justify-end mt-1">
                        <span className={`text-xs ${description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                            {description.length}/160
                        </span>
                    </div>
                </div>

                {imageUrl && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Testo Alternativo Immagine</label>
                        <input
                            type="text"
                            name="seoAltText"
                            value={altText}
                            onChange={(e) => update('altText', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Testo alternativo immagine"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
