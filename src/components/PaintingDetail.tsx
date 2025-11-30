import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPainting } from '@/app/actions';

interface PaintingDetailProps {
    id: number;
    isModal?: boolean;
}

export default async function PaintingDetail({ id, isModal = false }: PaintingDetailProps) {
    if (id === 0 || isNaN(id)) {
        console.warn(`[PaintingDetail] Invalid ID received: ${id}`);
        return null;
    }

    const painting = await getPainting(id);

    if (!painting) {
        return null;
    }

    // Check if there is any info to display
    const hasInfo = !!(painting.title || painting.description || painting.price || painting.sold);

    // If it's a modal and there is no info, we just show the image centered
    if (isModal && !hasInfo) {
        return (
            <div className="flex items-center justify-center w-full h-full pointer-events-none">
                <div className="relative pointer-events-auto">
                    <Image
                        src={painting.imageUrl}
                        alt="Opera d'arte"
                        className="object-contain max-h-[85vh] max-w-[90vw] w-auto h-auto rounded-md shadow-2xl"
                        priority
                    />
                </div>
            </div>
        );
    }

    // Modal with info styling (Legacy match)
    if (isModal) {
        return (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 max-w-6xl mx-auto pointer-events-auto">
                <div className="relative flex items-center justify-center">
                    <Image
                        src={painting.imageUrl}
                        alt={painting.title || "Opera d'arte"}
                        className="object-contain max-h-[60vh] md:max-h-[85vh] max-w-[90vw] md:max-w-[50vw] w-auto h-auto rounded-md shadow-2xl"
                        priority
                    />
                </div>

                <div className="w-full md:w-[45%] bg-black/70 backdrop-blur-md text-gray-300 p-6 md:p-8 rounded-lg shadow-xl mt-4 md:mt-0">
                    {painting.title && (
                        <h3 className="text-3xl font-serif text-white mb-6">{painting.title}</h3>
                    )}

                    {painting.description && (
                        <div className="prose prose-invert prose-sm mb-6 text-gray-300 leading-relaxed">
                            <p>{painting.description}</p>
                        </div>
                    )}

                    {painting.width && painting.height && (
                        <p className="text-sm text-gray-400 mb-4">
                            Dimensioni: {painting.width} x {painting.height} cm
                        </p>
                    )}

                    <div className="mt-auto space-y-4 pt-4 border-t border-gray-600/50">
                        {painting.price && !painting.sold && (
                            <p className="text-xl font-medium text-green-300">
                                <strong>Prezzo:</strong> € {typeof painting.price === 'number' ? painting.price.toFixed(2) : painting.price}
                            </p>
                        )}

                        {painting.sold ? (
                            <p className="text-xl font-medium text-red-300 uppercase tracking-wider">
                                <em>Venduto</em>
                            </p>
                        ) : (
                            // Link to purchase (placeholder or actual link if exists)
                            <a
                                href="/contatti"
                                className="block w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-center py-3 px-6 rounded-full font-medium hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors duration-300"
                            >
                                Contattami
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Standalone page styling (keep clean/light or adapt)
    return (
        <div className="flex flex-col md:flex-row w-full bg-white dark:bg-[#1a1a1a]">
            <div className="w-full md:w-2/3 relative bg-gray-100 dark:bg-[#2a2a2a] min-h-[50vh] md:min-h-[80vh]">
                <Image
                    src={painting.imageUrl}
                    alt={painting.title || 'Opera d\'arte'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    priority
                />
            </div>
            <div className="w-full md:w-1/3 p-8 flex flex-col justify-center overflow-y-auto">
                <h1 className="text-3xl font-light mb-4 uppercase tracking-wide dark:text-white">{painting.title || 'Senza Titolo'}</h1>

                {painting.description && (
                    <div className="prose prose-sm text-gray-600 dark:text-gray-300 mb-4">
                        <p>{painting.description}</p>
                    </div>
                )}

                {painting.width && painting.height && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Dimensioni: {painting.width} x {painting.height} cm
                    </p>
                )}

                <div className="mt-auto space-y-4">
                    {painting.price && (
                        <p className="text-2xl font-medium text-gray-900 dark:text-white">€ {typeof painting.price === 'number' ? painting.price.toFixed(2) : painting.price}</p>
                    )}

                    {painting.sold ? (
                        <span className="inline-block bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-4 py-2 text-sm uppercase tracking-wider">
                            Venduto
                        </span>
                    ) : (
                        <Link
                            href="/contatti"
                            className="block w-full text-center bg-black text-white py-3 px-6 uppercase tracking-widest hover:bg-gray-800 transition-colors text-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            Contattami
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
