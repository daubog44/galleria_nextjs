'use client';

import { useState, useEffect } from 'react';
import { generateSeoData } from '@/app/admin/actions/seo-ai';
import { Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SeoFieldsProps {
    initialTitle?: string | null;
    initialSubtitle?: string | null;
    initialDescription?: string | null;
    initialAltText?: string | null;
    contextText: string;
    imageUrl?: string;
    onChange: (data: { title: string; subtitle: string; description: string; altText: string }) => void;
    hideSubtitle?: boolean;
    onGenerate?: () => Promise<any>;
}

export function SeoFields({ initialTitle, initialSubtitle, initialDescription, initialAltText, contextText, imageUrl, onChange, onGenerate, hideSubtitle = false }: SeoFieldsProps) {
    const [title, setTitle] = useState(initialTitle || '');
    const [subtitle, setSubtitle] = useState(initialSubtitle || '');
    const [description, setDescription] = useState(initialDescription || '');
    const [altText, setAltText] = useState(initialAltText || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Update local state if props change (e.g. initial load)
    useEffect(() => {
        if (initialTitle !== undefined) setTitle(initialTitle || '');
        if (initialSubtitle !== undefined) setSubtitle(initialSubtitle || '');
        if (initialDescription !== undefined) setDescription(initialDescription || '');
        if (initialAltText !== undefined) setAltText(initialAltText || '');
    }, [initialTitle, initialSubtitle, initialDescription, initialAltText]);

    const handleGenerate = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggling accordion when clicking generate
        setLoading(true);
        setError('');
        try {
            let data;
            if (onGenerate) {
                data = await onGenerate();
            } else {
                data = await generateSeoData(contextText, imageUrl);
            }

            if (data) {
                const newTitle = data.title || data.seoTitle || title;
                const newDescription = data.description || data.seoDescription || description;
                const newAltText = data.altText || data.seoAltText || altText;

                setTitle(newTitle);
                setDescription(newDescription);
                setAltText(newAltText);

                onChange({
                    title: newTitle,
                    subtitle: subtitle,
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

    const update = (key: 'title' | 'subtitle' | 'description' | 'altText', value: string) => {
        if (key === 'title') setTitle(value);
        if (key === 'subtitle') setSubtitle(value);
        if (key === 'description') setDescription(value);
        if (key === 'altText') setAltText(value);

        onChange({
            title: key === 'title' ? value : title,
            subtitle: key === 'subtitle' ? value : subtitle,
            description: key === 'description' ? value : description,
            altText: key === 'altText' ? value : altText
        });
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 mt-6 overflow-hidden">
            <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Impostazioni SEO</h3>
                </div>
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors z-10"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Genera con AI
                </button>
            </div>

            {isOpen && (
                <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="pt-4">
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                {!hideSubtitle && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Sottotitolo <span className="text-xs font-normal text-gray-500">(Visibile in pagina)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="seoSubtitle"
                                            value={subtitle}
                                            onChange={(e) => update('subtitle', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Sottotitolo visualizzato nell'header"
                                        />
                                    </div>
                                )}
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
                                    placeholder="Descrizione per motori di ricerca"
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
                </div>
            )}
        </div>
    );
}
