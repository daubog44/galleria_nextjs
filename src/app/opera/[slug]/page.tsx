
import PaintingDetail from '@/components/PaintingDetail';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { db } from "@/db";
import { paintings } from "@/db/schema";
import { eq } from 'drizzle-orm';

// Helper to check if string is numeric ID
function isNumeric(str: string) {
    return /^\d+$/.test(str);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    // 1. Try finding by slug
    let paintingPart = await db.select().from(paintings).where(eq(paintings.slug, slug)).limit(1);

    // 2. Fallback to ID if numeric
    if (paintingPart.length === 0 && isNumeric(slug)) {
        paintingPart = await db.select().from(paintings).where(eq(paintings.id, parseInt(slug))).limit(1);
    }

    if (paintingPart.length === 0) return {};

    const painting = paintingPart[0];

    return {
        title: painting.seoTitle || painting.title || "Opera",
        description: painting.seoDescription || painting.description || "Dettaglio opera",
        openGraph: {
            title: painting.seoTitle || painting.title || 'Opera',
            description: painting.seoDescription || painting.description || '',
            images: [painting.imageUrl],
        }
    };
}

export async function generateStaticParams() {
    const allPaintings = await db.select({ id: paintings.id, slug: paintings.slug }).from(paintings);

    const params = [];
    for (const p of allPaintings) {
        // Support ID (legacy/canonical)
        params.push({ slug: p.id.toString() });
        // Support Slug
        if (p.slug) {
            params.push({ slug: p.slug });
        }
    }
    return params;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // 1. Try finding by slug
    let paintingResults = await db.select().from(paintings).where(eq(paintings.slug, slug)).limit(1);

    // 2. Fallback to ID if not found and input looks like ID
    if (paintingResults.length === 0 && isNumeric(slug)) {
        paintingResults = await db.select().from(paintings).where(eq(paintings.id, parseInt(slug))).limit(1);

        // Optional: Redirect if slug exists
        const p = paintingResults[0];
        if (p && p.slug) {
            redirect(`/opera/${p.slug}`);
        }
    }

    if (paintingResults.length === 0) {
        notFound();
    }

    const painting = paintingResults[0];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: painting.seoTitle || painting.title || 'Opera',
        description: painting.seoDescription || painting.description || 'Dettaglio opera',
        image: painting.imageUrl,
        offers: {
            '@type': 'Offer',
            price: painting.price,
            priceCurrency: 'EUR',
            availability: painting.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/opera/${painting.slug || painting.id}`,
            seller: {
                '@type': 'Organization',
                name: 'Galleria'
            }
        }
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <PaintingDetail id={painting.id} />
        </>
    );
}
