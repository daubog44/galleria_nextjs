'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

export default function Navbar({ siteTitle = 'Galleria Ermetica' }: { siteTitle?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    const navLinks = [
        { name: 'Galleria', href: '/' },
        { name: 'Biografia', href: '/biografia' },
        { name: 'Dicono di me', href: '/stile' },
        { name: 'Contatti', href: '/contatti' },
    ];

    // Dynamic title styling: Last word colored and lighter
    const titleParts = siteTitle.trim().split(' ');
    const lastWord = titleParts.length > 1 ? titleParts.pop() : '';
    const firstPart = titleParts.join(' ');

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Hide navbar on admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:bg-[#1a1a1a]/80 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="font-serif text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {firstPart} {lastWord && <span className="text-[#c8a876] font-light">{lastWord}</span>}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium uppercase tracking-wider transition-colors duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#c8a876] after:transition-all after:duration-300 hover:after:w-full ${pathname === link.href
                                    ? 'text-[#c8a876] after:w-full'
                                    : 'text-gray-600 hover:text-[#c8a876] dark:text-gray-300 dark:hover:text-[#c8a876]'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-600 hover:text-[#c8a876] dark:text-gray-300 dark:hover:text-[#c8a876] transition-colors focus:outline-none"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-600 hover:text-[#c8a876] dark:text-gray-300 dark:hover:text-[#c8a876] transition-colors focus:outline-none"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-[#c8a876] dark:text-gray-300 dark:hover:text-[#c8a876] focus:outline-none"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon when menu is closed */}
                            <svg
                                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* Icon when menu is open */}
                            <svg
                                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md z-50 overflow-y-auto transition-all duration-300 border-t border-gray-100 dark:border-gray-800`}>
                <div className="flex flex-col items-center justify-center h-full space-y-8 pb-20">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`text-2xl font-serif font-medium uppercase tracking-widest transition-colors duration-300 ${pathname === link.href
                                ? 'text-[#c8a876]'
                                : 'text-gray-800 dark:text-gray-200 hover:text-[#c8a876] dark:hover:text-[#c8a876]'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
