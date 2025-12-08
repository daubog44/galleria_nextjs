'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit2 } from 'lucide-react';
import { DeleteForm } from './DeleteForm';
import { toggleSold, deletePainting } from '@/app/admin/paintings/actions';

interface Painting {
    id: number;
    title: string | null;
    description: string | null;
    price: number | null;
    width: number | null;
    height: number | null;
    imageUrl: string;
    sold: boolean | null;
    createdAt: Date | null;
}

export function PaintingListItem({ painting }: { painting: Painting }) {
    const [isDeleted, setIsDeleted] = useState(false);

    if (isDeleted) {
        return null;
    }

    return (
        <li>
            <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center w-full sm:w-auto">
                    <div className="flex-shrink-0 h-16 w-16 relative">
                        <Image
                            src={painting.imageUrl}
                            alt={painting.title || 'Senza titolo'}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                        <h3 className="text-lg font-medium text-indigo-600 truncate dark:text-indigo-400">
                            {painting.title || 'Senza titolo'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                            {painting.width && painting.height ? `${painting.width}x${painting.height} cm • ` : ''}{painting.price || 'Prezzo su richiesta'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-end w-full sm:w-auto space-x-4">
                    <form action={toggleSold} className="flex items-center gap-3 bg-gray-50 dark:bg-neutral-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-700">
                        <input type="hidden" name="id" value={painting.id} />
                        <input type="hidden" name="currentStatus" value={String(painting.sold)} />

                        <span className={`text-xs font-bold uppercase tracking-wider ${painting.sold ? 'text-red-500' : 'text-green-600'}`}>
                            {painting.sold ? 'Venduto' : 'Disponibile'}
                        </span>

                        <button
                            type="submit"
                            title={painting.sold ? "Segna come disponibile" : "Segna come venduto"}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${painting.sold ? 'bg-red-500' : 'bg-green-600'
                                }`}
                        >
                            <span className="sr-only">Cambia stato</span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${painting.sold ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </form>
                    <Link
                        href={`/admin/paintings/${painting.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2"
                        title="Modifica"
                    >
                        <Edit2 className="w-5 h-5" />
                    </Link>
                    <DeleteForm
                        id={painting.id}
                        action={deletePainting}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2"
                        onOptimisticDelete={() => setIsDeleted(true)}
                        onDeleteError={() => {
                            setIsDeleted(false);
                            alert("Errore durante l'eliminazione. L'elemento è stato ripristinato.");
                        }}
                    />
                </div>
            </div>
        </li>
    );
}
