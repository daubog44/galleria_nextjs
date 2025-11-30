import Image from 'next/image';
import Link from 'next/link';

interface Painting {
    id: number;
    title: string | null;
    imageUrl: string;
    price: number | null;
    sold: boolean;
}

export default function PaintingCard({ painting }: { painting: Painting }) {
    return (
        <Link href={`/opera/${painting.id}`} scroll={false} className="group block relative mb-6 break-inside-avoid rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="relative w-full">
                <Image
                    src={painting.imageUrl}
                    alt={painting.title || 'Opera d\'arte'}
                    width={800}
                    height={1000} // Aspect ratio is handled by w-full h-auto in CSS usually, but Next.js needs width/height. 
                    // Since we don't have exact dimensions in DB yet, we use a placeholder aspect or style="width: 100%; height: auto"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {painting.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                        <h3 className="text-xl font-light tracking-wide mb-1 font-serif">{painting.title}</h3>
                        {painting.sold ? (
                            <span className="text-sm font-medium text-red-400 uppercase tracking-wider">Venduto</span>
                        ) : (
                            painting.price !== null && <p className="text-sm font-light text-amber-200">€ {painting.price.toFixed(2)}</p>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
