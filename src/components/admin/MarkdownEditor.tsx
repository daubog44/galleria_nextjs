'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
    initialValue: string;
    name: string;
}

export default function MarkdownEditor({ initialValue, name }: MarkdownEditorProps) {
    const [value, setValue] = useState(initialValue);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    return (
        <div className="border border-gray-300 dark:border-neutral-700 rounded-md overflow-hidden">
            <div className="flex border-b border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800">
                <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'write' ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Scrivi
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'preview' ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Anteprima
                </button>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-900 min-h-[300px]">
                {activeTab === 'write' ? (
                    <textarea
                        name={name}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full h-full min-h-[300px] p-2 focus:outline-none bg-transparent text-gray-900 dark:text-white font-mono text-sm resize-y"
                        placeholder="Scrivi qui il tuo contenuto in Markdown..."
                    />
                ) : (
                    <div className="prose prose-stone dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
            {/* Hidden input to ensure value is submitted if we were in preview mode (though textarea is inside form, conditional rendering removes it from DOM) */}
            {/* Actually, if we conditionally render the textarea, it won't be submitted when in preview mode. 
                So we should keep the textarea always rendered but hidden, OR update a hidden input.
            */}
            {activeTab === 'preview' && (
                <input type="hidden" name={name} value={value} />
            )}
        </div>
    );
}
