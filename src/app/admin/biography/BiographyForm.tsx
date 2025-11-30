'use client';

import { updateBiography } from './actions';
import { SeoFields } from '@/components/admin/SeoFields';
import { useState } from 'react';

interface BiographyFormProps {
    initialContent: string;
    initialSeo: {
        title?: string | null;
        description?: string | null;
    };
}

export default function BiographyForm({ initialContent, initialSeo }: BiographyFormProps) {
    const [content, setContent] = useState(initialContent);

    return (
        <form action={updateBiography} className="space-y-6">
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contenuto (Markdown supportato)
                </label>
                <textarea
                    id="content"
                    name="content"
                    rows={20}
                    defaultValue={initialContent}
                    onChange={(e) => setContent(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-4"
                />
            </div>

            <SeoFields
                initialTitle={initialSeo.title}
                initialDescription={initialSeo.description}
                contextText={content}
                onChange={() => { }}
            />

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Salva Modifiche
                </button>
            </div>
        </form>
    );
}
