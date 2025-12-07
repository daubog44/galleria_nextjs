import Image from 'next/image';
import Link from 'next/link';
import { shimmer, toBase64 } from '@/lib/image';

interface Painting {
    id: number;
    title: string | null;
    imageUrl: string;
    price: number | null;
    sold: boolean;
}

export default function PaintingCard({ painting, priority = false }: { painting: Painting; priority?: boolean }) {
    return (
        <Link href={`/opera/${painting.id}`} scroll={false} className="group block relative mb-8 break-inside-avoid rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-black/60 transition-all duration-500 hover:-translate-y-1">
            <div className="relative w-full overflow-hidden">
                <Image
                    src={painting.imageUrl}
                    alt={painting.title || 'Opera d\'arte'}
                    width={800}
                    height={1000}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    preload={priority}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 1000))}`}
                />

                {/* Elegant Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out flex flex-col justify-end p-6">
                    {painting.title && (
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                            <h3 className="text-2xl font-serif font-medium text-white mb-2 leading-tight drop-shadow-md tracking-wide">{painting.title}</h3>
                            <div className="flex items-center justify-between">
                                {painting.sold ? (
                                    <span className="inline-block px-3 py-1 bg-red-500/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest rounded-full">Venduto</span>
                                ) : (
                                    painting.price !== null && <p className="text-lg font-light text-amber-100 italic font-serif">€ {painting.price.toFixed(2)}</p>
                                )}
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 text-white/80 text-sm uppercase tracking-widest font-bold">Vedi opera &rarr;</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
