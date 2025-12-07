'use client';

import { useEffect } from 'react';
import { RotateCw, AlertOctagon } from 'lucide-react';
import './globals.css'; // Import globals to ensure Tailwind works

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="it">
            <body className="bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-50 antialiased min-h-screen flex items-center justify-center p-4">
                <main className="flex flex-col items-center text-center max-w-lg w-full relative">

                    {/* Ambient Background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-100/20 dark:bg-red-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                    </div>

                    <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-2xl border border-stone-200 dark:border-stone-800 p-10 md:p-14 rounded-[2rem] shadow-2xl w-full">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-red-100 dark:ring-red-500/20 shadow-inner">
                            <AlertOctagon className="w-10 h-10 text-red-500 dark:text-red-400" />
                        </div>

                        <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-4 tracking-tight">
                            Errore Critico
                        </h1>

                        <p className="text-stone-600 dark:text-stone-400 mb-10 font-light text-lg leading-relaxed">
                            Si è verificato un errore irrecuperabile nell&apos;applicazione. <br className="hidden sm:block" />
                            Ci scusiamo per il disagio.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-full font-bold text-sm uppercase tracking-widest transition-transform hover:scale-105 hover:bg-amber-600 dark:hover:bg-amber-400 shadow-xl hover:shadow-amber-500/25"
                            >
                                <RotateCw className="w-5 h-5" />
                                Riprova
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 rounded-full font-bold text-sm uppercase tracking-widest transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                Ricarica Pagina
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-xs text-stone-400 font-mono">
                        Error Digest: {error.digest || 'N/A'}
                    </div>
                </main>
            </body>
        </html>
    );
}
