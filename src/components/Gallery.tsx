'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import PaintingCard from './PaintingCard';
import MasonryGrid from './MasonryGrid';
import { getPaintings } from '@/app/actions';

interface Painting {
    id: number;
    title: string | null;
    imageUrl: string;
    price: number | null;
    sold: boolean;
}

interface GalleryProps {
    initialPaintings: Painting[];
}

export default function Gallery({ initialPaintings }: GalleryProps) {
    const [paintings, setPaintings] = useState<Painting[]>(initialPaintings);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { ref, inView } = useInView();

    const loadMorePaintings = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const nextPage = page + 1;
            const { data, hasMore: moreAvailable } = await getPaintings(nextPage, 12);

            setPaintings((prev) => {
                // Strict filtering: Only add items that don't already exist in the state
                const newItems = data.filter(newItem => !prev.some(existingItem => existingItem.id === newItem.id));
                return [...prev, ...newItems];
            });
            setPage(nextPage);
            setHasMore(moreAvailable);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            loadMorePaintings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, hasMore, isLoading]);

    return (
        <>
            <MasonryGrid
                items={paintings.map((painting, index) => (
                    <PaintingCard key={painting.id} painting={painting} priority={index < 6} />
                ))}
            />

            {hasMore && (
                <div ref={ref} className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                </div>
            )}
        </>
    );
}
