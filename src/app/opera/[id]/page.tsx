import PaintingDetail from '@/components/PaintingDetail';
import { getPainting } from '@/app/actions';


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const painting = await getPainting(id);
    if (!painting) return {};

    return {
        title: painting.seoTitle || painting.title || "Opera",
        description: painting.seoDescription || painting.description || "Dettaglio opera",
        openGraph: {
            images: [painting.imageUrl],
        }
    };
}

import { JsonLd } from '@/components/JsonLd';

import { db } from "@/db";
import { paintings } from "@/db/schema";

export async function generateStaticParams() {
    const allPaintings = await db.select({ id: paintings.id }).from(paintings);
    return allPaintings.map((painting) => ({
        id: painting.id.toString(),
    }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const painting = await getPainting(id);

    if (!painting) return <PaintingDetail id={id} />;

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
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/opera/${id}`,
            seller: {
                '@type': 'Organization',
                name: 'Galleria'
            }
        }
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <PaintingDetail id={id} />
        </>
    );
}
