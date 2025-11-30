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
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 relative">
                        <Image
                            src={painting.imageUrl}
                            alt={painting.title || 'Senza titolo'}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-indigo-600 truncate dark:text-indigo-400">
                            {painting.title || 'Senza titolo'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {painting.width && painting.height ? `${painting.width}x${painting.height} cm • ` : ''}{painting.price || 'Prezzo su richiesta'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <form action={toggleSold}>
                        <input type="hidden" name="id" value={painting.id} />
                        <input type="hidden" name="currentStatus" value={String(painting.sold)} />
                        <button
                            type="submit"
                            className={`px-3 py-1 rounded-full text-xs font-medium ${painting.sold
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                } `}
                        >
                            {painting.sold ? 'Venduto' : 'Disponibile'}
                        </button>
                    </form>
                    <Link
                        href={`/admin/paintings/${painting.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                        title="Modifica"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Link>
                    <DeleteForm
                        id={painting.id}
                        action={deletePainting}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
