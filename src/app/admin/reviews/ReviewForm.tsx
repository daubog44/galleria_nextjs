'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import { SeoFields } from '@/components/admin/SeoFields';
import { createReview, updateReview } from './actions';

interface ReviewFormProps {
    initialData?: {
        id?: number;
        title: string | null;
        author: string | null;
        source: string | null;
        date: string | null;
        type: string | null;
        imageUrl: string | null;
        content: string | null;
        seoTitle?: string | null;
        seoDescription?: string | null;
        seoAltText?: string | null;
    };
    isEditing?: boolean;
}

export default function ReviewForm({ initialData, isEditing = false }: ReviewFormProps) {
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const promise = async () => {
            let res;
            if (isEditing) {
                res = await updateReview(formData);
            } else {
                res = await createReview(formData);
            }

            if (res.success) {
                setTimeout(() => router.push('/admin/reviews'), 1000);
                return res.message;
            } else {
                throw new Error('Operazione fallita');
            }
        };

        toast.promise(promise(), {
            loading: isEditing ? 'Aggiornamento in corso...' : 'Creazione in corso...',
            success: (data) => `${data}`,
            error: 'Si è verificato un errore',
        });
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {isEditing && initialData?.id && (
                <input type="hidden" name="id" value={initialData.id} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Titolo
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        defaultValue={initialData?.title || ''}
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>

                <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Autore
                    </label>
                    <input
                        type="text"
                        name="author"
                        id="author"
                        defaultValue={initialData?.author || ''}
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fonte (opzionale)
                    </label>
                    <input
                        type="text"
                        name="source"
                        id="source"
                        defaultValue={initialData?.source || ''}
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Data (opzionale)
                    </label>
                    <input
                        type="text"
                        name="date"
                        id="date"
                        defaultValue={initialData?.date || ''}
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo
                    </label>
                    <select
                        id="type"
                        name="type"
                        defaultValue={initialData?.type || 'review'}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    >
                        <option value="review">Recensione</option>
                        <option value="article">Articolo</option>
                        <option value="post">Post Blog</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL Immagine (opzionale)
                    </label>
                    <input
                        type="text"
                        name="imageUrl"
                        id="imageUrl"
                        defaultValue={initialData?.imageUrl || ''}
                        placeholder="/sitedata/paintings/..."
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contenuto (Markdown)
                </label>
                <MarkdownEditor initialValue={initialData?.content || ''} name="content" />
            </div>

            <SeoFields
                initialTitle={initialData?.seoTitle}
                initialDescription={initialData?.seoDescription}
                initialAltText={initialData?.seoAltText}
                contextText={initialData?.content || 'Recensione artista'}
                imageUrl={initialData?.imageUrl || undefined}
                onChange={() => { }}
                hideSubtitle={true}
            />

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                    {isEditing ? 'Aggiorna Post' : 'Crea Recensione'}
                </button>
            </div>
        </form >
    );
}
