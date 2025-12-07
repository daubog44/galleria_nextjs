import React from 'react';
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Metadata } from "next";

import { getPageSeo } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { unstable_cache } from 'next/cache';
import ReviewsGrid from '@/components/ReviewsGrid';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getPageSeo('reviews');
    return {
        title: seo?.title || "Dicono di me - Recensioni",
        description: seo?.description || "Leggi le recensioni e gli articoli sulla mia arte.",
    };
}

export const dynamic = 'force-static';

const getReviews = unstable_cache(
    async () => {
        try {
            return await db.select().from(reviews).orderBy(desc(reviews.id));
        } catch (error) {
            console.warn("Database connection failed in Style page (expected during build):", error);
            return [];
        }
    },
    ['reviews-list'],
    { tags: ['style'] }
);

export default async function StylePage() {

    const allReviews = await getReviews();
    const seo = await getPageSeo('reviews');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seo?.title || 'Dicono di me',
        description: seo?.description || 'Recensioni e articoli',
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: allReviews.map((item, index) => ({
                '@type': 'BlogPosting',
                position: index + 1,
                headline: item.title,
                articleBody: item.content,
                author: {
                    '@type': 'Person',
                    name: item.author
                },
                datePublished: item.date,
                image: item.imageUrl ? `${process.env.NEXT_PUBLIC_SITE_URL}${item.imageUrl}` : undefined
            }))
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] bg-stone-50 dark:bg-stone-950 transition-colors duration-500 selection:bg-amber-200 dark:selection:bg-amber-900/30">
            <JsonLd data={jsonLd} />

            {/* Header Section with subtle background pattern */}
            <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shrink-0">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {/* Soft ambient glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-gradient-to-b from-amber-100/60 to-transparent dark:from-amber-900/10 rounded-full blur-[100px] opacity-70"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-8 tracking-tighter drop-shadow-sm">
                        Dicono di me
                    </h1>
                    <div className="w-24 h-1 bg-amber-400/50 mx-auto mb-10 rounded-full"></div>
                    <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 font-light font-sans max-w-2xl mx-auto leading-relaxed text-balance">
                        {seo?.subtitle || seo?.description || "Recensioni, articoli e pensieri sulla mia arte raccolti nel tempo."}
                    </p>
                </div>
            </div>

            <main className="flex-grow max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
                <ReviewsGrid reviews={allReviews} />
            </main>
        </div>
    );
}

