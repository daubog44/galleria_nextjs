import { Metadata } from "next";
import { Mail, Phone, Instagram, Facebook, MessageCircle, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

import { getPageSeo } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { getSettings, getExternalLinks } from "@/app/actions";

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getPageSeo('contact');
    return {
        title: seo?.title || "Contatti - Galleria",
        description: seo?.description || "Contattami per informazioni e acquisti.",
    };
}

const ICONS = {
    instagram: Instagram,
    facebook: Facebook,
    whatsapp: MessageCircle,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    globe: Globe,
    mail: Mail,
    phone: Phone,
};

export const dynamic = 'force-static';

export default async function Contact() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setting: any = await getSettings();
    const links = await getExternalLinks();
    const seo = await getPageSeo('contact');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: seo?.title || 'Contatti',
        description: seo?.description || 'Contattami',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/contatti`,
        mainEntity: {
            '@type': 'Person',
            name: 'Artista',
            email: setting.email,
            telephone: setting.phone,
            sameAs: links.map(l => l.url)
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
                        Contatti
                    </h1>
                    <div className="w-24 h-1 bg-amber-400/50 mx-auto mb-10 rounded-full"></div>
                    <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-400 font-light font-sans max-w-2xl mx-auto leading-relaxed text-balance">
                        {seo?.subtitle || seo?.description || "Per informazioni, collaborazioni o appuntamenti in galleria, non esitare a contattarmi."}
                    </p>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Email */}
                    {setting.email && (
                        <a
                            href={`mailto:${setting.email}`}
                            className="group flex flex-col items-center p-10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 transition-all duration-500 border border-stone-100 dark:border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10 p-5 bg-white dark:bg-neutral-800 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm group-hover:shadow-md ring-1 ring-stone-100 dark:ring-white/10">
                                <Mail className="w-8 h-8 text-stone-700 dark:text-indigo-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors duration-300" />
                            </div>
                            <h3 className="relative z-10 text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">Email</h3>
                            <span className="relative z-10 text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors">{setting.email}</span>
                        </a>
                    )}

                    {/* Phone */}
                    {setting.phone && (
                        <a
                            href={`tel:${setting.phone}`}
                            className="group flex flex-col items-center p-10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 transition-all duration-500 border border-stone-100 dark:border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10 p-5 bg-white dark:bg-neutral-800 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm group-hover:shadow-md ring-1 ring-stone-100 dark:ring-white/10">
                                <Phone className="w-8 h-8 text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors duration-300" />
                            </div>
                            <h3 className="relative z-10 text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">Telefono</h3>
                            <span className="relative z-10 text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors">{setting.phone}</span>
                        </a>
                    )}

                    {/* Dynamic Links */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {links.map((link: any) => {
                        const Icon = ICONS[link.icon as keyof typeof ICONS] || Globe;
                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center p-10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 transition-all duration-500 border border-stone-100 dark:border-white/5 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10 p-5 bg-white dark:bg-neutral-800 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm group-hover:shadow-md ring-1 ring-stone-100 dark:ring-white/10">
                                    <Icon className="w-8 h-8 text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors duration-300" />
                                </div>
                                <h3 className="relative z-10 text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">{link.label}</h3>
                                <span className="relative z-10 text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden">Vai al link →</span>
                            </a>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
