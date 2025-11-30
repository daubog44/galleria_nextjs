
import { db } from '@/db';
import { paintings } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { deletePainting, toggleSold } from './actions';
import { PaintingListItem } from '@/components/admin/PaintingListItem';
import { Edit2 } from 'lucide-react';

export default async function PaintingsList({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    let total = 0;
    let totalPages = 0;
    let allPaintings: typeof paintings.$inferSelect[] = [];

    try {
        const totalResult = await db.select({ count: sql<number>`count(*)` }).from(paintings);
        total = Number(totalResult[0].count);
        totalPages = Math.ceil(total / limit);

        allPaintings = await db.select().from(paintings).orderBy(desc(paintings.createdAt)).limit(limit).offset(offset);
    } catch (error) {
        console.warn("Database connection failed in Admin Paintings page (expected during build):", error);
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quadri</h1>
                <Link
                    href="/admin/paintings/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Aggiungi Nuovo
                </Link>
            </div>

            <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {allPaintings.map((painting) => (
                        <PaintingListItem key={painting.id} painting={painting} />
                    ))}
                </ul>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 sm:px-6 mt-4 rounded-md shadow">
                <div className="flex flex-1 justify-between sm:hidden">
                    <Link
                        href={`/admin/paintings?page=${Math.max(1, page - 1)}`}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        Precedente
                    </Link>
                    <Link
                        href={`/admin/paintings?page=${Math.min(totalPages, page + 1)}`}
                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        Successivo
                    </Link>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Mostrando da <span className="font-medium">{(page - 1) * limit + 1}</span> a <span className="font-medium">{Math.min(page * limit, total)}</span> di <span className="font-medium">{total}</span> risultati
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <Link
                                href={`/admin/paintings?page=${Math.max(1, page - 1)}`}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <span className="sr-only">Precedente</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                </svg>
                            </Link>
                            {/* Page Numbers - Simplified for now */}
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-white">
                                Pagina {page} di {totalPages}
                            </span>
                            <Link
                                href={`/admin/paintings?page=${Math.min(totalPages, page + 1)}`}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <span className="sr-only">Successivo</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
