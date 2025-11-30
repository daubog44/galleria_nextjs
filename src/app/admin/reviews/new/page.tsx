
import { createReview } from '../actions';

export default function NewReviewPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Aggiungi Nuova Recensione</h1>
            <form action={createReview} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Titolo
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
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
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>

                <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fonte (opzionale)
                    </label>
                    <input
                        type="text"
                        name="source"
                        id="source"
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
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo
                    </label>
                    <select
                        id="type"
                        name="type"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    >
                        <option value="review">Recensione</option>
                        <option value="article">Articolo</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contenuto
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        rows={10}
                        required
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white p-2"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Crea Recensione
                    </button>
                </div>
            </form>
        </div>
    );
}
