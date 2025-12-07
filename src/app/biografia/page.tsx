

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
        <>
            <JsonLd data={jsonLd} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="w-full md:w-1/3 relative aspect-[3/4] bg-gray-100 dark:bg-[#2a2a2a] rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src={imageUrl}
                            alt="Foto dell'artista"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>
                    {/* imports needed at top */}
                    <div className="w-full md:w-2/3">
                        <h1 className="text-4xl font-light mb-8 uppercase tracking-widest dark:text-white">Biografia</h1>
                        <div className="prose prose-lg text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                        <div className="mt-12">
                            <Link href="/contatti" className="inline-block bg-black text-white py-3 px-8 uppercase tracking-widest hover:bg-gray-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                Contattami
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
