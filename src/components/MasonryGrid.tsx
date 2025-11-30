'use client';

import { ReactNode, useEffect, useState } from 'react';

interface MasonryGridProps {
    items: ReactNode[];
    columns?: number;
}

export default function MasonryGrid({ items, columns = 3 }: MasonryGridProps) {
    const [columnCount, setColumnCount] = useState(1);

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1024) {
                setColumnCount(3);
            } else if (window.innerWidth >= 640) {
                setColumnCount(2);
            } else {
                setColumnCount(1);
            }
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Distribute items into columns
    const gridColumns: ReactNode[][] = Array.from({ length: columnCount }, () => []);

    items.forEach((item, index) => {
        gridColumns[index % columnCount].push(item);
    });

    return (
        <div className="flex gap-6">
            {gridColumns.map((col, colIndex) => (
                <div key={colIndex} className="flex-1 flex flex-col gap-6">
                    {col.map((item, itemIndex) => (
                        <div key={itemIndex}>{item}</div>
                    ))}
                </div>
            ))}
        </div>
    );
}
