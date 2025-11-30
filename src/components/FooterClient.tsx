'use client';

import { usePathname } from 'next/navigation';
import { Mail, Phone, Instagram, Facebook, MessageCircle, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

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

export default function FooterClient({ settings, links }: { settings: any, links: any[] }) {
    const currentYear = new Date().getFullYear();
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-[#222] text-white py-16 mt-20 dark:bg-[#111]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <p className="text-[#aaa] text-sm">
                        &copy; {currentYear} Galleria Ermetica. Tutti i diritti riservati.
                    </p>
                </div>

                <div className="flex items-center space-x-6">
                    {links.map((link) => {
                        const Icon = ICONS[link.icon as keyof typeof ICONS] || Globe;
                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-[#c8a876] transition-colors duration-300"
                                aria-label={link.label}
                            >
                                <Icon className="w-6 h-6" />
                            </a>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center md:items-end space-y-2 text-[#aaa] text-sm">
                    {settings.phone && (
                        <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${settings.phone}`} className="hover:text-[#c8a876] transition-colors">
                                {settings.phone}
                            </a>
                        </p>
                    )}
                    {settings.email && (
                        <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${settings.email}`} className="hover:text-[#c8a876] transition-colors">
                                {settings.email}
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
}
