export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md transition-all duration-500">
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-20 h-20 rounded-full border-4 border-stone-200 dark:border-stone-800 opacity-30"></div>

                {/* Spinning Ring */}
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>

                {/* Logo/Center Dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-stone-900 dark:bg-stone-100 rounded-full animate-pulse"></div>

                {/* Loading Text */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-serif uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 animate-pulse">
                        Caricamento
                    </span>
                </div>
            </div>
        </div>
    );
}
