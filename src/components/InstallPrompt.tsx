'use client';

import { useEffect, useState } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

interface InstallPromptProps {
    siteTitle?: string;
}

export default function InstallPrompt({ siteTitle }: InstallPromptProps) {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsStandalone(isStandaloneMode);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsIOS(isIosDevice);

        if (isStandaloneMode) return;

        // Handle Android/Desktop beforeinstallprompt
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show iOS prompt with a delay
        if (isIosDevice) {
            setTimeout(() => {
                setIsVisible(true);
            }, 1000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Register basic service worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => console.log('Scope: ', registration.scope))
                .catch((err) => console.log('SW Registration failed: ', err));
        }
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (isStandalone || !isVisible) return null;

    // Use default title if prop is not provided
    const displayTitle = siteTitle || "Galleria Ermetica";

    return (
        <div className="fixed bottom-6 left-6 right-6 z-[100] md:max-w-md md:left-auto p-5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col gap-4 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-50 leading-tight">
                        Installa {displayTitle}
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                        Aggiungi l&apos;app alla Home per un&apos;esperienza a schermo intero, più fluida e veloce.
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-2 -mr-2 -mt-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500 dark:text-stone-400"
                    aria-label="Chiudi"
                >
                    <X size={20} />
                </button>
            </div>

            {isIOS ? (
                <div className="flex flex-col gap-3 text-sm text-stone-700 dark:text-stone-300 bg-stone-100/50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700/50">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">1</span>
                        <span>Tocca il tasto Condividi <Share className="w-4 h-4 inline mx-1 text-blue-500" /></span>
                    </div>
                    <div className="w-px h-3 bg-stone-300 dark:bg-stone-700 ml-3"></div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full text-xs font-bold">2</span>
                        <span>Seleziona <span className="font-semibold">&quot;Aggiungi a Home&quot;</span> <PlusSquare className="w-4 h-4 inline mx-1" /></span>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    className="w-full bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 font-medium py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                >
                    Installa Applicazione
                </button>
            )}
        </div>
    );
}
