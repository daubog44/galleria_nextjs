import React from 'react';
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Metadata } from "next";
import Image from 'next/image';

import { getPageSeo } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import MarkdownViewer from '@/components/MarkdownViewer';
import { unstable_cache } from 'next/cache';

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
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] transition-colors duration-300">
            <JsonLd data={jsonLd} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Dicono di me
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
                        Recensioni, articoli e pensieri sulla mia arte raccolti nel tempo.
                    </p>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {allReviews.map((item) => (
                        <div
                            key={item.id}
                            className="break-inside-avoid bg-white dark:bg-neutral-900/50 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                        >
                            {item.imageUrl && (
                                <div className="relative w-full h-48 overflow-hidden">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title || 'Immagine articolo'}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}

                            <div className="p-8 flex flex-col h-full">
                                <h3 className="text-xl font-serif font-semibold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-[#c8a876] transition-colors">
                                    {item.title}
                                </h3>

                                <div className="flex flex-wrap items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 space-x-2 uppercase tracking-wide">
                                    <span className="text-[#c8a876]">{item.author}</span>
                                    {item.source && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-700">•</span>
                                            <span className="italic">{item.source}</span>
                                        </>
                                    )}
                                    {item.date && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-700">•</span>
                                            <span>{item.date}</span>
                                        </>
                                    )}
                                </div>

                                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                    <MarkdownViewer content={item.content} />
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300">
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

