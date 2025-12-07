import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { JsonLd } from '@/components/JsonLd';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-static';

const getReview = unstable_cache(
    async (slug: string) => {
        try {
            const result = await db.select().from(reviews).where(eq(reviews.slug, slug)).limit(1);
            return result[0];
        } catch (error) {
            console.warn(`Database connection failed in Review page for slug ${slug}:`, error);
            return null;
        }
    },
    ['review-detail'],
    { tags: ['style'] }
);

export async function generateStaticParams() {
    try {
        const allReviews = await db.select({ slug: reviews.slug }).from(reviews);
        return allReviews
            .filter(r => r.slug)
            .map((review) => ({
                slug: review.slug,
            }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const review = await getReview(slug);

    if (!review) {
        return {
            title: 'Recensione non trovata',
        };
    }

    return {
        title: review.seoTitle || review.title,
        description: review.seoDescription || review.content.substring(0, 160),
        openGraph: {
            title: review.seoTitle || review.title || undefined,
            description: review.seoDescription || review.content.substring(0, 160),
            images: review.imageUrl ? [review.imageUrl] : undefined,
            type: 'article',
            publishedTime: review.date || undefined,
            authors: review.author ? [review.author] : undefined,
        },
    };
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const review = await getReview(slug);

    if (!review) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: review.seoTitle || review.title,
        description: review.seoDescription || review.content.substring(0, 160),
        articleBody: review.content,
        author: {
            '@type': 'Person',
            name: review.author
        },
        datePublished: review.date,
        image: review.imageUrl ? `${process.env.NEXT_PUBLIC_SITE_URL}${review.imageUrl}` : undefined
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] bg-stone-50 dark:bg-stone-950 transition-colors duration-500 selection:bg-amber-200 dark:selection:bg-amber-900/30">
            <JsonLd data={jsonLd} />

            <article className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20">
                <Link
                    href="/stile"
                    className="inline-flex items-center text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Torna a Dicono di me
                </Link>

                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium mb-4 uppercase tracking-widest">
                        <span>{review.type === 'article' ? 'Articolo' : 'Recensione'}</span>
                        {review.date && (
                            <>
                                <span className="w-1 h-1 bg-current rounded-full" />
                                <span>{review.date}</span>
                            </>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-6 leading-tight text-balance">
                        {review.title}
                    </h1>

                    <div className="flex flex-col items-center gap-2 text-stone-600 dark:text-stone-400 mx-auto max-w-xl">
                        {review.author && (
                            <p className="font-medium text-lg italic font-serif">
                                di {review.author}
                            </p>
                        )}
                        {review.source && (
                            <p className="text-sm opacity-80 uppercase tracking-wider">
                                {review.source}
                            </p>
                        )}
                    </div>
                </header>

                {review.imageUrl && (
                    <div className="relative w-full aspect-video mb-12 rounded-xl overflow-hidden shadow-xl bg-stone-200 dark:bg-stone-900/50">
                        <Image
                            src={review.imageUrl}
                            alt={review.seoAltText || review.title || 'Immagine della recensione'}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        />
                    </div>
                )}

                <div className="prose prose-lg prose-stone dark:prose-invert mx-auto prose-img:rounded-xl prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-stone-50 prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-a:text-amber-600 dark:prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown>{review.content}</ReactMarkdown>
                </div>
            </article>
        </div>
    );
}
