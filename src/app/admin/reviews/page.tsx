
import { db } from '@/db';
import { reviews } from '@/db/schema';
import Link from 'next/link';
import { deleteReview } from './actions';
import { DeleteForm } from '@/components/admin/DeleteForm';
import { Edit2, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
    let allReviews: typeof reviews.$inferSelect[] = [];
    try {
        allReviews = await db.select().from(reviews).orderBy(reviews.id);
    } catch (error) {
        console.warn("Database connection failed in Admin Reviews page (expected during build):", error);
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recensioni & Articoli</h1>
                <Link
                    href="/admin/reviews/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                    Aggiungi Nuova
                </Link>
            </div>

            <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {allReviews.map((review) => (
                        <li key={review.id}>
                            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-indigo-600 truncate dark:text-indigo-400">
                                        {review.title || 'Senza Titolo'}
                                    </h3>
                                    <p className="mt-1 flex text-sm text-gray-500 dark:text-gray-400">
                                        <span className="truncate">{review.author}</span>
                                        <span className="mx-2">&bull;</span>
                                        <span className="capitalize">{review.type}</span>
                                    </p>
                                </div>
                                <div className="flex space-x-4 items-center">
                                    {review.slug && (
                                        <Link
                                            href={`/stile/${review.slug}`}
                                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 mr-2"
                                            title="Vedi sul sito"
                                            target="_blank"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    )}
                                    <Link
                                        href={`/admin/reviews/${review.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 cursor-pointer"
                                        title="Modifica"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <DeleteForm
                                        id={review.id}
                                        action={deleteReview}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
