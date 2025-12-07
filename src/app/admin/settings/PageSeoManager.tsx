'use client';

import { SeoFields } from '@/components/admin/SeoFields';
import { updatePageSeo } from '@/app/admin/actions/seo-actions';
import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PageSeoManagerProps {
    pageKey: string;
    pageName: string;
    initialData: {
        title?: string | null;
        subtitle?: string | null;
        description?: string | null;
        imageAltText?: string | null;
    };
}

export default function PageSeoManager({ pageKey, pageName, initialData }: PageSeoManagerProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSaving(true);
        setShowSuccess(false);

        const promise = updatePageSeo(formData);

        toast.promise(promise, {
            loading: 'Salvataggio SEO in corso...',
            success: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                setIsSaving(false);
                return `SEO per ${pageName} aggiornato!`;
            },
            error: (err) => {
                console.error("Failed to save SEO:", err);
                setIsSaving(false);
                return 'Errore durante il salvataggio SEO';
            }
        });
    };

    return (
        <form action={handleSubmit} className="space-y-4 border-t pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
            <input type="hidden" name="pageKey" value={pageKey} />
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{pageName} SEO</h3>
            <SeoFields
                initialTitle={initialData.title}
                initialSubtitle={initialData.subtitle}
                initialDescription={initialData.description}
                initialAltText={initialData.imageAltText}
                contextText={`Impostazioni SEO per la pagina ${pageName}.`}
                onChange={() => { }}
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className={`
                        flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                        ${showSuccess
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }
                        ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}
                    `}
                >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {showSuccess && <Check className="w-4 h-4 mr-2" />}
                    {!isSaving && !showSuccess && `Salva SEO per ${pageName}`}
                    {isSaving && "Salvataggio..."}
                    {showSuccess && "Salvato!"}
                </button>
            </div>
        </form>
    );
}
