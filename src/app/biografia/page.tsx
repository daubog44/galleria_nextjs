

import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import { db } from "@/db";
import { biography } from "@/db/schema";

import { getPageSeo } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import ReactMarkdown from 'react-markdown';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getPageSeo('biography');
    return {
        title: seo?.title || "Biografia - Galleria",
        description: seo?.description || "Scopri la storia e il percorso artistico.",
    };
}

import { unstable_cache } from 'next/cache';

export const dynamic = 'force-static';

import { getBiographyContent } from '@/lib/sitedata';

const getBiography = unstable_cache(
    async () => {
        try {
            const bio = await db.select().from(biography).limit(1);
            let content = await getBiographyContent();

            // Fallback to DB if file empty/missing
            if (!content && bio.length > 0) {
                content = bio[0]?.content || "Biografia non disponibile.";
            } else if (!content) {
                content = "Biografia non disponibile.";
            }

            return {
                content: content,
                imageUrl: bio[0]?.imageUrl || "/sitedata/autore_foto.jpg"
            };
        } catch (error) {
            console.error("RUNTIME DB ERROR in Biography:", error);
            return {
                content: "Biografia non disponibile.",
                imageUrl: "/sitedata/autore_foto.jpg"
            };
        }
    },
    ['biography-data'],
    { tags: ['biography'] }
);

export default async function Biography() {
    const { content, imageUrl } = await getBiography();
    const seo = await getPageSeo('biography');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            '@type': 'Person',
            name: 'Artista',
            description: seo?.description || 'Biografia dell\'artista',
            image: imageUrl
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] bg-stone-50 dark:bg-stone-950 transition-colors duration-500 selection:bg-amber-200 dark:selection:bg-amber-900/30">
            <JsonLd data={jsonLd} />

            {/* Header Section */}
            <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shrink-0">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-gradient-to-b from-amber-100/60 to-transparent dark:from-amber-900/10 rounded-full blur-[100px] opacity-70"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-8 tracking-tighter drop-shadow-sm">
                        {seo?.h1 || "Biografia"}
                    </h1>
                    <div className="w-24 h-1 bg-amber-400/50 mx-auto mb-10 rounded-full"></div>
                    {seo?.subtitle && (
                        <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 font-light font-sans max-w-2xl mx-auto leading-relaxed text-balance">
                            {seo.subtitle}
                        </p>
                    )}
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
                    {/* Image Column */}
                    <div className="w-full md:w-5/12 lg:w-4/12 relative group">
                        <div className="absolute -inset-4 bg-amber-100/50 dark:bg-amber-900/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative aspect-[3/4] bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-2xl shadow-stone-200/50 dark:shadow-black/50 border border-stone-100 dark:border-white/5 transform transition-transform duration-500 hover:scale-[1.02]">
                            <Image
                                src={imageUrl}
                                alt="Foto dell'artista"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="w-full md:w-7/12 lg:w-8/12">
                        <div className="prose prose-stone dark:prose-invert prose-lg md:prose-xl leading-relaxed text-stone-600 dark:text-stone-300 font-light font-sans">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>

                        <div className="mt-16 pt-8 border-t border-stone-200 dark:border-white/10">
                            <Link href="/contatti" className="inline-flex items-center gap-3 bg-stone-900 text-stone-50 py-4 px-10 rounded-full uppercase tracking-widest text-sm font-bold hover:bg-amber-600 transition-all duration-300 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-amber-400 group shadow-lg hover:shadow-amber-500/20">
                                Contattami
                                <span className="transform transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
