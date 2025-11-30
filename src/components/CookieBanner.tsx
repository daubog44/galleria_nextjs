'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-lg transition-all duration-500 ease-in-out transform translate-y-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-stone-600 dark:text-stone-300 text-center md:text-left">
                    <p>
                        Questo sito utilizza cookie tecnici e di analisi anonima per garantire la migliore esperienza di navigazione.
                        Per maggiori informazioni, consulta la nostra{' '}
                        <Link href="/cookie-policy" className="underline hover:text-stone-900 dark:hover:text-white transition-colors">
                            Cookie Policy
                        </Link>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={declineCookies}
                        className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
                    >
                        Rifiuta
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-4 py-2 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-md transition-colors shadow-sm"
                    >
                        Accetta
                    </button>
                </div>
            </div>
        </div>
    );
}
