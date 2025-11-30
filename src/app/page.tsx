import { getPaintings } from "./actions";
import Gallery from "@/components/Gallery";

import { getPageSeo } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';

export async function generateMetadata() {
  const seo = await getPageSeo('home');
  return {
    title: seo?.title || "Galleria",
    description: seo?.description || "Galleria d'arte online",
  };
}

export default async function Home() {
  const { data: initialPaintings } = await getPaintings(1, 12);
  const seo = await getPageSeo('home');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seo?.title || 'Galleria',
    description: seo?.description || 'Galleria d\'arte',
    url: process.env.NEXT_PUBLIC_SITE_URL,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={jsonLd} />
      <h1 className="text-4xl font-light text-center mb-12 tracking-widest uppercase font-serif">Galleria</h1>
      <Gallery initialPaintings={initialPaintings} />
    </div>
  );
}
