'use client';

import React from 'react';
import ReviewCard, { ReviewData } from './ReviewCard';

export default function ReviewsGrid({ reviews }: { reviews: ReviewData[] }) {
    return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8 p-1">
            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            {reviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
            ))}
        </div>
    );
}
