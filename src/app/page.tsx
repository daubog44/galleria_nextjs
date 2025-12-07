
import { getPaintings } from "./actions";
import Gallery from '@/components/Gallery';

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
            Galleria
          </h1>
          <div className="w-24 h-1 bg-amber-400/50 mx-auto mb-10 rounded-full"></div>
          <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 font-light font-sans max-w-2xl mx-auto leading-relaxed text-balance">
            {seo?.subtitle || seo?.description || "Esplora la collezione completa delle opere, un viaggio attraverso colori ed emozioni."}
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
        <Gallery initialPaintings={initialPaintings} />
      </main>
    </div>
  );
}
