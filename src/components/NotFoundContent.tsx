'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundContent() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 p-4 overflow-hidden relative selection:bg-amber-200 dark:selection:bg-amber-900/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-200/20 dark:bg-amber-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-100/30 dark:bg-rose-900/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10 text-center max-w-md w-full">
                {/* 404 Display */}
                <h1 className="text-[10rem] leading-none font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-stone-300 to-stone-100 dark:from-stone-800 dark:to-stone-900 select-none drop-shadow-sm">
                    404
                </h1>

                <div className="space-y-6 -mt-10">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50">
                        Pagina non trovata
                    </h2>

                    <p className="text-stone-600 dark:text-stone-400 font-light text-lg">
                        Sembra che l&apos;opera che stai cercando sia stata spostata o non sia mai esistita.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-full font-medium transition-transform hover:scale-105 hover:bg-amber-600 dark:hover:bg-amber-400 shadow-lg hover:shadow-amber-500/25"
                        >
                            <Home className="w-4 h-4" />
                            Torna alla Home
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-full font-medium transition-all hover:bg-white dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Indietro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
