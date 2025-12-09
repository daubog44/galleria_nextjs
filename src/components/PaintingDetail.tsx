import Image from 'next/image';
import Link from 'next/link';
import { getPainting } from '@/app/actions';

import ModalCloseButton from './ModalCloseButton';
import ModalContactButton from './ModalContactButton';

interface PaintingDetailProps {
    id: string | number;
    isModal?: boolean;
}

export default async function PaintingDetail({ id, isModal = false }: PaintingDetailProps) {
    if (!id) {
        console.warn(`[PaintingDetail] Invalid ID received: ${id}`);
        return null;
    }

    const painting = await getPainting(id);

    if (!painting) {
        return null;
    }

    // Check if there is significant info to display in the sidebar
    // We now include Title as significant info, so if there is a title, we show the sidebar.
    // This allows the "Contact" button to be in the sidebar standard location.
    const hasDetails = !!(painting.title || painting.description || (painting.price && !painting.sold) || painting.width || painting.externalLink);

    // If it's a modal and there are NO details at all (no title, etc.), show centered image
    if (isModal && !hasDetails) {
        return (
            <div className="flex items-center justify-center w-full h-full pointer-events-none">
                <div className="relative pointer-events-auto group">
                    <Image
                        src={painting.imageUrl}
                        alt="Opera d'arte"
                        className="object-contain max-h-[85vh] max-w-[90vw] w-auto h-auto rounded-md shadow-2xl"
                        priority
                    />
                    {/* Optional: Show title/sold status on hover or absolute if preferred, but user asked to hide details part */}
                    {painting.sold ? (
                        <div className="absolute bottom-4 right-4 bg-red-600/90 text-white px-4 py-2 rounded-full uppercase text-xs font-bold tracking-widest shadow-lg">
                            Venduto
                        </div>
                    ) : painting.price === null ? (
                        <ModalContactButton />
                    ) : null}
                </div>
            </div>
        );
    }

    // ...

    // Modal with info styling (Legacy match)
    if (isModal) {
        return (
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 w-full max-w-[95vw] lg:max-w-7xl mx-auto pointer-events-auto p-4">
                <div className="relative flex-1 flex items-center justify-center min-h-[50vh]">
                    <Image
                        src={painting.imageUrl}
                        alt={painting.title || "Opera d'arte"}
                        className="object-contain max-h-[85vh] w-auto h-auto rounded-md shadow-2xl drop-shadow-2xl"
                        priority
                    />
                </div>

                <div className="relative w-full md:w-[400px] lg:w-[450px] flex-shrink-0 bg-black/80 backdrop-blur-xl text-gray-300 p-8 rounded-xl shadow-2xl flex flex-col justify-center border border-white/10">
                    <ModalCloseButton />
                    {painting.title && (
                        <h3 className="text-3xl font-serif text-white mb-6 leading-tight">{painting.title}</h3>
                    )}

                    {painting.description && (
                        <div className="prose prose-invert prose-sm mb-8 text-gray-300 leading-relaxed opacity-90">
                            <p>{painting.description}</p>
                        </div>
                    )}

                    {painting.width && painting.height && (
                        <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
                            {painting.width} × {painting.height} cm
                        </p>
                    )}

                    <div className="mt-auto space-y-6">
                        {!painting.sold && (
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm uppercase tracking-widest text-gray-400">Prezzo</span>
                                <span className="text-2xl font-serif text-white">
                                    {painting.price !== null ? `€ ${painting.price.toFixed(2)}` : 'Su richiesta'}
                                </span>
                            </div>
                        )}

                        {painting.sold ? (
                            <div className="w-full bg-red-900/30 border border-red-500/30 text-red-200 text-center py-3 rounded-lg uppercase tracking-widest font-medium">
                                Venduto
                            </div>
                        ) : (
                            // Link to purchase (external or contact)
                            painting.externalLink ? (
                                <a
                                    href={painting.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-white text-black text-center py-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 uppercase tracking-widest text-sm shadow-lg hover:shadow-white/20"
                                >
                                    Acquista Ora
                                </a>
                            ) : (
                                <a
                                    href="/contatti"
                                    className="block w-full bg-white text-black text-center py-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 uppercase tracking-widest text-sm shadow-lg hover:shadow-white/20"
                                >
                                    Contattami
                                </a>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Standalone page styling - Premium & Immersive
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
            <div className="flex-grow flex flex-col lg:flex-row h-full">
                {/* Image Section - Centered and Large */}
                <div className="w-full lg:w-2/3 relative bg-stone-200 dark:bg-[#121212] min-h-[50vh] lg:min-h-screen flex items-center justify-center p-8 lg:p-12">
                    <div className="relative w-full h-[50vh] lg:h-full max-h-[85vh] flex items-center justify-center">
                        <Image
                            src={painting.imageUrl}
                            alt={painting.title || 'Opera d\'arte'}
                            fill
                            className="object-contain drop-shadow-2xl"
                            sizes="(max-width: 1024px) 100vw, 70vw"
                            priority
                        />
                    </div>
                </div>

                {/* Details Section - Elegant Typography */}
                <div className="w-full lg:w-1/3 bg-white dark:bg-stone-900 p-8 lg:p-16 flex flex-col justify-center shadow-2xl z-10">
                    <div className="max-w-md mx-auto w-full space-y-8">
                        <header>
                            <h1 className="text-4xl lg:text-5xl font-serif font-light text-stone-900 dark:text-stone-50 mb-4 leading-tight">
                                {painting.title || 'Senza Titolo'}
                            </h1>
                            <div className="h-1 w-20 bg-stone-900 dark:bg-stone-50 opacity-20"></div>
                        </header>

                        {painting.description && (
                            <div className="prose prose-stone dark:prose-invert prose-lg leading-relaxed text-stone-600 dark:text-stone-300 font-sans font-light">
                                <p>{painting.description}</p>
                            </div>
                        )}

                        <div className="space-y-2 py-6 border-t border-stone-200 dark:border-stone-800">
                            {painting.width && painting.height && (
                                <p className="text-sm uppercase tracking-widest text-stone-500 dark:text-stone-400">
                                    Dimensioni: {painting.width} × {painting.height} cm
                                </p>
                            )}
                            {!painting.sold && (
                                <p className="text-3xl font-serif text-stone-900 dark:text-stone-50">
                                    {painting.price !== null ? `€ ${painting.price.toFixed(2)}` : 'Prezzo su richiesta'}
                                </p>
                            )}
                        </div>

                        <div className="pt-4">
                            {painting.sold ? (
                                <span className="inline-block w-full text-center bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400 py-4 px-8 uppercase tracking-widest text-sm font-medium">
                                    Opera Venduta
                                </span>
                            ) : (
                                painting.externalLink ? (
                                    <a
                                        href={painting.externalLink!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900 py-4 px-8 uppercase tracking-widest text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Acquista
                                    </a>
                                ) : (
                                    <Link
                                        href="/contatti"
                                        className="block w-full text-center border border-stone-900 text-stone-900 dark:border-stone-50 dark:text-stone-50 py-4 px-8 uppercase tracking-widest text-sm font-medium hover:bg-stone-900 hover:text-white dark:hover:bg-stone-50 dark:hover:text-stone-900 transition-all duration-300"
                                    >
                                        Contattami per info
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
