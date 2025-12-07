'use client';

import { useEffect } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-100/20 dark:bg-red-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-100 dark:ring-red-500/20">
                    <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>

                <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-4">
                    Qualcosa non ha funzionato
                </h2>

                <p className="text-stone-600 dark:text-stone-400 mb-8 font-light">
                    Si è verificato un errore inaspettato. Stiamo lavorando per risolverlo.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-full font-medium transition-transform hover:scale-105 hover:bg-amber-600 dark:hover:bg-amber-400 shadow-lg hover:shadow-amber-500/25"
                    >
                        <RotateCw className="w-4 h-4" />
                        Riprova
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-full font-medium transition-colors hover:bg-stone-50 dark:hover:bg-stone-700"
                    >
                        Torna alla Home
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-stone-100 dark:bg-stone-950 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-red-600 dark:text-red-400 border border-stone-200 dark:border-red-900/30">
                        {error.message}
                        {error.digest && <div className="mt-2 text-stone-400">Digest: {error.digest}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
