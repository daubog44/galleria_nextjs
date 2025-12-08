'use client';

import { updateBiography, uploadBiographyImageAction } from './actions';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface BiographyFormProps {
    initialContent: string;
    initialImageUrl: string;
}

export default function BiographyForm({ initialContent, initialImageUrl }: BiographyFormProps) {
    const [content, setContent] = useState(initialContent);
    const [preview, setPreview] = useState(initialImageUrl);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setUploading(true);
        const formData = new FormData(event.currentTarget);

        const file = formData.get('image') as File;

        const promise = new Promise(async (resolve, reject) => {
            try {
                if (file && file.size > 0) {
                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    const res = await uploadBiographyImageAction(uploadData);
                    if (!res.success || !res.url) throw new Error(res.error || 'Upload failed');
                    formData.set('imageUrl', res.url);
                } else {
                    // Start with existing URL if no new file
                    if (!formData.get('imageUrl') && preview) {
                        formData.set('imageUrl', preview);
                    }
                }

                const result = await updateBiography(formData);
                if (result.success) {
                    resolve(result.message);
                    router.refresh();
                } else {
                    reject('Errore durante il salvataggio');
                }
            } catch (e) {
                console.error(e);
                reject('Errore durante il salvataggio');
            } finally {
                setUploading(false);
            }
        });

        toast.promise(promise, {
            loading: 'Salvataggio biografia...',
            success: (msg) => `${msg}`,
            error: (err) => `${err}`
        });
    };

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
            <input type="hidden" name="imageUrl" value={preview} />

            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 items-start">
                {/* Image Section */}
                <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Foto Profilo
                    </label>

                    <div className="relative group w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:border-indigo-500/50 transition-colors">
                        <Image
                            src={preview || '/sitedata/autore_foto.jpg'}
                            alt="Profile"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="text-white font-medium text-sm bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                Modifica foto
                            </span>
                        </div>
                        <input
                            type="file"
                            name="image"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Clicca sull&apos;immagine per caricarne una nuova.<br />
                        Formati supportati: JPG, PNG, WEBP.
                    </p>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    <label htmlFor="content" className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Biografia (Markdown)
                    </label>
                    <div className="prose-editor dark:invert [&_.CodeMirror]:!bg-white [&_.CodeMirror]:!text-gray-900 [&_.editor-toolbar]:!bg-gray-50 [&_.editor-toolbar]:!border-gray-200 [&_.editor-toolbar_i]:!text-gray-700 [&_.editor-statusbar]:!text-gray-500">
                        <SimpleMDE
                            id="content"
                            value={content}
                            onChange={(value) => setContent(value)}
                            options={{
                                spellChecker: false,
                                placeholder: "Scrivi qui la tua biografia...",
                                status: false,
                                minHeight: "400px",
                            }}
                        />
                        {/* Hidden input to submit the content value in FormData */}
                        <input type="hidden" name="content" value={content} />
                    </div>
                </div>
            </div>



            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex justify-center items-center py-3 px-8 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvataggio in corso...
                        </>
                    ) : 'Salva Modifiche'}
                </button>
            </div>
        </form>
    );
}
