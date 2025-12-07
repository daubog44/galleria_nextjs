'use client';

import { useState, useRef } from 'react';
import { uploadSiteIcon } from './actions';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function IconUploader() {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('icon', file);

        try {
            const result = await uploadSiteIcon(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
            }
        } catch {
            toast.error('Errore durante il caricamento');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 border border-stone-200 dark:border-stone-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Icona del Sito (PWA)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Carica un&apos;immagine quadrata (min. 512x512px). Verrà ridimensionata e utilizzata come icona dell&apos;app quando installata su smartphone e desktop.
            </p>

            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-neutral-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors overflow-hidden">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                                <Upload className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isUploading ? 'Caricamento...' : 'Carica Nuova Icona'}
                    </button>
                    <p className="text-xs text-gray-400">Formati supportati: PNG, JPG, WEBP</p>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30 text-sm text-yellow-800 dark:text-yellow-200 flex gap-2">
                <ImageIcon className="w-5 h-5 flex-shrink-0" />
                <p>Nota: Dopo il caricamento, potresti dover svuotare la cache del browser o reinstallare l&apos;app per vedere la nuova icona.</p>
            </div>
        </div>
    );
}
