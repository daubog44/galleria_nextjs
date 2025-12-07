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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <JsonLd data={jsonLd} />
            <div className="text-center mb-16">
                <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
                    Contatti
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Per informazioni sulle opere, collaborazioni o semplicemente per un saluto, non esitare a contattarmi attraverso i canali sottostanti.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Email */}
                {setting.email && (
                    <a
                        href={`mailto:${setting.email}`}
                        className="flex flex-col items-center p-8 bg-white dark:bg-neutral-900/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200 dark:border-neutral-800 group"
                    >
                        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Mail className="w-8 h-8 text-neutral-900 dark:text-white" />
                        </div>
                        <h3 className="text-xl font-serif font-medium text-gray-900 dark:text-white mb-2">Email</h3>
                        <span className="text-gray-600 dark:text-gray-400">{setting.email}</span>
                    </a>
                )}

                {/* Phone */}
                {setting.phone && (
                    <a
                        href={`tel:${setting.phone}`}
                        className="flex flex-col items-center p-8 bg-white dark:bg-neutral-900/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200 dark:border-neutral-800 group"
                    >
                        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Phone className="w-8 h-8 text-neutral-900 dark:text-white" />
                        </div>
                        <h3 className="text-xl font-serif font-medium text-gray-900 dark:text-white mb-2">Telefono</h3>
                        <span className="text-gray-600 dark:text-gray-400">{setting.phone}</span>
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
                            className="flex flex-col items-center p-8 bg-white dark:bg-neutral-900/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200 dark:border-neutral-800 group"
                        >
                            <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Icon className="w-8 h-8 text-neutral-900 dark:text-white" />
                            </div>
                            <h3 className="text-xl font-serif font-medium text-gray-900 dark:text-white mb-2">{link.label}</h3>
                            <span className="text-gray-600 dark:text-gray-400">{link.label}</span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
