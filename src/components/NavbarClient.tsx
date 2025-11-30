'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    // const [isOpen, setIsOpen] = useState(false);
    // const [isDark, setIsDark] = useState(false);
    // const pathname = usePathname();

    // useEffect(() => {
    //     // Check initial theme
    //     if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //         setIsDark(true);
    //         document.documentElement.classList.add('dark');
    //     } else {
    //         setIsDark(false);
    //         document.documentElement.classList.remove('dark');
    //     }
    // }, []);

    // const toggleTheme = () => {
    //     if (isDark) {
    //         document.documentElement.classList.remove('dark');
    //         localStorage.theme = 'light';
    //         setIsDark(false);
    //     } else {
    //         document.documentElement.classList.add('dark');
    //         localStorage.theme = 'dark';
    //         setIsDark(true);
    //     }
    // };

    // const navLinks = [
    //     { name: 'Galleria', href: '/' },
    //     { name: 'Biografia', href: '/biografia' },
    //     { name: 'Dicono di me', href: '/stile' },
    //     { name: 'Contatti', href: '/contatti' },
    // ];

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:bg-[#1a1a1a]/80 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="font-serif text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Galleria <span className="text-[#c8a876] font-light">Ermetica</span>
                            </span>
                        </Link>
                    </div>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {/* Links commented out */}
                    </div>
                </div>
            </div>
        </nav>
    );
}
